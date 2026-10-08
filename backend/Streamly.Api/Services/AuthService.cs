using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Streamly.Api.Models;

namespace Streamly.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly ITokenService _tokenService;

        public AuthService(
            AppDbContext context,
            ITokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
        }

        public async Task<AuthResponseDto> RegisterAsync(
            RegisterDto dto)
        {
            string email =
                dto.Email.Trim().ToLowerInvariant();

            bool emailExists =
                await _context.Users.AnyAsync(
                    u => u.Email == email
                );

            if (emailExists)
            {
                throw new InvalidOperationException(
                    "Email này đã được sử dụng."
                );
            }

            var user = new User
            {
                Email = email,

                PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        dto.Password
                    ),

                DisplayName = dto.DisplayName.Trim(),

                Role = "User",

                IsActive = true,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            return CreateAuthResponse(user);
        }

        public async Task<AuthResponseDto?> LoginAsync(
            LoginDto dto)
        {
            string email =
                dto.Email.Trim().ToLowerInvariant();

            var user = await _context.Users
                .FirstOrDefaultAsync(
                    u => u.Email == email
                );

            if (user == null)
            {
                return null;
            }

            if (!user.IsActive)
            {
                return null;
            }

            bool passwordCorrect =
                BCrypt.Net.BCrypt.Verify(
                    dto.Password,
                    user.PasswordHash
                );

            if (!passwordCorrect)
            {
                return null;
            }

            return CreateAuthResponse(user);
        }

        public async Task<UserResponseDto?>
            GetCurrentUserAsync(long userId)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(
                    u => u.Id == userId &&
                         u.IsActive
                );

            if (user == null)
            {
                return null;
            }

            return ToUserDto(user);
        }

        private AuthResponseDto CreateAuthResponse(
            User user)
        {
            return new AuthResponseDto
            {
                AccessToken =
                    _tokenService.GenerateToken(user),

                User = ToUserDto(user)
            };
        }

        private static UserResponseDto ToUserDto(
            User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }
    }
}