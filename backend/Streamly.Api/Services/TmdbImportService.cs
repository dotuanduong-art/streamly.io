using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Streamly.Api.Models;

namespace Streamly.Api.Services
{
    public class TmdbImportService : ITmdbImportService
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public TmdbImportService(
            AppDbContext context,
            HttpClient httpClient,
            IConfiguration configuration
        )
        {
            _context = context;
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<MovieResponseDto> ImportMovieAsync(
            int tmdbId
        )
        {
            if (tmdbId <= 0)
            {
                throw new ArgumentException(
                    "TMDB ID không hợp lệ."
                );
            }

            // Không cho import trùng phim
            var duplicated = await _context.Movies
                .AnyAsync(m => m.TmdbId == tmdbId);

            if (duplicated)
            {
                throw new InvalidOperationException(
                    "Phim này đã tồn tại trong hệ thống."
                );
            }

            var token =
                _configuration["Tmdb:AccessToken"];

            if (string.IsNullOrWhiteSpace(token))
            {
                throw new InvalidOperationException(
                    "Chưa cấu hình TMDB Access Token."
                );
            }

            var request = new HttpRequestMessage(
                HttpMethod.Get,
                $"movie/{tmdbId}?language=vi-VN&append_to_response=videos"
            );

            request.Headers.Authorization =
                new AuthenticationHeaderValue(
                    "Bearer",
                    token
                );

            request.Headers.Accept.Add(
                new MediaTypeWithQualityHeaderValue(
                    "application/json"
                )
            );

            var response =
                await _httpClient.SendAsync(request);

            if (
                response.StatusCode ==
                System.Net.HttpStatusCode.NotFound
            )
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy phim trên TMDB."
                );
            }

            if (
                response.StatusCode ==
                System.Net.HttpStatusCode.Unauthorized
            )
            {
                throw new InvalidOperationException(
                    "TMDB Access Token không hợp lệ."
                );
            }

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException(
                    $"TMDB trả về lỗi {(int)response.StatusCode}."
                );
            }

            var json =
                await response.Content.ReadAsStringAsync();

            var tmdbMovie =
                JsonSerializer.Deserialize<TmdbMovieDto>(
                    json,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }
                );

            if (tmdbMovie == null)
            {
                throw new InvalidOperationException(
                    "Không đọc được dữ liệu phim từ TMDB."
                );
            }

            DateTime? releaseDate = null;

            if (
                !string.IsNullOrWhiteSpace(
                    tmdbMovie.ReleaseDate
                ) &&
                DateTime.TryParse(
                    tmdbMovie.ReleaseDate,
                    out var parsedDate
                )
            )
            {
                releaseDate = parsedDate;
            }

            var trailer = tmdbMovie.Videos.Results
                .Where(v =>
                    string.Equals(
                        v.Site,
                        "YouTube",
                        StringComparison.OrdinalIgnoreCase
                    ))
                .OrderByDescending(v =>
                    v.Official &&
                    string.Equals(
                        v.Type,
                        "Trailer",
                        StringComparison.OrdinalIgnoreCase
                    ))
                .ThenByDescending(v =>
                    string.Equals(
                        v.Type,
                        "Trailer",
                        StringComparison.OrdinalIgnoreCase
                    ))
                .FirstOrDefault();

            var movie = new Movie
            {
                TmdbId = tmdbMovie.Id,

                Title = string.IsNullOrWhiteSpace(
                    tmdbMovie.Title
                )
                    ? $"TMDB {tmdbMovie.Id}"
                    : tmdbMovie.Title,

                Overview = tmdbMovie.Overview,

                ReleaseDate = releaseDate,

                DurationMinutes = tmdbMovie.Runtime,

                PosterUrl =
                    BuildPosterUrl(
                        tmdbMovie.PosterPath
                    ),

                BackdropUrl =
                    BuildBackdropUrl(
                        tmdbMovie.BackdropPath
                    ),

                TrailerKey =
                    trailer?.Key,

                VoteAverage =
                    tmdbMovie.VoteAverage,

                Popularity =
                    tmdbMovie.Popularity,

                ViewCount = 0,

                IsVisible = true,

                IsFeatured = false,

                CreatedAt = DateTime.UtcNow,

                UpdatedAt = DateTime.UtcNow
            };

            // Import các thể loại
            foreach (
                var tmdbGenre in tmdbMovie.Genres
            )
            {
                var genre =
                    await _context.Genres
                        .FirstOrDefaultAsync(
                            g =>
                                g.TmdbId ==
                                tmdbGenre.Id
                        );

                if (genre == null)
                {
                    genre = new Genre
                    {
                        TmdbId =
                            tmdbGenre.Id,

                        Name =
                            tmdbGenre.Name
                    };

                    _context.Genres.Add(
                        genre
                    );
                }

                movie.MovieGenres.Add(
                    new MovieGenre
                    {
                        Movie = movie,
                        Genre = genre
                    }
                );
            }

            _context.Movies.Add(movie);

            await _context.SaveChangesAsync();

            return MapMovie(movie);
        }

        private static string? BuildPosterUrl(
            string? path
        )
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return null;
            }

            return
                $"https://image.tmdb.org/t/p/w500{path}";
        }

        private static string? BuildBackdropUrl(
            string? path
        )
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return null;
            }

            return
                $"https://image.tmdb.org/t/p/original{path}";
        }

        private static MovieResponseDto MapMovie(
            Movie movie
        )
        {
            return new MovieResponseDto
            {
                Id = movie.Id,
                TmdbId = movie.TmdbId,
                Title = movie.Title,
                Overview = movie.Overview,
                ReleaseDate = movie.ReleaseDate,
                DurationMinutes =
                    movie.DurationMinutes,
                PosterUrl = movie.PosterUrl,
                BackdropUrl =
                    movie.BackdropUrl,
                TrailerKey = movie.TrailerKey,
                IsVisible = movie.IsVisible,
                IsFeatured = movie.IsFeatured,
                CreatedAt = movie.CreatedAt,
                UpdatedAt = movie.UpdatedAt,
                VoteAverage =
                    movie.VoteAverage,
                Popularity = movie.Popularity,
                ViewCount = movie.ViewCount,

                Genres = movie.MovieGenres
                    .Select(mg =>
                        new GenreDto
                        {
                            Id = mg.Genre.Id,
                            Name = mg.Genre.Name
                        })
                    .ToList()
            };
        }
    }
}