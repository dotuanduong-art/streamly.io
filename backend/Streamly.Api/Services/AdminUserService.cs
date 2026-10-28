using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Services
{
    public class AdminUserService : IAdminUserService
    {
        private readonly AppDbContext _context;

        public AdminUserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResultDto<AdminUserResponseDto>> GetUsersAsync(
            AdminUserQueryDto query
        )
        {
            var page = query.Page < 1
                ? 1
                : query.Page;

            var pageSize = query.PageSize;

            if (pageSize < 1)
            {
                pageSize = 10;
            }

            if (pageSize > 100)
            {
                pageSize = 100;
            }

            var usersQuery = _context.Users
                .AsNoTracking()
                .Where(u => u.DeletedAt == null)
                .AsQueryable();

            // Tìm theo email hoặc tên hiển thị
            if (!string.IsNullOrWhiteSpace(query.Q))
            {
                var keyword = query.Q.Trim();

                usersQuery = usersQuery.Where(
                    u =>
                        u.Email.Contains(keyword) ||
                        u.DisplayName.Contains(keyword)
                );
            }

            // Lọc theo quyền User/Admin
            if (!string.IsNullOrWhiteSpace(query.Role))
            {
                var role = query.Role.Trim();

                usersQuery = usersQuery.Where(
                    u => u.Role == role
                );
            }

            // Lọc tài khoản đang hoạt động / bị khóa
            if (query.IsActive.HasValue)
            {
                var now = DateTime.UtcNow;

                if (query.IsActive.Value)
                {
                    // Hoạt động:
                    // - IsActive = true
                    // - Không bị khóa tạm, hoặc khóa đã hết hạn
                    usersQuery = usersQuery.Where(
                        u =>
                            u.IsActive &&
                            (
                                !u.LockedUntil.HasValue ||
                                u.LockedUntil <= now
                            )
                    );
                }
                else
                {
                    // Đã khóa:
                    // - Khóa vĩnh viễn
                    // - Hoặc đang còn thời hạn khóa tạm
                    usersQuery = usersQuery.Where(
                        u =>
                            !u.IsActive ||
                            (
                                u.LockedUntil.HasValue &&
                                u.LockedUntil > now
                            )
                    );
                }
            }

            usersQuery = usersQuery
                .OrderByDescending(u => u.CreatedAt);

            var totalItems =
                await usersQuery.CountAsync();

            var users = await usersQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new AdminUserResponseDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    DisplayName = u.DisplayName,
                    AvatarUrl = u.AvatarUrl,
                    Role = u.Role,
                    IsActive = u.IsActive,
                    LockedUntil = u.LockedUntil,
                    CreatedAt = u.CreatedAt,
                    UpdatedAt = u.UpdatedAt
                })
                .ToListAsync();

            var totalPages =
                totalItems == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalItems / (double)pageSize
                    );

            return new PagedResultDto<AdminUserResponseDto>
            {
                Items = users,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = totalPages
            };
        }

        public async Task UpdateRoleAsync(
            long currentAdminId,
            long userId,
            UpdateUserRoleDto dto
        )
        {
            var role = dto.Role.Trim();

            if (role != "User" && role != "Admin")
            {
                throw new ArgumentException(
                    "Quyền chỉ được là User hoặc Admin."
                );
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(
                    u =>
                        u.Id == userId &&
                        u.DeletedAt == null
                );

            if (user == null)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy người dùng."
                );
            }

            // Không cho Admin tự hạ quyền chính mình
            if (
                currentAdminId == userId &&
                role != "Admin"
            )
            {
                throw new InvalidOperationException(
                    "Không thể tự hạ quyền Admin của chính mình."
                );
            }

            user.Role = role;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        public async Task UpdateStatusAsync(
            long currentAdminId,
            long userId,
            UpdateUserStatusDto dto
        )
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(
                    u =>
                        u.Id == userId &&
                        u.DeletedAt == null
                );

            if (user == null)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy người dùng."
                );
            }

            // Không cho Admin tự khóa tài khoản mình
            if (
                currentAdminId == userId &&
                !dto.IsActive
            )
            {
                throw new InvalidOperationException(
                    "Không thể tự khóa tài khoản Admin đang đăng nhập."
                );
            }

            user.IsActive = dto.IsActive;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
        public async Task LockUserAsync(
            long id,
            int? days,
            bool permanent,
            long currentAdminId
        )
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(
                    u =>
                        u.Id == id &&
                        u.DeletedAt == null
                );

            if (user == null)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy người dùng."
                );
            }

            if (user.Id == currentAdminId)
            {
                throw new InvalidOperationException(
                    "Bạn không thể tự khóa tài khoản của mình."
                );
            }

            if (user.Role == "Admin")
            {
                bool hasAnotherActiveAdmin =
                    await _context.Users.AnyAsync(
                        u =>
                            u.Role == "Admin" &&
                            u.Id != id &&
                            u.IsActive &&
                            (
                                u.LockedUntil == null ||
                                u.LockedUntil <= DateTime.UtcNow
                            )
                    );

                if (!hasAnotherActiveAdmin)
                {
                    throw new InvalidOperationException(
                        "Không thể khóa quản trị viên hoạt động cuối cùng."
                    );
                }
            }

            if (permanent)
            {
                user.IsActive = false;
                user.LockedUntil = null;
            }
            else
            {
                if (
                    !days.HasValue ||
                    days.Value <= 0 ||
                    days.Value > 3650
                )
                {
                    throw new InvalidOperationException(
                        "Thời hạn khóa không hợp lệ."
                    );
                }

                user.IsActive = true;

                user.LockedUntil =
                    DateTime.UtcNow.AddDays(
                        days.Value
                    );
            }

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
        public async Task UnlockUserAsync(
            long id
        )
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(
                    u =>
                        u.Id == id &&
                        u.DeletedAt == null
                );

            if (user == null)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy người dùng."
                );
            }

            user.IsActive = true;
            user.LockedUntil = null;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
        public async Task DeleteUserAsync(
            long id,
            long currentAdminId
        )
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(
                    u =>
                        u.Id == id &&
                        u.DeletedAt == null
                );

            if (user == null)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy người dùng."
                );
            }

            if (user.Id == currentAdminId)
            {
                throw new InvalidOperationException(
                    "Bạn không thể tự xóa tài khoản của mình."
                );
            }

            if (user.Role == "Admin")
            {
                bool hasAnotherActiveAdmin =
                    await _context.Users.AnyAsync(
                        u =>
                            u.Role == "Admin" &&
                            u.Id != id &&
                            u.DeletedAt == null &&
                            u.IsActive &&
                            (
                                u.LockedUntil == null ||
                                u.LockedUntil <=
                                    DateTime.UtcNow
                            )
                    );

                if (!hasAnotherActiveAdmin)
                {
                    throw new InvalidOperationException(
                        "Không thể xóa quản trị viên hoạt động cuối cùng."
                    );
                }
            }

            user.DeletedAt =
                DateTime.UtcNow;

            user.IsActive = false;

            user.LockedUntil = null;

            user.UpdatedAt =
                DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}