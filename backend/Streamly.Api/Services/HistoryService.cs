using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Streamly.Api.Models;

namespace Streamly.Api.Services
{
    public class HistoryService : IHistoryService
    {
        private readonly AppDbContext _context;

        public HistoryService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<HistoryResponseDto>> GetHistoryAsync(long userId)
        {
            var items = await _context.WatchHistories
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId &&
                    x.Movie.IsVisible)
                .Include(x => x.Movie)
                    .ThenInclude(m => m.MovieGenres)
                        .ThenInclude(mg => mg.Genre)
                .OrderByDescending(x => x.WatchedAt)
                .ToListAsync();

            return items
                .Select(x => new HistoryResponseDto
                {
                    Movie = MapMovie(x.Movie),
                    WatchedAt = x.WatchedAt
                })
                .ToList();
        }

        public async Task AddOrUpdateAsync(long userId, long movieId)
        {
            var movie = await _context.Movies
                .FirstOrDefaultAsync(m =>
                    m.Id == movieId &&
                    m.IsVisible);

            if (movie == null)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy phim."
                );
            }

            var history = await _context.WatchHistories
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.MovieId == movieId);

            if (history == null)
            {
                history = new WatchHistory
                {
                    UserId = userId,
                    MovieId = movieId,
                    WatchedAt = DateTime.UtcNow
                };

                _context.WatchHistories.Add(history);
            }
            else
            {
                history.WatchedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task RemoveAsync(long userId, long movieId)
        {
            var history = await _context.WatchHistories
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.MovieId == movieId);

            if (history == null)
            {
                throw new KeyNotFoundException(
                    "Phim không có trong lịch sử."
                );
            }

            _context.WatchHistories.Remove(history);

            await _context.SaveChangesAsync();
        }

        public async Task ClearAsync(long userId)
        {
            var histories = await _context.WatchHistories
                .Where(x => x.UserId == userId)
                .ToListAsync();

            _context.WatchHistories.RemoveRange(histories);

            await _context.SaveChangesAsync();
        }

        private static MovieResponseDto MapMovie(Movie movie)
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
                IsVisible = movie.IsVisible,
                IsFeatured = movie.IsFeatured,
                CreatedAt = movie.CreatedAt,
                UpdatedAt = movie.UpdatedAt,
                VoteAverage = movie.VoteAverage,
                Popularity = movie.Popularity,
                ViewCount = movie.ViewCount,

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