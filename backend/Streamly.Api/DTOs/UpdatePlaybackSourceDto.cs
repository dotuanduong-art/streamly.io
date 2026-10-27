using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.DTOs
{
    public class UpdatePlaybackSourceDto
    {
        [Required(ErrorMessage = "URL nguồn phim không được để trống.")]
        [MaxLength(1000)]
        public string SourceUrl { get; set; } = string.Empty;

        [Required(ErrorMessage = "Loại nguồn phim không được để trống.")]
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

        public bool IsActive { get; set; }

        public bool IsDefault { get; set; }

        [Range(0, 1000)]
        public int SortOrder { get; set; }
    }
}