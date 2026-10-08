using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Streamly.Api.Models;

namespace Streamly.Api.Services
{
    public class MovieService : IMovieService
    {
        private readonly AppDbContext _context;

        public MovieService(AppDbContext context)
        {
            _context = context;
        }

        // Public: chỉ lấy phim đang hiển thị
        public async Task<List<MovieResponseDto>> GetAllAsync()
        {
            return await _context.Movies
                .Where(m => m.IsVisible)
                .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genre)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => ToDto(m))
                .ToListAsync();

        }

        // Public: phim bị ẩn cũng được coi như không tồn tại
        public async Task<MovieResponseDto?> GetByIdAsync(long id)
        {
            var movie = await _context.Movies
                .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genre)
                .FirstOrDefaultAsync(
                    m => m.Id == id && m.IsVisible
                );

            if (movie == null)
            {
                return null;
            }

            return ToDto(movie);
        }

        // Public search
        public async Task<List<MovieResponseDto>> SearchAsync(
            string? keyword,
            int limit = 6)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return new List<MovieResponseDto>();
            }

            keyword = keyword.Trim();

            // Tránh client yêu cầu số lượng quá lớn
            limit = Math.Clamp(limit, 1, 50);

            return await _context.Movies
                .Where(m =>
                    m.IsVisible &&
                    m.Title.Contains(keyword)
                )
                .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genre)
                .OrderByDescending(m => m.CreatedAt)
                .Take(limit)
                .Select(m => ToDto(m))
                .ToListAsync();
        }

        public async Task<MovieResponseDto> CreateAsync(
            CreateMovieDto dto)
        {
            bool tmdbExists = await _context.Movies
                .AnyAsync(m => m.TmdbId == dto.TmdbId);

            if (tmdbExists)
            {
                throw new InvalidOperationException(
                    "Phim với TMDB ID này đã tồn tại."
                );
            }

            var movie = new Movie
            {
                TmdbId = dto.TmdbId,
                Title = dto.Title.Trim(),
                Overview = dto.Overview,
                ReleaseDate = dto.ReleaseDate,
                DurationMinutes = dto.DurationMinutes,
                PosterUrl = dto.PosterUrl,
                BackdropUrl = dto.BackdropUrl,
                TrailerKey = dto.TrailerKey,
                VoteAverage = dto.VoteAverage,
                Popularity = dto.Popularity,
                ViewCount = 0,
                IsVisible = dto.IsVisible,
                IsFeatured = dto.IsFeatured,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Movies.Add(movie);

            await _context.SaveChangesAsync();

            return ToDto(movie);
        }

        public async Task<bool> UpdateAsync(
            long id,
            UpdateMovieDto dto)
        {
            var movie = await _context.Movies
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null)
            {
                return false;
            }

            movie.Title = dto.Title.Trim();
            movie.Overview = dto.Overview;
            movie.ReleaseDate = dto.ReleaseDate;
            movie.DurationMinutes = dto.DurationMinutes;
            movie.PosterUrl = dto.PosterUrl;
            movie.BackdropUrl = dto.BackdropUrl;
            movie.TrailerKey = dto.TrailerKey;
            movie.VoteAverage = dto.VoteAverage;
            movie.Popularity = dto.Popularity;
            movie.IsVisible = dto.IsVisible;
            movie.IsFeatured = dto.IsFeatured;
            movie.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var movie = await _context.Movies
                .FirstOrDefaultAsync(m => m.Id == id);

            if (movie == null)
            {
                return false;
            }

            _context.Movies.Remove(movie);

            await _context.SaveChangesAsync();

            return true;
        }

        private static MovieResponseDto ToDto(Movie movie)
        {
            return new MovieResponseDto
            {
                Id = movie.Id,
                TmdbId = movie.TmdbId,
                Title = movie.Title,
                Overview = movie.Overview,
                ReleaseDate = movie.ReleaseDate,
                DurationMinutes = movie.DurationMinutes,
                PosterUrl = movie.PosterUrl,
                BackdropUrl = movie.BackdropUrl,
                TrailerKey = movie.TrailerKey,
                VoteAverage = movie.VoteAverage,
                Popularity = movie.Popularity,
                ViewCount = movie.ViewCount,
                IsVisible = movie.IsVisible,
                IsFeatured = movie.IsFeatured,
                CreatedAt = movie.CreatedAt,
                UpdatedAt = movie.UpdatedAt,

                Genres = movie.MovieGenres
                    .Select(mg => new GenreDto
                    {
                        Id = mg.Genre.Id,
                        TmdbId = mg.Genre.TmdbId,
                        Name = mg.Genre.Name
                    })
                    .ToList()
            };
        }
    }
}