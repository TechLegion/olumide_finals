using Maintenance_System.DTOs;
using Maintenance_System.Models.Enums;

namespace Maintenance_System.DTOs
{
    public class TicketResponse
    {
        public int TicketId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Hostel Hostel { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Safe user projections — no PasswordHash, no navigation noise
        public UserSummaryDto Student { get; set; } = null!;
        public UserSummaryDto? Technician { get; set; }
    }
}
