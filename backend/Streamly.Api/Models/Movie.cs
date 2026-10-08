using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.Models
{
    public class Movie
    {
        public long Id { get; set; }

        [Required]
        public int TmdbId { get; set; }

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Overview { get; set; }

        public DateTime? ReleaseDate { get; set; }

        public int? DurationMinutes { get; set; }

        [MaxLength(500)]
        public string? PosterUrl { get; set; }

        [MaxLength(500)]
        public string? BackdropUrl { get; set; }

        [MaxLength(100)]
        public string? TrailerKey { get; set; }
        public double? VoteAverage { get; set; }

        public double? Popularity { get; set; }

        public long ViewCount { get; set; } = 0;
        public bool IsVisible { get; set; } = true;

        public bool IsFeatured { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<MovieGenre> MovieGenres { get; set; }
            = new List<MovieGenre>();
        public ICollection<MyListItem> MyListItems { get; set; }
            = new List<MyListItem>();
        public ICollection<WatchHistory> WatchHistories { get; set; }
            = new List<WatchHistory>();
    }
}