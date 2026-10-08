using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IMovieService
    {
        Task<List<MovieResponseDto>> GetAllAsync();

        Task<MovieResponseDto?> GetByIdAsync(long id);

        Task<List<MovieResponseDto>> SearchAsync(
            string? keyword,
            int limit = 6
        );

        Task<MovieResponseDto> CreateAsync(CreateMovieDto dto);

        Task<bool> UpdateAsync(long id, UpdateMovieDto dto);

        Task<bool> DeleteAsync(long id);
    }
}