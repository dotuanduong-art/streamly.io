using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Services
{
    public class ProfileService : IProfileService
    {
        private readonly AppDbContext _context;

        public ProfileService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<UserResponseDto?> UpdateAsync(
            long userId,
            UpdateProfileDto dto
        )
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

            var displayName = dto.DisplayName.Trim();

            if (string.IsNullOrWhiteSpace(displayName))
            {
                throw new ArgumentException(
                    "Tên hiển thị không được để trống."
                );
            }

            user.DisplayName = displayName;

            if (!string.IsNullOrWhiteSpace(dto.AvatarUrl))
            {
                user.AvatarUrl = dto.AvatarUrl.Trim();
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToResponse(user);
        }

        public async Task<UserResponseDto?> UpdateAvatarAsync(
            long userId,
            string avatarUrl
        )
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

            if (string.IsNullOrWhiteSpace(avatarUrl))
            {
                throw new ArgumentException(
                    "Đường dẫn ảnh đại diện không hợp lệ."
                );
            }

            user.AvatarUrl = avatarUrl.Trim();
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToResponse(user);
        }

        private static UserResponseDto MapToResponse(
            Models.User user
        )
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