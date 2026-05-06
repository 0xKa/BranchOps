using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BranchOps.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddReplenishmentAgent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ReplenishmentRuns",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: false),
                    TriggeredByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ModelId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Summary = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    ErrorMessage = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReplenishmentRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReplenishmentRuns_Branches_BranchId",
                        column: x => x.BranchId,
                        principalTable: "Branches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReplenishmentRuns_Users_TriggeredByUserId",
                        column: x => x.TriggeredByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReplenishmentRecommendations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RunId = table.Column<Guid>(type: "uuid", nullable: false),
                    BranchId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    CurrentStock = table.Column<int>(type: "integer", nullable: false),
                    SuggestedQty = table.Column<int>(type: "integer", nullable: false),
                    Urgency = table.Column<int>(type: "integer", nullable: false),
                    Rationale = table.Column<string>(type: "character varying(1500)", maxLength: 1500, nullable: false),
                    Confidence = table.Column<decimal>(type: "numeric(4,3)", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    DecidedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    DecidedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DecisionNotes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReplenishmentRecommendations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReplenishmentRecommendations_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReplenishmentRecommendations_ReplenishmentRuns_RunId",
                        column: x => x.RunId,
                        principalTable: "ReplenishmentRuns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReplenishmentRecommendations_Users_DecidedByUserId",
                        column: x => x.DecidedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ReplenishmentRecommendations_BranchId_ProductId",
                table: "ReplenishmentRecommendations",
                columns: new[] { "BranchId", "ProductId" });

            migrationBuilder.CreateIndex(
                name: "IX_ReplenishmentRecommendations_DecidedByUserId",
                table: "ReplenishmentRecommendations",
                column: "DecidedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReplenishmentRecommendations_ProductId",
                table: "ReplenishmentRecommendations",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ReplenishmentRecommendations_RunId",
                table: "ReplenishmentRecommendations",
                column: "RunId");

            migrationBuilder.CreateIndex(
                name: "IX_ReplenishmentRecommendations_Status",
                table: "ReplenishmentRecommendations",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ReplenishmentRuns_BranchId_StartedAt",
                table: "ReplenishmentRuns",
                columns: new[] { "BranchId", "StartedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ReplenishmentRuns_Status",
                table: "ReplenishmentRuns",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_ReplenishmentRuns_TriggeredByUserId",
                table: "ReplenishmentRuns",
                column: "TriggeredByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ReplenishmentRecommendations");

            migrationBuilder.DropTable(
                name: "ReplenishmentRuns");
        }
    }
}
