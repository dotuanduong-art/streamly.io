namespace Streamly.Api.DTOs
{
    public class UserResponseDto
    {
        public long Id { get; set; }

        public string Email { get; set; } = string.Empty;

        public string DisplayName { get; set; } = string.Empty;

        public string? AvatarUrl { get; set; }

        public string Role { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}