using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Streamly.Api.Data;
using Streamly.Api.Models;

namespace Streamly.Api.Tests;

public class AuthIntegrationTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthIntegrationTests(
        CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact(
        DisplayName =
            "B1-INT-03 - Tai khoan bi khoa khong duoc cap JWT")]
    public async Task Login_InactiveUser_ReturnsUnauthorizedWithoutToken()
    {
        // Arrange
        using (var scope =
            _factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider
                .GetRequiredService<AppDbContext>();

            await db.Database.EnsureDeletedAsync();
            await db.Database.EnsureCreatedAsync();

            db.Users.Add(
                new User
                {
                    Email = "locked@test.com",

                    PasswordHash =
                        BCrypt.Net.BCrypt.HashPassword(
                            "Password123"),

                    DisplayName = "Locked User",

                    Role = "User",

                    IsActive = false,

                    CreatedAt = DateTime.UtcNow,

                    UpdatedAt = DateTime.UtcNow
                });

            await db.SaveChangesAsync();
        }

        var client = _factory.CreateClient();

        // Act
        var response =
            await client.PostAsJsonAsync(
                "/api/auth/login",
                new
                {
                    email = "locked@test.com",
                    password = "Password123"
                });

        var responseBody =
            await response.Content.ReadAsStringAsync();

        // Assert
        Assert.Equal(
            HttpStatusCode.Unauthorized,
            response.StatusCode);

        Assert.DoesNotContain(
            "accessToken",
            responseBody,
            StringComparison.OrdinalIgnoreCase);
    }
}