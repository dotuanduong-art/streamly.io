using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Streamly.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddMovieMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Popularity",
                table: "Movies",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ViewCount",
                table: "Movies",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<double>(
                name: "VoteAverage",
                table: "Movies",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Popularity",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "Movies");

            migrationBuilder.DropColumn(
                name: "VoteAverage",
                table: "Movies");
        }
    }
}
