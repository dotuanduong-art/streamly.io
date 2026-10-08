using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.DTOs
{
    public class AdminGenreUpsertDto
    {
        public int? TmdbId { get; set; }

        [Required]
        [MinLength(1)]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}