using Microsoft.AspNetCore.Mvc;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace Streamly.Api.Controllers
{
    [ApiController]
    [Route("api/movies")]
    public class MoviesController : ControllerBase
    {
        private readonly IMovieService _movieService;

        public MoviesController(IMovieService movieService)
        {
            _movieService = movieService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var movies = await _movieService.GetAllAsync();

            return Ok(movies);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var movie = await _movieService.GetByIdAsync(id);

            if (movie == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy phim."
                });
            }

            return Ok(movie);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? q,
            [FromQuery] int limit = 6)
        {
            var movies = await _movieService.SearchAsync(
                q,
                limit
            );

            return Ok(movies);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(
            [FromBody] CreateMovieDto dto)
        {
            try
            {
                var movie =
                    await _movieService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = movie.Id },
                    movie
                );
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(
            long id,
            [FromBody] UpdateMovieDto dto)
        {
            var result =
                await _movieService.UpdateAsync(id, dto);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy phim."
                });
            }

            return NoContent();
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var result =
                await _movieService.DeleteAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy phim."
                });
            }

            return NoContent();
        }

        // Gắn một thể loại vào phim
        [HttpPost("{movieId:long}/genres/{genreId:long}")]
        public async Task<IActionResult> AddGenre(
            long movieId,
            long genreId,
            [FromServices] IGenreService genreService)
        {
            try
            {
                bool result =
                    await genreService.AddGenreToMovieAsync(
                        movieId,
                        genreId
                    );

                if (!result)
                {
                    return NotFound(new
                    {
                        message = "Không tìm thấy phim hoặc thể loại."
                    });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        // Xóa một thể loại khỏi phim
        [HttpDelete("{movieId:long}/genres/{genreId:long}")]
        public async Task<IActionResult> RemoveGenre(
            long movieId,
            long genreId,
            [FromServices] IGenreService genreService)
        {
            bool result =
                await genreService.RemoveGenreFromMovieAsync(
                    movieId,
                    genreId
                );

            if (!result)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy liên kết thể loại."
                });
            }

            return NoContent();
        }
    }
}