namespace Streamly.Api.DTOs
{
    public class GenreDto
    {
        public long Id { get; set; }

        public int? TmdbId { get; set; }

        public string Name { get; set; } = string.Empty;
    }
}