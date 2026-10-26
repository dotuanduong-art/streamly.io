using Microsoft.AspNetCore.Mvc;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/playback")]
    public class PlaybackController : ControllerBase
    {
        private readonly IPlaybackSourceService
            _playbackSourceService;

        public PlaybackController(
            IPlaybackSourceService playbackSourceService)
        {
            _playbackSourceService =
                playbackSourceService;
        }

        [HttpGet("movies/{movieId:long}/sources")]
        public async Task<IActionResult> GetSources(
            long movieId)
        {
            var sources =
                await _playbackSourceService
                    .GetActiveByMovieAsync(movieId);

            return Ok(sources);
        }
    }
}