using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IAdminMovieService
    {
        Task<PagedResultDto<MovieResponseDto>> GetMoviesAsync(
            AdminMovieQueryDto query
        );
    }
}