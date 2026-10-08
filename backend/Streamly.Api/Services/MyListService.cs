using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Streamly.Api.Models;

namespace Streamly.Api.Services
{
    public class MyListService : IMyListService
    {
        private readonly AppDbContext _context;

        public MyListService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<MovieResponseDto>> GetMyListAsync(long userId)
        {
            var items = await _context.MyListItems
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId &&
                    x.Movie.IsVisible)
                .Include(x => x.Movie)
                    .ThenInclude(m => m.MovieGenres)
                        .ThenInclude(mg => mg.Genre)
                .OrderByDescending(x => x.AddedAt)
                .ToListAsync();

            return items
                .Select(x => MapMovie(x.Movie))
                .ToList();
        }

        public async Task AddAsync(long userId, long movieId)
        {
            var movieExists = await _context.Movies
                .AnyAsync(m =>
                    m.Id == movieId &&
                    m.IsVisible);

            if (!movieExists)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy phim."
                );
            }

            var alreadyExists =
                await _context.MyListItems
                    .AnyAsync(x =>
                        x.UserId == userId &&
                        x.MovieId == movieId);

            if (alreadyExists)
            {
                throw new InvalidOperationException(
                    "Phim đã có trong danh sách."
                );
            }

            var item = new MyListItem
            {
                UserId = userId,
                MovieId = movieId,
                AddedAt = DateTime.UtcNow
            };

            _context.MyListItems.Add(item);

            await _context.SaveChangesAsync();
        }

        public async Task RemoveAsync(long userId, long movieId)
        {
            var item = await _context.MyListItems
                .FirstOrDefaultAsync(x =>
                    x.UserId == userId &&
                    x.MovieId == movieId);

            if (item == null)
            {
                throw new KeyNotFoundException(
                    "Phim không có trong danh sách."
                );
            }

            _context.MyListItems.Remove(item);

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