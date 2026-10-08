using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Streamly.Api.Models;

namespace Streamly.Api.Services
{
    public class AdminGenreService : IAdminGenreService
    {
        private readonly AppDbContext _context;

        public AdminGenreService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<GenreDto>> GetAllAsync()
        {
            return await _context.Genres
                .AsNoTracking()
                .OrderBy(g => g.Name)
                .Select(g => new GenreDto
                {
                    Id = g.Id,
                    Name = g.Name
                })
                .ToListAsync();
        }

        public async Task<GenreDto> CreateAsync(
            AdminGenreUpsertDto dto
        )
        {
            var name = dto.Name.Trim();

            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Tên thể loại không được để trống."
                );
            }

            var duplicateName =
                await _context.Genres.AnyAsync(
                    g => g.Name == name
                );

            if (duplicateName)
            {
                throw new InvalidOperationException(
                    "Tên thể loại đã tồn tại."
                );
            }

            if (dto.TmdbId.HasValue)
            {
                var duplicateTmdb =
                    await _context.Genres.AnyAsync(
                        g => g.TmdbId == dto.TmdbId
                    );

                if (duplicateTmdb)
                {
                    throw new InvalidOperationException(
                        "TMDB ID của thể loại đã tồn tại."
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
                Name = genre.Name
            };
        }

        public async Task UpdateAsync(
            long id,
            AdminGenreUpsertDto dto
        )
        {
            var genre = await _context.Genres
                .FirstOrDefaultAsync(
                    g => g.Id == id
                );

            if (genre == null)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy thể loại."
                );
            }

            var name = dto.Name.Trim();

            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentException(
                    "Tên thể loại không được để trống."
                );
            }

            var duplicateName =
                await _context.Genres.AnyAsync(
                    g =>
                        g.Id != id &&
                        g.Name == name
                );

            if (duplicateName)
            {
                throw new InvalidOperationException(
                    "Tên thể loại đã tồn tại."
                );
            }

            if (dto.TmdbId.HasValue)
            {
                var duplicateTmdb =
                    await _context.Genres.AnyAsync(
                        g =>
                            g.Id != id &&
                            g.TmdbId == dto.TmdbId
                    );

                if (duplicateTmdb)
                {
                    throw new InvalidOperationException(
                        "TMDB ID của thể loại đã tồn tại."
                    );
                }
            }

            genre.Name = name;
            genre.TmdbId = dto.TmdbId;

            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(long id)
        {
            var genre = await _context.Genres
                .Include(g => g.MovieGenres)
                .FirstOrDefaultAsync(
                    g => g.Id == id
                );

            if (genre == null)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy thể loại."
                );
            }

            if (genre.MovieGenres.Any())
            {
                throw new InvalidOperationException(
                    "Không thể xóa thể loại đang được gán cho phim."
                );
            }

            _context.Genres.Remove(genre);

            await _context.SaveChangesAsync();
        }
    }
}