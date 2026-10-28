using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IAdminUserService
    {
        Task<PagedResultDto<AdminUserResponseDto>> GetUsersAsync(
            AdminUserQueryDto query
        );

        Task UpdateRoleAsync(
            long currentAdminId,
            long userId,
            UpdateUserRoleDto dto
        );

        Task UpdateStatusAsync(
            long currentAdminId,
            long userId,
            UpdateUserStatusDto dto
        );
        Task LockUserAsync(
            long id,
            int? days,
            bool permanent,
            long currentAdminId
        );

        Task UnlockUserAsync(long id);

        Task DeleteUserAsync(
            long id,
            long currentAdminId
        );
    }
}