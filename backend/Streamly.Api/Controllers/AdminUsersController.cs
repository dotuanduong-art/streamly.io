using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Roles = "Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly IAdminUserService _service;

        public AdminUsersController(
            IAdminUserService service
        )
        {
            _service = service;
        }

        [HttpGet]
        public async Task<
            ActionResult<PagedResultDto<AdminUserResponseDto>>
        > GetUsers(
            [FromQuery] AdminUserQueryDto query
        )
        {
            var result =
                await _service.GetUsersAsync(query);

            return Ok(result);
        }

        [HttpPut("{id:long}/role")]
        public async Task<IActionResult> UpdateRole(
            long id,
            UpdateUserRoleDto dto
        )
        {
            try
            {
                await _service.UpdateRoleAsync(
                    GetCurrentUserId(),
                    id,
                    dto
                );

                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id:long}/status")]
        public async Task<IActionResult> UpdateStatus(
            long id,
            UpdateUserStatusDto dto
        )
        {
            try
            {
                await _service.UpdateStatusAsync(
                    GetCurrentUserId(),
                    id,
                    dto
                );

                return NoContent();
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(
                ClaimTypes.NameIdentifier
            );

            if (
                string.IsNullOrWhiteSpace(value) ||
                !long.TryParse(value, out var userId)
            )
            {
                throw new UnauthorizedAccessException(
                    "Token không hợp lệ."
                );
            }

            return userId;
        }
    }
}