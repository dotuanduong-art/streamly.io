using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Streamly.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaybackSourceSubtitles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SubtitleLabel",
                table: "PlaybackSources",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubtitleLanguage",
                table: "PlaybackSources",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SubtitleUrl",
                table: "PlaybackSources",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SubtitleLabel",
                table: "PlaybackSources");

            migrationBuilder.DropColumn(
                name: "SubtitleLanguage",
                table: "PlaybackSources");

            migrationBuilder.DropColumn(
                name: "SubtitleUrl",
                table: "PlaybackSources");
        }
    }
}
