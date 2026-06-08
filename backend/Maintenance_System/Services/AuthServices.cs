using Maintenance_System.Data;
using Maintenance_System.DTOs;
using Maintenance_System.Models;
using Maintenance_System.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Maintenance_System.Services
{
    public class AuthService
    {
        private readonly IConfiguration _config;
        private readonly AppDbContext _db;

        public AuthService(IConfiguration config, AppDbContext db)
        {
            _config = config;
            _db = db;
        }

        // ── REGISTER ─────────────────────────────────────────────────────────

        // 1. THE PUBLIC PATH (Hardcoded to Student)
        public async Task<(bool Success, string Message)> RegisterStudentAsync(RegisterRequest request)
        {
            bool emailTaken = await _db.Users.AnyAsync(u => u.Email == request.Email);
            if (emailTaken) return (false, "An account with this email already exists.");

            var user = new User
            {
                FullName = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = UserRole.Student, // SECURITY: Force this to Student
                MatricNumber = request.MatricNumber,
                CreatedDate = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return (true, "Student registration successful.");
        }

        // 2. THE PROTECTED PATH (Allows Admins and Technicians)
        public async Task<(bool Success, string Message)> RegisterStaffAsync(RegisterRequest request)
        {
            bool emailTaken = await _db.Users.AnyAsync(u => u.Email == request.Email);
            if (emailTaken) return (false, "An account with this email already exists.");

            // Prevent accidental or malicious downgrade to Student via this endpoint
            if (request.Role == UserRole.Student)
                return (false, "This endpoint is for staff creation only.");

            var user = new User
            {
                FullName = request.Name,
                Email = request.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                Role = request.Role, // SECURITY: Safe to trust, protected by Controller
                MatricNumber = null, // Staff don't have matric numbers
                CreatedDate = DateTime.UtcNow
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return (true, $"{request.Role} account created successfully.");
        }

        // ── LOGIN ─────────────────────────────────────────────────────────────

        public async Task<(bool Success, string Message, LoginResponse? Data)> LoginAsync(LoginRequest request)
        {
            // Fetch user from DB by email
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            // Return the same vague message for both "no account" and "wrong password"
            // to prevent user-enumeration attacks.
            if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
                return (false, "Invalid email or password.", null);

            var tokenResponse = BuildToken(user.Email, user.Role);
            return (true, "Login successful.", tokenResponse);
        }

        // ── TOKEN FACTORY (private — not exposed directly) ────────────────────

        private LoginResponse BuildToken(string email, UserRole role)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Email,  email),

                // This is what [Authorize(Roles = "Admin")] reads at runtime.
                // The value must be the enum name string: "Admin", "Technician", "Student"
                new Claim(ClaimTypes.Role,   role.ToString()),

                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat,
                    DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(),
                    ClaimValueTypes.Integer64)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:SecretKey"]!));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiresAt = DateTime.UtcNow.AddHours(8);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: expiresAt,
                signingCredentials: credentials
            );

            return new LoginResponse
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Email = email,
                Role = role.ToString(),
                ExpiresAt = expiresAt
            };
        }

        public async Task<List<UserSummaryDto>> GetTechniciansAsync()
        {
            return await _db.Users
                .Where(u => u.Role == UserRole.Technician)
                .Select(u => new UserSummaryDto
                {
                    UserId = u.UserId,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = "Technician"
                })
                .ToListAsync();
        }
    }
}