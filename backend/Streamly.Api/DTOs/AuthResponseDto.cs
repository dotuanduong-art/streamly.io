namespace Streamly.Api.DTOs
{
    public class AuthResponseDto
    {
        public string AccessToken { get; set; } = string.Empty;

        public UserResponseDto User { get; set; } = new();
    }
}