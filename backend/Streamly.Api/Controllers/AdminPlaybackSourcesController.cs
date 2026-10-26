using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminPlaybackSourcesController
        : ControllerBase
    {
        private readonly IPlaybackSourceService
            _playbackSourceService;

        public AdminPlaybackSourcesController(
            IPlaybackSourceService playbackSourceService)
        {
            _playbackSourceService =
                playbackSourceService;
        }

        [HttpGet(
            "movies/{movieId:long}/playback-sources"
        )]
        public async Task<IActionResult>
            GetMovieSources(long movieId)
        {
            var sources =
                await _playbackSourceService
                    .GetAllByMovieAsync(movieId);

            return Ok(sources);
        }

        [HttpPost(
            "movies/{movieId:long}/playback-sources"
        )]
        public async Task<IActionResult>
            Create(
                long movieId,
                [FromBody]
                CreatePlaybackSourceDto dto)
        {
            try
            {
                var source =
                    await _playbackSourceService
                        .CreateAsync(movieId, dto);

                return Created(
                    $"/api/admin/movies/{movieId}/playback-sources/{source.Id}",
                    source
                );
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
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("playback-sources/{id:long}")]
        public async Task<IActionResult>
            Update(
                long id,
                [FromBody]
                UpdatePlaybackSourceDto dto)
        {
            try
            {
                bool result =
                    await _playbackSourceService
                        .UpdateAsync(id, dto);

                if (!result)
                {
                    return NotFound(new
                    {
                        message =
                            "Không tìm thấy nguồn phát."
                    });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("playback-sources/{id:long}")]
        public async Task<IActionResult>
            Delete(long id)
        {
            bool result =
                await _playbackSourceService
                    .DeleteAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    message =
                        "Không tìm thấy nguồn phát."
                });
            }

            return NoContent();
        }
    }
}