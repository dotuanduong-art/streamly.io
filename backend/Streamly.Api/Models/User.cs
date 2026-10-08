using System.ComponentModel.DataAnnotations;

namespace Streamly.Api.Models
{
    public class User
    {
        public long Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string DisplayName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? AvatarUrl { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = "User";

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<MyListItem> MyListItems { get; set; }
            = new List<MyListItem>();
        public ICollection<WatchHistory> WatchHistories { get; set; }
            = new List<WatchHistory>();
    }
}