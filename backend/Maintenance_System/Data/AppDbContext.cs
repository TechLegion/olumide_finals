using Microsoft.EntityFrameworkCore;
using Maintenance_System.Models;

namespace Maintenance_System.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)  { }

        public DbSet<User> Users { get; set; }
        public DbSet<MaintenanceTicket> MaintenanceTickets { get; set; }
        public DbSet<AssignmentLog> AssignmentLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<MaintenanceTicket>()
                .HasOne(t => t.Student)
                .WithMany(u => u.SubmittedTickets)
                .HasForeignKey(t => t.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MaintenanceTicket>()
                .HasOne(t => t.Technician)
                .WithMany()                          // No inverse nav needed on User
                .HasForeignKey(t => t.TechnicianId)
                .IsRequired(false)                   // Explicitly marks column as nullable
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AssignmentLog>()
                .HasOne(a => a.AssignedBy)
                .WithMany()
                .HasForeignKey(a => a.AssignedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AssignmentLog>()
                .HasOne(a => a.AssignedTo)
                .WithMany()
                .HasForeignKey(a => a.AssignedToUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
