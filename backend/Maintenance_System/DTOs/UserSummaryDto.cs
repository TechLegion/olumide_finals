// A safe, flat projection of a User for embedding inside ticket responses.
// Never expose the User entity directly — it carries PasswordHash.
namespace Maintenance_System.DTOs
{
    public class UserSummaryDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
