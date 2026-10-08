using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface ITmdbImportService
    {
        Task<MovieResponseDto> ImportMovieAsync(int tmdbId);
    }
}