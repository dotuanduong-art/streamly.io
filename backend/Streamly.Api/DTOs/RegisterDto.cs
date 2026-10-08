using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.DTOs
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có ít nhất 8 ký tự.")]
        [MaxLength(100)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MinLength(2, ErrorMessage = "Tên hiển thị phải có ít nhất 2 ký tự.")]
        [MaxLength(100)]
        public string DisplayName { get; set; } = string.Empty;
    }
}