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
            LoginDto dto
        )
        {
            string email =
                dto.Email
                    .Trim()
                    .ToLowerInvariant();

            var user =
                await _context.Users
                    .FirstOrDefaultAsync(
                        u => u.Email == email
                    );

            if (user == null)
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

            // Tài khoản đã bị Admin xóa mềm.
            if (user.DeletedAt.HasValue)
            {
                throw new KeyNotFoundException(
                    "Tài khoản không tồn tại."
                );
            }

            // Khóa vĩnh viễn.
            if (!user.IsActive)
            {
                throw new InvalidOperationException(
                    "Tài khoản này đã bị khóa vĩnh viễn. Vui lòng liên hệ quản trị viên."
                );
            }

            // Khóa tạm thời.
            if (
                user.LockedUntil.HasValue &&
                user.LockedUntil.Value >
                    DateTime.UtcNow
            )
            {
                var vietnamTime =
                    DateTime.SpecifyKind(
                        user.LockedUntil.Value,
                        DateTimeKind.Utc
                    ).AddHours(7);

                string lockedUntil =
                    vietnamTime.ToString(
                        "HH:mm dd/MM/yyyy"
                    );

                throw new InvalidOperationException(
                    $"Tài khoản này bị khóa đến {lockedUntil}."
                );
            }

            // Đã hết thời gian khóa -> tự mở khóa.
            if (
                user.LockedUntil.HasValue &&
                user.LockedUntil.Value <=
                    DateTime.UtcNow
            )
            {
                user.LockedUntil = null;
                user.UpdatedAt =
                    DateTime.UtcNow;

                await _context
                    .SaveChangesAsync();
            }

            return CreateAuthResponse(user);
        }

        public async Task<UserResponseDto?>
            GetCurrentUserAsync(long userId)
        {
            var user =
                await _context.Users
                    .FirstOrDefaultAsync(
                        u => u.Id == userId
                    );

            if (user == null)
            {
                return null;
            }

            if (user.DeletedAt.HasValue)
            {
                return null;
            }

            if (!user.IsActive)
            {
                return null;
            }

            if (
                user.LockedUntil.HasValue &&
                user.LockedUntil.Value >
                    DateTime.UtcNow
            )
            {
                return null;
            }

            if (
                user.LockedUntil.HasValue &&
                user.LockedUntil.Value <=
                    DateTime.UtcNow
            )
            {
                user.LockedUntil = null;
                user.UpdatedAt =
                    DateTime.UtcNow;

                await _context
                    .SaveChangesAsync();
            }

            return ToUserDto(user);
        }
        private async Task<bool> IsUserLockedAsync(
            User user
        )
        {
            if (!user.IsActive)
            {
                return true;
            }

            if (!user.LockedUntil.HasValue)
            {
                return false;
            }

            if (
                user.LockedUntil.Value >
                DateTime.UtcNow
            )
            {
                return true;
            }

            user.LockedUntil = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return false;
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