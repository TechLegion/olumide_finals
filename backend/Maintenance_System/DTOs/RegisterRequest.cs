using Maintenance_System.Models.Enums;
namespace Maintenance_System.DTOs
{
    public class RegisterRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string MatricNumber { get; set; } = string.Empty;
    }
}
