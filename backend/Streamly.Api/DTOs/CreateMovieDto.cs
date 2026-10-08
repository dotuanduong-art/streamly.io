using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.DTOs
{
    public class CreateMovieDto
    {
        [Required]
        [Range(1, int.MaxValue,
            ErrorMessage = "TMDB ID phải lớn hơn 0.")]
        public int TmdbId { get; set; }

        [Required(ErrorMessage = "Tên phim không được để trống.")]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        public string? Overview { get; set; }

        public DateTime? ReleaseDate { get; set; }

        [Range(1, 1000,
            ErrorMessage = "Thời lượng phim phải từ 1 đến 1000 phút.")]
        public int? DurationMinutes { get; set; }

        [MaxLength(500)]
        public string? PosterUrl { get; set; }

        [MaxLength(500)]
        public string? BackdropUrl { get; set; }

        [MaxLength(100)]
        public string? TrailerKey { get; set; }
        [Range(0.0, 10.0,
            ErrorMessage = "Điểm đánh giá phải từ 0 đến 10.")]
        public double? VoteAverage { get; set; }

        [Range(0.0, double.MaxValue,
            ErrorMessage = "Popularity không được âm.")]
        public double? Popularity { get; set; }
        public bool IsVisible { get; set; } = true;

        public bool IsFeatured { get; set; } = false;
    }
}