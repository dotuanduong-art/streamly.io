using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Streamly.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaybackSources : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PlaybackSources",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MovieId = table.Column<long>(type: "bigint", nullable: false),
                    SourceUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    SourceType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Quality = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Language = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ProviderName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    License = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    AttributionUrl = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaybackSources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlaybackSources_Movies_MovieId",
                        column: x => x.MovieId,
                        principalTable: "Movies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlaybackSources_MovieId_IsActive",
                table: "PlaybackSources",
                columns: new[] { "MovieId", "IsActive" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PlaybackSources");
        }
    }
}
