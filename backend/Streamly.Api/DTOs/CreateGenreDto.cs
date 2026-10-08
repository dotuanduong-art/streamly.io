using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.DTOs
{
    public class CreateGenreDto
    {
        public int? TmdbId { get; set; }

        [Required(ErrorMessage = "Tên thể loại không được để trống.")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;
    }
}