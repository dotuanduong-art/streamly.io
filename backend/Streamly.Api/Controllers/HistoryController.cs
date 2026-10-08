using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/history")]
    [Authorize]
    public class HistoryController : ControllerBase
    {
        private readonly IHistoryService _historyService;

        public HistoryController(IHistoryService historyService)
        {
            _historyService = historyService;
        }

        [HttpGet]
        public async Task<ActionResult<List<HistoryResponseDto>>> GetHistory()
        {
            var userId = GetCurrentUserId();

            var history =
                await _historyService.GetHistoryAsync(userId);

            return Ok(history);
        }

        [HttpPost("{movieId:long}")]
        public async Task<IActionResult> AddOrUpdate(long movieId)
        {
            try
            {
                var userId = GetCurrentUserId();

                await _historyService.AddOrUpdateAsync(
                    userId,
                    movieId
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
        }

        [HttpDelete("{movieId:long}")]
        public async Task<IActionResult> Remove(long movieId)
        {
            try
            {
                var userId = GetCurrentUserId();

                await _historyService.RemoveAsync(
                    userId,
                    movieId
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
        }

        [HttpDelete]
        public async Task<IActionResult> Clear()
        {
            var userId = GetCurrentUserId();

            await _historyService.ClearAsync(userId);

            return NoContent();
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