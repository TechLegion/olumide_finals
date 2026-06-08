//using System.ComponentModel.DataAnnotations;
//using Maintenance_System.Models.Enums;

//namespace Maintenance_System.Models
//{
//    public class MaintenanceTicket
//    {
//        [Key]
//        public int TicketId { get; set; }
//        public string Title { get; set; } = string.Empty;
//        public string Description { get; set; } = string.Empty;
//        public string Location { get; set; } = string.Empty;
//        public string? ImageUrl { get; set; }
//        public TicketStatus Status { get; set; } = TicketStatus.Pending;
//        public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
//        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
//        public int ReportedByUserId { get; set; }
//        public User ReportedBy { get; set; } = null!;
//        public ICollection<AssignmentLog> AssignmentLogs { get; set; }
//            = new List<AssignmentLog>();
//    }
//}

using Maintenance_System.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace Maintenance_System.Models
{
    public class MaintenanceTicket
    {
        [Key]
        public int TicketId { get; set; }

        //Core fields 
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Physical location on campus e.g. "Block C, Room 204"
        public Hostel Hostel { get; set; }
        public string RoomNumber { get; set; } = string.Empty;

        public TicketCategory Category { get; set; }
        public TicketStatus Status { get; set; } = TicketStatus.Pending;

        // Cloudinary URL — populated in Sprint 3, nullable until then
        public string? ImageUrl { get; set; }

        // Timestamps
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // UpdatedAt should be bumped manually in the service layer on every write.
        // We do NOT use a DB default here so EF Core owns the value explicitly.
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // FK: Student (required) 
        // The User who submitted the ticket. Non-nullable — a ticket cannot
        // exist without an owner.
        public int StudentId { get; set; }
        public User Student { get; set; } = null!;

        // FK: Technician (optional) 
        // Null on creation. Populated when an Admin assigns the ticket.
        // int? makes the FK column nullable in SQL Server.
        public int? TechnicianId { get; set; }
        public User? Technician { get; set; }

        // Navigation 
        public ICollection<AssignmentLog> AssignmentLogs { get; set; }
            = new List<AssignmentLog>();
    }
}
