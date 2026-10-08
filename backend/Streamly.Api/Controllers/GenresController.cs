using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/genres")]
    public class GenresController : ControllerBase
    {
        private readonly IGenreService _genreService;

        public GenresController(
            IGenreService genreService)
        {
            _genreService = genreService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var genres =
                await _genreService.GetAllAsync();

            return Ok(genres);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(
            [FromBody] CreateGenreDto dto)
        {
            try
            {
                var genre =
                    await _genreService.CreateAsync(dto);

                return StatusCode(201, genre);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("{id:long}/movies")]
        public async Task<IActionResult> GetMovies(
            long id)
        {
            var movies =
                await _genreService.GetMoviesAsync(id);

            return Ok(movies);
        }
    }
}