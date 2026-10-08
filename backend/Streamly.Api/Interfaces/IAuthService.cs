using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(
            RegisterDto dto
        );

        Task<AuthResponseDto?> LoginAsync(
            LoginDto dto
        );

        Task<UserResponseDto?> GetCurrentUserAsync(
            long userId
        );
    }
}