using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Streamly.Api.Models;

namespace Streamly.Api.Services
{
    public class AdminMovieService : IAdminMovieService
    {
        private readonly AppDbContext _context;

        public AdminMovieService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResultDto<MovieResponseDto>> GetMoviesAsync(
            AdminMovieQueryDto query
        )
        {
            var page = query.Page < 1
                ? 1
                : query.Page;

            var pageSize = query.PageSize;

            if (pageSize < 1)
            {
                pageSize = 10;
            }

            if (pageSize > 100)
            {
                pageSize = 100;
            }

            var moviesQuery = _context.Movies
                .AsNoTracking()
                .Include(m => m.MovieGenres)
                    .ThenInclude(mg => mg.Genre)
                .AsQueryable();

            // Search
            if (!string.IsNullOrWhiteSpace(query.Q))
            {
                var keyword = query.Q.Trim();

                moviesQuery = moviesQuery.Where(
                    m => m.Title.Contains(keyword)
                );
            }

            // Visible filter
            if (query.IsVisible.HasValue)
            {
                moviesQuery = moviesQuery.Where(
                    m => m.IsVisible == query.IsVisible.Value
                );
            }

            // Featured filter
            if (query.IsFeatured.HasValue)
            {
                moviesQuery = moviesQuery.Where(
                    m => m.IsFeatured == query.IsFeatured.Value
                );
            }

            // Trailer filter
            if (query.HasTrailer.HasValue)
            {
                if (query.HasTrailer.Value)
                {
                    moviesQuery = moviesQuery.Where(
                        m =>
                            m.TrailerKey != null &&
                            m.TrailerKey != ""
                    );
                }
                else
                {
                    moviesQuery = moviesQuery.Where(
                        m =>
                            m.TrailerKey == null ||
                            m.TrailerKey == ""
                    );
                }
            }

            // Sort
            var sort = query.Sort?
                .Trim()
                .ToLowerInvariant();

            moviesQuery = sort switch
            {
                "oldest" =>
                    moviesQuery.OrderBy(m => m.CreatedAt),

                "title-asc" =>
                    moviesQuery.OrderBy(m => m.Title),

                "title-desc" =>
                    moviesQuery.OrderByDescending(m => m.Title),

                "rating-desc" =>
                    moviesQuery.OrderByDescending(
                        m => m.VoteAverage
                    ),

                "rating-asc" =>
                    moviesQuery.OrderBy(
                        m => m.VoteAverage
                    ),

                "popularity-desc" =>
                    moviesQuery.OrderByDescending(
                        m => m.Popularity
                    ),

                "popularity-asc" =>
                    moviesQuery.OrderBy(
                        m => m.Popularity
                    ),

                _ =>
                    moviesQuery.OrderByDescending(
                        m => m.CreatedAt
                    )
            };

            var totalItems =
                await moviesQuery.CountAsync();

            var movies = await moviesQuery
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = movies
                .Select(MapMovie)
                .ToList();

            var totalPages =
                totalItems == 0
                    ? 0
                    : (int)Math.Ceiling(
                        totalItems / (double)pageSize
                    );

            return new PagedResultDto<MovieResponseDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalItems = totalItems,
                TotalPages = totalPages
            };
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
                        Name = mg.Genre.Name
                    })
                    .ToList()
            };
        }
    }
}