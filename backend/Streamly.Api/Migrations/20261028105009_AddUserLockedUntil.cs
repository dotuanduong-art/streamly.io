using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Streamly.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLockedUntil : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LockedUntil",
                table: "Users",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LockedUntil",
                table: "Users");
        }
    }
}
