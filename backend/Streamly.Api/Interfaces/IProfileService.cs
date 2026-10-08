using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IProfileService
    {
        Task<UserResponseDto?> UpdateAsync(
            long userId,
            UpdateProfileDto dto
        );

        Task<UserResponseDto?> UpdateAvatarAsync(
            long userId,
            string avatarUrl
        );
    }
}