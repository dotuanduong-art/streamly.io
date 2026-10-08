using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.Models
{
    public class Genre
    {
        public long Id { get; set; }

        public int? TmdbId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<MovieGenre> MovieGenres { get; set; }
            = new List<MovieGenre>();
    }
}