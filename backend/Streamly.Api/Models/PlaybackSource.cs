using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.Models
{
    public class PlaybackSource
    {
        public long Id { get; set; }

        public long MovieId { get; set; }

        [Required]
        [MaxLength(1000)]
        public string SourceUrl { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string SourceType { get; set; } = "MP4";

        [MaxLength(20)]
        public string? Quality { get; set; }

        [MaxLength(50)]
        public string? Language { get; set; }

        [MaxLength(100)]
        public string? ProviderName { get; set; }

        [MaxLength(100)]
        public string? License { get; set; }

        [MaxLength(1000)]
        public string? AttributionUrl { get; set; }

        [MaxLength(1000)]
        public string? SubtitleUrl { get; set; }

        [MaxLength(20)]
        public string? SubtitleLanguage { get; set; }

        [MaxLength(100)]
        public string? SubtitleLabel { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsDefault { get; set; } = false;

        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public Movie Movie { get; set; } = null!;
    }
}