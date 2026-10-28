namespace Streamly.Api.DTOs
{
    public class LockUserDto
    {
        public int? Days { get; set; }

        public bool Permanent { get; set; }
    }
}