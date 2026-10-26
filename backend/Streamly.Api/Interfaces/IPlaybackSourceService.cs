using Streamly.Api.DTOs;

namespace Streamly.Api.Interfaces
{
    public interface IPlaybackSourceService
    {
        Task<List<PlaybackSourceDto>> GetActiveByMovieAsync(
            long movieId
        );

        Task<List<PlaybackSourceDto>> GetAllByMovieAsync(
            long movieId
        );

        Task<PlaybackSourceDto> CreateAsync(
            long movieId,
            CreatePlaybackSourceDto dto
        );

        Task<bool> UpdateAsync(
            long id,
            UpdatePlaybackSourceDto dto
        );

        Task<bool> DeleteAsync(long id);
    }
}