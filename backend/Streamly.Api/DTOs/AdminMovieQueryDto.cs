namespace Streamly.Api.DTOs
{
    public class AdminMovieQueryDto
    {
        public string? Q { get; set; }

        public bool? IsVisible { get; set; }

        public bool? IsFeatured { get; set; }

        public bool? HasTrailer { get; set; }

        public string Sort { get; set; } = "newest";

        public int Page { get; set; } = 1;

        public int PageSize { get; set; } = 10;
    }
}