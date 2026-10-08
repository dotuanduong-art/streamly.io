using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Streamly.Api.Data;
using Streamly.Api.Interfaces;
using Streamly.Api.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description =
                "Nhập JWT access token."
        }
    );

    options.AddSecurityRequirement(
        new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference =
                        new Microsoft.OpenApi.Models.OpenApiReference
                        {
                            Type =
                                Microsoft.OpenApi.Models.ReferenceType
                                    .SecurityScheme,

                            Id = "Bearer"
                        }
                },
                Array.Empty<string>()
            }
        }
    );
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    )
);

// Services
builder.Services.AddScoped<IMovieService, MovieService>();
builder.Services.AddScoped<IGenreService, GenreService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IMyListService, MyListService>();
builder.Services.AddScoped<IHistoryService, HistoryService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IAdminMovieService, AdminMovieService>();
builder.Services.AddScoped<IAdminGenreService, AdminGenreService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();
builder.Services.AddHttpClient<ITmdbImportService, TmdbImportService>(
    client =>
    {
        client.BaseAddress =
            new Uri(
                "https://api.themoviedb.org/3/"
            );
    }
);
// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://streamly-io.vercel.app"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// JWT Authentication
var jwtKey =
    builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "Jwt:Key chưa được cấu hình."
    );

builder.Services
    .AddAuthentication(
        JwtBearerDefaults.AuthenticationScheme
    )
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    builder.Configuration["Jwt:Issuer"],

                ValidAudience =
                    builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)
                    ),

                ClockSkew = TimeSpan.Zero
            };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("Frontend");

// Quan trọng: Authentication trước Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();