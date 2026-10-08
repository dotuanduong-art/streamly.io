using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.DTOs
{
    public class LoginDto
    {
        [Required]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}