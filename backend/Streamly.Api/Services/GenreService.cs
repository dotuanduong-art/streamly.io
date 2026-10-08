using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Streamly.Api.Models;

namespace Streamly.Api.Services
{
    public class GenreService : IGenreService
    {
        private readonly AppDbContext _context;

        public GenreService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<GenreDto>> GetAllAsync()
        {
            return await _context.Genres
                .OrderBy(g => g.Name)
                .Select(g => new GenreDto
                {
                    Id = g.Id,
                    TmdbId = g.TmdbId,
                    Name = g.Name
                })
                .ToListAsync();
        }

        public async Task<GenreDto> CreateAsync(
            CreateGenreDto dto)
        {
            string name = dto.Name.Trim();

            bool exists = await _context.Genres
                .AnyAsync(g => g.Name == name);

            if (exists)
            {
                throw new InvalidOperationException(
                    "Thể loại này đã tồn tại."
                );
            }

            if (dto.TmdbId.HasValue)
            {
                bool tmdbExists = await _context.Genres
                    .AnyAsync(g => g.TmdbId == dto.TmdbId);

                if (tmdbExists)
                {
                    throw new InvalidOperationException(
                        "TMDB Genre ID này đã tồn tại."
                    );
                }
            }

            var genre = new Genre
            {
                Name = name,
                TmdbId = dto.TmdbId
            };

            _context.Genres.Add(genre);

            await _context.SaveChangesAsync();

            return new GenreDto
            {
                Id = genre.Id,
                TmdbId = genre.TmdbId,
                Name = genre.Name
            };
        }

        public async Task<List<MovieResponseDto>> GetMoviesAsync(
            long genreId)
        {
            return await _context.Movies
                .Where(m =>
                    m.IsVisible &&
                    m.MovieGenres.Any(
                        mg => mg.GenreId == genreId
                    )
                )
                .Include(m => m.MovieGenres)
                .ThenInclude(mg => mg.Genre)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new MovieResponseDto
                {
                    Id = m.Id,
                    TmdbId = m.TmdbId,
                    Title = m.Title,
                    Overview = m.Overview,
                    ReleaseDate = m.ReleaseDate,
                    DurationMinutes = m.DurationMinutes,
                    PosterUrl = m.PosterUrl,
                    BackdropUrl = m.BackdropUrl,
                    TrailerKey = m.TrailerKey,
                    VoteAverage = m.VoteAverage,
                    Popularity = m.Popularity,
                    ViewCount = m.ViewCount,
                    IsVisible = m.IsVisible,
                    IsFeatured = m.IsFeatured,
                    CreatedAt = m.CreatedAt,
                    UpdatedAt = m.UpdatedAt,

                    Genres = m.MovieGenres
                        .Select(mg => new GenreDto
                        {
                            Id = mg.Genre.Id,
                            TmdbId = mg.Genre.TmdbId,
                            Name = mg.Genre.Name
                        })
                        .ToList()
                })
                .ToListAsync();
        }

        public async Task<bool> AddGenreToMovieAsync(
            long movieId,
            long genreId)
        {
            bool movieExists = await _context.Movies
                .AnyAsync(m => m.Id == movieId);

            if (!movieExists)
            {
                return false;
            }

            bool genreExists = await _context.Genres
                .AnyAsync(g => g.Id == genreId);

            if (!genreExists)
            {
                return false;
            }

            bool relationExists = await _context.MovieGenres
                .AnyAsync(mg =>
                    mg.MovieId == movieId &&
                    mg.GenreId == genreId
                );

            if (relationExists)
            {
                throw new InvalidOperationException(
                    "Phim đã có thể loại này."
                );
            }

            _context.MovieGenres.Add(
                new MovieGenre
                {
                    MovieId = movieId,
                    GenreId = genreId
                }
            );

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveGenreFromMovieAsync(
            long movieId,
            long genreId)
        {
            var relation = await _context.MovieGenres
                .FirstOrDefaultAsync(mg =>
                    mg.MovieId == movieId &&
                    mg.GenreId == genreId
                );

            if (relation == null)
            {
                return false;
            }

            _context.MovieGenres.Remove(relation);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}