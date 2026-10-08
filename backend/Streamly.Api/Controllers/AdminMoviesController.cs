using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/admin/movies")]
    [Authorize(Roles = "Admin")]
    public class AdminMoviesController : ControllerBase
    {
        private readonly IAdminMovieService _adminMovieService;

        public AdminMoviesController(
            IAdminMovieService adminMovieService
        )
        {
            _adminMovieService = adminMovieService;
        }

        [HttpGet]
        public async Task<
            ActionResult<PagedResultDto<MovieResponseDto>>
        > GetMovies(
            [FromQuery] AdminMovieQueryDto query
        )
        {
            var result =
                await _adminMovieService.GetMoviesAsync(query);

            return Ok(result);
        }
    }
}