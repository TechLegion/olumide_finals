using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Maintenance_System.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgres : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    MatricNumber = table.Column<string>(type: "text", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceTickets",
                columns: table => new
                {
                    TicketId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Hostel = table.Column<int>(type: "integer", nullable: false),
                    RoomNumber = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    ImageUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StudentId = table.Column<int>(type: "integer", nullable: false),
                    TechnicianId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceTickets", x => x.TicketId);
                    table.ForeignKey(
                        name: "FK_MaintenanceTickets_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MaintenanceTickets_Users_TechnicianId",
                        column: x => x.TechnicianId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AssignmentLogs",
                columns: table => new
                {
                    AssignmentLogId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AssignedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    TicketId = table.Column<int>(type: "integer", nullable: false),
                    AssignedByUserId = table.Column<int>(type: "integer", nullable: false),
                    AssignedToUserId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssignmentLogs", x => x.AssignmentLogId);
                    table.ForeignKey(
                        name: "FK_AssignmentLogs_MaintenanceTickets_TicketId",
                        column: x => x.TicketId,
                        principalTable: "MaintenanceTickets",
                        principalColumn: "TicketId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AssignmentLogs_Users_AssignedByUserId",
                        column: x => x.AssignedByUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssignmentLogs_Users_AssignedToUserId",
                        column: x => x.AssignedToUserId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssignmentLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentLogs_AssignedByUserId",
                table: "AssignmentLogs",
                column: "AssignedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentLogs_AssignedToUserId",
                table: "AssignmentLogs",
                column: "AssignedToUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentLogs_TicketId",
                table: "AssignmentLogs",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_AssignmentLogs_UserId",
                table: "AssignmentLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceTickets_StudentId",
                table: "MaintenanceTickets",
                column: "StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_MaintenanceTickets_TechnicianId",
                table: "MaintenanceTickets",
                column: "TechnicianId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AssignmentLogs");

            migrationBuilder.DropTable(
                name: "MaintenanceTickets");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
