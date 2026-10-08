using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Streamly.Api.Data;

namespace Streamly.Api.Tests;

public class CustomWebApplicationFactory
    : WebApplicationFactory<Program>
{
    public CustomWebApplicationFactory()
    {
        Environment.SetEnvironmentVariable(
            "Jwt__Key",
            "Streamly-Test-Key-Only-For-Integration-Testing-2026");

        Environment.SetEnvironmentVariable(
            "Jwt__Issuer",
            "Streamly.Api");

        Environment.SetEnvironmentVariable(
            "Jwt__Audience",
            "Streamly.Frontend");
    }

    protected override void ConfigureWebHost(
        IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<
                DbContextOptions<AppDbContext>>();

            services.RemoveAll<AppDbContext>();

            var efConfigurationDescriptors =
                services
                    .Where(descriptor =>
                        descriptor.ServiceType.IsGenericType &&
                        descriptor.ServiceType
                            .GetGenericArguments()
                            .Contains(typeof(AppDbContext)) &&
                        descriptor.ServiceType.Name.Contains(
                            "IDbContextOptionsConfiguration"))
                    .ToList();

            foreach (var descriptor
                     in efConfigurationDescriptors)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(
                options =>
                {
                    options.UseInMemoryDatabase(
                        "StreamlyIntegrationTests");
                });
        });

        builder.UseEnvironment("Testing");
    }
}