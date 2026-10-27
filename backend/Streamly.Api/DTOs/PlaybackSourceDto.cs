namespace Streamly.Api.DTOs
{
    public class PlaybackSourceDto
    {
        public long Id { get; set; }

        public long MovieId { get; set; }

        public string SourceUrl { get; set; } = string.Empty;

        public string SourceType { get; set; } = string.Empty;

        public string? Quality { get; set; }

        public string? Language { get; set; }

        public string? ProviderName { get; set; }

        public string? License { get; set; }

        public string? AttributionUrl { get; set; }

        public string? SubtitleUrl { get; set; }

        public string? SubtitleLanguage { get; set; }

        public string? SubtitleLabel { get; set; }

        public bool IsActive { get; set; }

        public bool IsDefault { get; set; }

        public int SortOrder { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
    }
}