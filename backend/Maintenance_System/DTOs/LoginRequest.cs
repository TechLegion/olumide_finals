//using Maintenance_System.Models.Enums;
namespace Maintenance_System.DTOs
{
    public class LoginRequest
    {
        public string Email  { get; set; } = string.Empty;
        public string Password { get; set; } = string .Empty;

        //public UserRole Role { get; set; }
    }
}
