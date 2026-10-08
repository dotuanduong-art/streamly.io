using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        [MinLength(2)]
        [MaxLength(50)]
        public string DisplayName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }
    }
}