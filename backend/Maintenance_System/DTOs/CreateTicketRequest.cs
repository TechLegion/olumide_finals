using Maintenance_System.Models.Enums;

namespace Maintenance_System.DTOs
{
    public class CreateTicketRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Hostel Hostel { get; set; }
        public string RoomNumber { get; set; } = string.Empty;
        public TicketCategory Category { get; set; }
        public IFormFile? Image { get; set; }

    }
}
