using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/my-list")]
    [Authorize]
    public class MyListController : ControllerBase
    {
        private readonly IMyListService _myListService;

        public MyListController(IMyListService myListService)
        {
            _myListService = myListService;
        }

        [HttpGet]
        public async Task<ActionResult<List<MovieResponseDto>>> GetMyList()
        {
            var userId = GetCurrentUserId();

            var movies =
                await _myListService.GetMyListAsync(userId);

            return Ok(movies);
        }

        [HttpPost("{movieId:long}")]
        public async Task<IActionResult> Add(long movieId)
        {
            try
            {
                var userId = GetCurrentUserId();

                await _myListService.AddAsync(
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
            catch (InvalidOperationException ex)
            {
                return Conflict(new
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

                await _myListService.RemoveAsync(
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