using Maintenance_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Maintenance_System.DTOs;

namespace Maintenance_System.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // base: /api/auth
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        // POST /api/auth/register 
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // Public route: Automatically routes to the Student-only logic
            var result = await _authService.RegisterStudentAsync(request);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("register-staff")]
        public async Task<IActionResult> RegisterStaff([FromBody] RegisterRequest request)
        {
            // Protected route: Only Admins can reach this block of code
            var result = await _authService.RegisterStaffAsync(request);

            if (!result.Success)
                return BadRequest(new { message = result.Message });

            return Ok(new { message = result.Message });
        }

        // POST /api/auth/login 
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email and Password are required." });

            var (success, message, data) = await _authService.LoginAsync(request);

            return success ? Ok(data) : Unauthorized(new { message });
        }

        // GET /api/auth/admin-only — RBAC proof for PM demo 
        // Returns 200 only when the bearer token carries Role = "Admin".
        // Returns 401 for no token, 403 for wrong role.
        [HttpGet("admin-only")]
        [Authorize(Roles = "Admin")]
        public IActionResult AdminOnly()
            => Ok(new { message = "RBAC confirmed. Your token carries the Admin role." });

        [HttpGet("technicians")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTechnicians()
        {
            var technicians = await _authService.GetTechniciansAsync();
            return Ok(technicians);
        }
    }
}