using Maintenance_System.Data;
using Maintenance_System.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CloudinaryDotNet;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL") ?? Environment.GetEnvironmentVariable("PGURL");
var pgHost = Environment.GetEnvironmentVariable("PGHOST");

if (!string.IsNullOrEmpty(databaseUrl) && (databaseUrl.StartsWith("postgres://") || databaseUrl.StartsWith("postgresql://")))
{
    var databaseUri = new Uri(databaseUrl);
    var userInfo = databaseUri.UserInfo.Split(':');
    var username = userInfo[0];
    var password = userInfo.Length > 1 ? userInfo[1] : "";
    var host = databaseUri.Host;
    var port = databaseUri.Port;
    var databaseName = databaseUri.AbsolutePath.TrimStart('/');
    connectionString = $"Host={host};Port={port};Database={databaseName};Username={username};Password={password};SslMode=Require;TrustServerCertificate=true;";
}
else if (!string.IsNullOrEmpty(pgHost))
{
    var pgPort = Environment.GetEnvironmentVariable("PGPORT") ?? "5432";
    var pgDatabase = Environment.GetEnvironmentVariable("PGDATABASE") ?? "postgres";
    var pgUser = Environment.GetEnvironmentVariable("PGUSER") ?? "postgres";
    var pgPassword = Environment.GetEnvironmentVariable("PGPASSWORD") ?? "";
    connectionString = $"Host={pgHost};Port={pgPort};Database={pgDatabase};Username={pgUser};Password={pgPassword};SslMode=Require;TrustServerCertificate=true;";
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
);

var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;
var jwtKey = builder.Configuration["Jwt:SecretKey"]!;

var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

var cloudinaryAccount = new Account(
    builder.Configuration["Cloudinary:CloudName"],
    builder.Configuration["Cloudinary:ApiKey"],
    builder.Configuration["Cloudinary:ApiSecret"]
);

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,

            ValidateAudience = true,
            ValidAudience = jwtAudience,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddSingleton(new Cloudinary(cloudinaryAccount));

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();

builder.Services.AddScoped<Maintenance_System.Services.AuthService>();

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<IPhotoService, PhotoService>();

var app = builder.Build();

// SUPERADMIN SEEDER 
// Create a temporary scope to access the database on startup
using (var scope = app.Services.CreateScope())
{
var db = scope.ServiceProvider.GetRequiredService<Maintenance_System.Data.AppDbContext>();

// Auto-run EF migrations to create database schema if not present
db.Database.Migrate();

// Check if ANY Admin exists in the database
if (!db.Users.Any(u => u.Role == Maintenance_System.Models.Enums.UserRole.Admin))
    {
    var superAdmin = new Maintenance_System.Models.User
    {
    FullName = "System Administrator",
    Email = "admin@redeemers.edu.ng",
    // Hash a default secure password
    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123!"),
    Role = Maintenance_System.Models.Enums.UserRole.Admin,
    CreatedDate = DateTime.UtcNow
    };

    db.Users.Add(superAdmin);
    db.SaveChanges();
    }
}

    // Configure the HTTP request pipeline.
    if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
