using System.Text.Json.Serialization;

namespace Streamly.Api.DTOs
{
    public class TmdbMovieDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("overview")]
        public string? Overview { get; set; }

        [JsonPropertyName("release_date")]
        public string? ReleaseDate { get; set; }

        [JsonPropertyName("runtime")]
        public int? Runtime { get; set; }

        [JsonPropertyName("poster_path")]
        public string? PosterPath { get; set; }

        [JsonPropertyName("backdrop_path")]
        public string? BackdropPath { get; set; }

        [JsonPropertyName("vote_average")]
        public double? VoteAverage { get; set; }

        [JsonPropertyName("popularity")]
        public double? Popularity { get; set; }

        [JsonPropertyName("genres")]
        public List<TmdbGenreDto> Genres { get; set; } = new();

        [JsonPropertyName("videos")]
        public TmdbVideosDto Videos { get; set; } = new();

        [JsonPropertyName("images")]
        public TmdbImagesDto Images { get; set; } = new();
    }

    public class TmdbGenreDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
    }

    public class TmdbVideosDto
    {
        [JsonPropertyName("results")]
        public List<TmdbVideoDto> Results { get; set; } = new();
    }

    public class TmdbVideoDto
    {
        [JsonPropertyName("key")]
        public string Key { get; set; } = string.Empty;

        [JsonPropertyName("site")]
        public string Site { get; set; } = string.Empty;

        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;

        [JsonPropertyName("official")]
        public bool Official { get; set; }
    }
        public class TmdbImagesDto
    {
        [JsonPropertyName("backdrops")]
        public List<TmdbImageDto> Backdrops { get; set; } = new();
    }

    public class TmdbImageDto
    {
        [JsonPropertyName("file_path")]
        public string FilePath { get; set; } = string.Empty;

        [JsonPropertyName("width")]
        public int Width { get; set; }

        [JsonPropertyName("height")]
        public int Height { get; set; }

        [JsonPropertyName("vote_average")]
        public double VoteAverage { get; set; }

        [JsonPropertyName("vote_count")]
        public int VoteCount { get; set; }

        [JsonPropertyName("iso_639_1")]
        public string? Language { get; set; }
    }
}