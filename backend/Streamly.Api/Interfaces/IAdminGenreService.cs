using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IAdminGenreService
    {
        Task<List<GenreDto>> GetAllAsync();

        Task<GenreDto> CreateAsync(
            AdminGenreUpsertDto dto
        );

        Task UpdateAsync(
            long id,
            AdminGenreUpsertDto dto
        );

        Task DeleteAsync(long id);
    }
}