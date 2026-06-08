using Maintenance_System.DTOs;
using Maintenance_System.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Maintenance_System.Controllers
{
    [ApiController]
    [Route("api/tickets")]
    [Authorize] // Every endpoint in this controller requires a valid JWT at minimum.
                // Individual endpoints layer stricter role requirements on top.
    public class TicketController : ControllerBase
    {
        private readonly TicketService _ticketService;

        public TicketController(TicketService ticketService)
        {
            _ticketService = ticketService;
        }

        // POST /api/tickets 
        [HttpPost]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> CreateTicket([FromForm] CreateTicketRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title) ||
                string.IsNullOrWhiteSpace(request.Description) ||
                string.IsNullOrWhiteSpace(request.RoomNumber))
                return BadRequest(new { message = "Title, Description, and Room Numberx are required." });

            // Security-critical: extract identity from token, not from body ──
            // ClaimTypes.Email resolves to the email claim we wrote in AuthService.
            // If this claim is missing the token is malformed — 401 immediately.
            var callerEmail = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(callerEmail))
                return Unauthorized(new { message = "Token is missing the email claim." });

            var (success, message, data) = await _ticketService.CreateTicketAsync(request, callerEmail);

            // 201 Created with a Location header pointing to the new resource
            return success
                ? CreatedAtAction(nameof(GetTicketById), new { id = data!.TicketId }, data)
                : BadRequest(new { message });
        }

        // GET /api/tickets 
        [HttpGet]
        [Authorize(Roles = "Student,Admin")]
        public async Task<IActionResult> GetTickets()
        {
            var callerEmail = User.FindFirstValue(ClaimTypes.Email);
            var callerRole = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(callerEmail) || string.IsNullOrEmpty(callerRole))
                return Unauthorized(new { message = "Token claims are incomplete." });

            var tickets = await _ticketService.GetTicketsAsync(callerEmail, callerRole);
            return Ok(tickets);
        }

        // GET /api/tickets/{id} 
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Student,Admin")]
        public async Task<IActionResult> GetTicketById(int id)
        {
            var callerEmail = User.FindFirstValue(ClaimTypes.Email);
            var callerRole = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(callerEmail) || string.IsNullOrEmpty(callerRole))
                return Unauthorized(new { message = "Token claims are incomplete." });

            var (success, message, data) =
                await _ticketService.GetTicketByIdAsync(id, callerEmail, callerRole);

            // 404 for "not found", 403 for "found but you don't own it"
            if (!success)
            {
                bool isOwnershipError = message.Contains("permission");
                return isOwnershipError
                    ? Forbid()
                    : NotFound(new { message });
            }

            return Ok(data);
        }

        // PUT /api/tickets/{id}/assign 
        [HttpPut("{id:int}/assign")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignTicket(int id, [FromBody] AssignTicketRequest request)
        {
            if (request.TechnicianId <= 0)
                return BadRequest(new { message = "A valid TechnicianId is required." });

            var adminEmail = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(adminEmail))
                return Unauthorized(new { message = "Token is missing the email claim." });

            var (success, message, data) = await _ticketService.AssignTicketAsync(id, request, adminEmail);

            if (!success)
            {
                // 404 if the ticket or technician doesn't exist;
                // 400 for all other business-rule violations (wrong role, closed ticket, etc.)
                bool isNotFound = message.Contains("not found");
                return isNotFound ? NotFound(new { message }) : BadRequest(new { message });
            }

            return Ok(data);
        }

        // PATCH /api/tickets/{id}/status 
        [HttpPatch("{id:int}/status")]
        [Authorize(Roles = "Technician")]
        public async Task<IActionResult> ResolveTicket(int id, [FromBody] ResolveTicketRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Status))
                return BadRequest(new { message = "Status is required." });

            var technicianEmail = User.FindFirstValue(ClaimTypes.Email);
            if (string.IsNullOrEmpty(technicianEmail))
                return Unauthorized(new { message = "Token is missing the email claim." });

            var (success, message, data) = await _ticketService.ResolveTicketAsync(id, request, technicianEmail);

            if (!success)
            {
                bool isNotFound = message.Contains("not found");

                // "not assigned to you" is a 403 — the resource exists,
                // but this caller has no rights over it.
                bool isForbidden = message.Contains("not assigned to you");

                if (isNotFound) return NotFound(new { message });
                if (isForbidden) return Forbid();
                return BadRequest(new { message });
            }

            return Ok(data);
        }
    }
}
