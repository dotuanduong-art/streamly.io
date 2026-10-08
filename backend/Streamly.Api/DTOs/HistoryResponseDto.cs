namespace Streamly.Api.DTOs
{
    public class HistoryResponseDto
    {
        public MovieResponseDto Movie { get; set; } = null!;

        public DateTime WatchedAt { get; set; }
    }
}