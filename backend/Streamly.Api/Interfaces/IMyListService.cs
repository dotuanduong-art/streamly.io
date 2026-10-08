using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IMyListService
    {
        Task<List<MovieResponseDto>> GetMyListAsync(long userId);

        Task AddAsync(long userId, long movieId);

        Task RemoveAsync(long userId, long movieId);
    }
}