using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/admin/tmdb")]
    [Authorize(Roles = "Admin")]
    public class AdminTmdbController : ControllerBase
    {
        private readonly ITmdbImportService _service;

        public AdminTmdbController(
            ITmdbImportService service
        )
        {
            _service = service;
        }

        [HttpPost("import/{tmdbId:int}")]
        public async Task<ActionResult<MovieResponseDto>>
            Import(int tmdbId)
        {
            try
            {
                var movie =
                    await _service.ImportMovieAsync(
                        tmdbId
                    );

                return Created(
                    $"/api/movies/{movie.Id}",
                    movie
                );
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
            catch (HttpRequestException ex)
            {
                return StatusCode(
                    502,
                    new
                    {
                        message = ex.Message
                    }
                );
            }
        }
    }
}