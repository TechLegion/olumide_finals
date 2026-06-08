using CloudinaryDotNet.Actions;
using Maintenance_System.Data;
using Maintenance_System.DTOs;
using Maintenance_System.Models;
using Maintenance_System.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace Maintenance_System.Services
{
    public class TicketService
    {
        private readonly AppDbContext _db;
        private readonly IPhotoService _photoService;   

        public TicketService(AppDbContext db, IPhotoService photoService)
        {
            _db = db;
            _photoService = photoService;
        }

        // CREATE 
        // callerEmail comes from the JWT claim extracted in the controller.
        // It is never supplied by the client request body.
        public async Task<(bool Success, string Message, TicketResponse? Data)>
            CreateTicketAsync(CreateTicketRequest request, string callerEmail)
        {
            // Resolve the student record using the email baked into the token.
            // If somehow the token email doesn't match a DB record, we hard-stop.
            var student = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == callerEmail);

            if (student is null)
                return (false, "Authenticated user not found in the database.", null);

            // Belt-and-suspenders role guard at the service layer.
            // The controller's [Authorize(Roles = "Student")] is the first gate;
            // this is the second, preventing misuse if the service is ever
            // called from another code path.
            if (student.Role != UserRole.Student)
                return (false, "Only students may submit maintenance tickets.", null);

            string? imageUrl = null;
            if (request.Image is not null)
            {
                var (uploadsuccess, uploadresult) = await _photoService.UploadPhotoAsync(request.Image);
                if (!uploadsuccess)
                    return (false, $"Image upload failed: {uploadresult}", null);

                imageUrl = uploadresult;
            }

            var ticket = new MaintenanceTicket
            {
                Title = request.Title,
                Description = request.Description,
                Hostel = request.Hostel,
                RoomNumber = request.RoomNumber,
                Category = request.Category,
                Status = TicketStatus.Pending,
                ImageUrl = imageUrl,
                StudentId = student.UserId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.MaintenanceTickets.Add(ticket);
            await _db.SaveChangesAsync();

            // Re-fetch with navigation properties so the response is fully populated
            return (true, "Ticket created successfully.", await FetchTicketDtoAsync(ticket.TicketId));
        }

        // GET ALL 
        // Behaviour branches on the caller's role:
        //   Student → only their own tickets
        //   Admin   → all tickets in the system
        public async Task<List<TicketResponse>> GetTicketsAsync(string callerEmail, string callerRole)
        {
            IQueryable<MaintenanceTicket> query = _db.MaintenanceTickets
                .Include(t => t.Student)
                .Include(t => t.Technician)
                .OrderByDescending(t => t.CreatedAt);

            if (callerRole == "Student")
                query = query.Where(t => t.Student.Email == callerEmail);

            // Admin hits this without a filter — receives the full set
            var tickets = await query.ToListAsync();
            return tickets.Select(MapToDto).ToList();
        }

        // GET SINGLE 
        public async Task<(bool Success, string Message, TicketResponse? Data)>
            GetTicketByIdAsync(int ticketId, string callerEmail, string callerRole)
        {
            var ticket = await _db.MaintenanceTickets
                .Include(t => t.Student)
                .Include(t => t.Technician)
                .FirstOrDefaultAsync(t => t.TicketId == ticketId);

            if (ticket is null)
                return (false, "Ticket not found.", null);

            // Students may only read tickets they own.
            // Admins may read any ticket.
            if (callerRole == "Student" && ticket.Student.Email != callerEmail)
                return (false, "You do not have permission to view this ticket.", null);

            return (true, "OK", MapToDto(ticket));
        }

        // ASSIGN 
        // Called by an Admin. Verifies the target user is actually a Technician,
        // writes the FK, flips the status, and appends an AssignmentLog entry
        // for the full audit trail that AssignmentLog was designed to support.
        public async Task<(bool Success, string Message, TicketResponse? Data)>
            AssignTicketAsync(int ticketId, AssignTicketRequest request, string adminEmail)
        {
            var ticket = await _db.MaintenanceTickets
                .Include(t => t.Student)
                .Include(t => t.Technician)
                .FirstOrDefaultAsync(t => t.TicketId == ticketId);

            if (ticket is null)
                return (false, "Ticket not found.", null);

            // Closed tickets are terminal — no further assignment is meaningful.
            if (ticket.Status == TicketStatus.Closed)
                return (false, "Cannot assign a ticket that has already been closed.", null);

            // Resolve the technician from the DB — we never trust the client
            // to self-certify a role, so we look it up ourselves.
            var technician = await _db.Users
                .FirstOrDefaultAsync(u => u.UserId == request.TechnicianId);

            if (technician is null)
                return (false, $"No user found with ID {request.TechnicianId}.", null);

            if (technician.Role != UserRole.Technician)
                return (false, $"{technician.FullName} is not a Technician and cannot be assigned to tickets.", null);

            // Resolve the Admin performing the action from their token email.
            // Used to populate the AssignmentLog — never supplied by the request body.
            var admin = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == adminEmail);

            if (admin is null)
                return (false, "Authenticated admin not found in the database.", null);

            // Mutate the ticket 
            ticket.TechnicianId = technician.UserId;
            ticket.Status = TicketStatus.Assigned;
            ticket.UpdatedAt = DateTime.UtcNow;

            // Write the audit log entry 
            // AssignmentLog was built in Sprint 1 specifically for this moment.
            // Every (re)assignment is appended — never updated — preserving full history.
            var log = new AssignmentLog
            {
                TicketId = ticket.TicketId,
                AssignedByUserId = admin.UserId,
                AssignedToUserId = technician.UserId,
                AssignedAt = DateTime.UtcNow,
                Notes = $"Assigned to {technician.FullName} by {admin.FullName}."
            };

            _db.AssignmentLogs.Add(log);
            await _db.SaveChangesAsync();

            return (true, "Ticket successfully assigned.", await FetchTicketDtoAsync(ticket.TicketId));
        }

        // RESOLVE 
        // Called by a Technician. They may only resolve tickets assigned to them,
        // and only advance the status to Resolved — not skip ahead to Closed.
        // Closed is an Admin-only terminal action, reserved for Sprint 4.
        public async Task<(bool Success, string Message, TicketResponse? Data)>
            ResolveTicketAsync(int ticketId, ResolveTicketRequest request, string technicianEmail)
        {
            // Validate the submitted status value 
            // We parse here rather than accepting a raw enum in the DTO so that
            // bad values get a clear 400 message instead of a serialisation crash.
            if (!Enum.TryParse<TicketStatus>(request.Status, ignoreCase: true, out var parsedStatus))
                return (false, $"'{request.Status}' is not a valid status value.", null);

            // Technicians have exactly one legal transition: → Resolved.
            // Attempting to self-assign (Pending→Assigned) or close (→Closed) is blocked.
            if (parsedStatus != TicketStatus.Resolved)
                return (false, "Technicians may only set the status to 'Resolved'.", null);

            var ticket = await _db.MaintenanceTickets
                .Include(t => t.Student)
                .Include(t => t.Technician)
                .FirstOrDefaultAsync(t => t.TicketId == ticketId);

            if (ticket is null)
                return (false, "Ticket not found.", null);

            // Ownership check: the token email must match the assigned Technician.
            // This is the equivalent of the Student ownership check in GetTicketById.
            if (ticket.Technician is null || ticket.Technician.Email != technicianEmail)
                return (false, "This ticket is not assigned to you.", null);

            // Guard against nonsensical transitions on already-terminal tickets.
            if (ticket.Status == TicketStatus.Resolved)
                return (false, "Ticket is already marked as Resolved.", null);

            if (ticket.Status == TicketStatus.Closed)
                return (false, "Cannot update a ticket that has already been closed.", null);

            ticket.Status = TicketStatus.Resolved;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return (true, "Ticket marked as Resolved.", await FetchTicketDtoAsync(ticket.TicketId));
        }

        // PRIVATE HELPERS 

        // Used after SaveChangesAsync to return a fully-populated DTO
        // without making the caller do a second round-trip manually.
        private async Task<TicketResponse?> FetchTicketDtoAsync(int ticketId)
        {
            var ticket = await _db.MaintenanceTickets
                .Include(t => t.Student)
                .Include(t => t.Technician)
                .FirstOrDefaultAsync(t => t.TicketId == ticketId);

            return ticket is null ? null : MapToDto(ticket);
        }

        // Central projection from entity → DTO.
        // All responses flow through here so there is exactly one place
        // to update if the shape of TicketResponse ever changes.
        private static TicketResponse MapToDto(MaintenanceTicket t)
        {
            return new TicketResponse
            {
                TicketId = t.TicketId,
                Title = t.Title,
                Description = t.Description,
                Hostel = t.Hostel,
                RoomNumber = t.RoomNumber,
                Category = t.Category.ToString(),
                Status = t.Status.ToString(),
                ImageUrl = t.ImageUrl,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,

                Student = new UserSummaryDto
                {
                    UserId = t.Student.UserId,
                    FullName = t.Student.FullName,
                    Email = t.Student.Email,
                    Role = t.Student.Role.ToString()
                },

                // Technician is null until an Admin assigns one in Sprint 4
                Technician = t.Technician is null ? null : new UserSummaryDto
                {
                    UserId = t.Technician.UserId,
                    FullName = t.Technician.FullName,
                    Email = t.Technician.Email,
                    Role = t.Technician.Role.ToString()
                }
            };
        }
    }
}
