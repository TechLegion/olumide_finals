namespace Maintenance_System.Models
{
    public class AssignmentLog
    {
        public int AssignmentLogId { get; set; }
        public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
        public string? Notes { get; set; }

        // Foreign Key for Ticket
        public int TicketId { get; set; }
        public MaintenanceTicket Ticket { get; set; } = null!;

        // Foreign Key for the Admin who assigned it
        public int AssignedByUserId { get; set; }
        public User AssignedBy { get; set; } = null!;

        // Foreign Key for the Technician it was assigned to
        public int AssignedToUserId { get; set; }
        public User AssignedTo { get; set; } = null!;
    }
}
