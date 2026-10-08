using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IGenreService
    {
        Task<List<GenreDto>> GetAllAsync();

        Task<GenreDto> CreateAsync(CreateGenreDto dto);

        Task<List<MovieResponseDto>> GetMoviesAsync(long genreId);

        Task<bool> AddGenreToMovieAsync(
            long movieId,
            long genreId
        );

        Task<bool> RemoveGenreFromMovieAsync(
            long movieId,
            long genreId
        );
    }
}