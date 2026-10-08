namespace Streamly.Api.DTOs
{
    public class MovieResponseDto
    {
        public long Id { get; set; }

        public int TmdbId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Overview { get; set; }

        public DateTime? ReleaseDate { get; set; }

        public int? DurationMinutes { get; set; }

        public string? PosterUrl { get; set; }

        public string? BackdropUrl { get; set; }

        public string? TrailerKey { get; set; }
        public double? VoteAverage { get; set; }

        public double? Popularity { get; set; }

        public long ViewCount { get; set; }
        public bool IsVisible { get; set; }

        public bool IsFeatured { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }
        public List<GenreDto> Genres { get; set; } = new();
    }
}