using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IHistoryService
    {
        Task<List<HistoryResponseDto>> GetHistoryAsync(long userId);

        Task AddOrUpdateAsync(long userId, long movieId);

        Task RemoveAsync(long userId, long movieId);

        Task ClearAsync(long userId);
    }
}