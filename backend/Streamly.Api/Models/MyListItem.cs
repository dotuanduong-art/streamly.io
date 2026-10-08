namespace Streamly.Api.Models
{
    public class MyListItem
    {
        public long UserId { get; set; }
        public User User { get; set; } = null!;

        public long MovieId { get; set; }
        public Movie Movie { get; set; } = null!;

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}