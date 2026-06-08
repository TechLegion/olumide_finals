using Maintenance_System.Models.Enums;
namespace Maintenance_System.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? MatricNumber { get; set; } // Only for students
        public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;

        public ICollection<MaintenanceTicket> SubmittedTickets { get; set; }
            = new List<MaintenanceTicket>();
        public ICollection<AssignmentLog> AssignmentLogs { get; set; }
            = new List<AssignmentLog>();

    }
}
