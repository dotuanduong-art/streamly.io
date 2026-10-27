using Microsoft.EntityFrameworkCore;
using Streamly.Api.Data;
using Streamly.Api.DTOs;
using Streamly.Api.Interfaces;
using Streamly.Api.Models;

namespace Streamly.Api.Services
{
    public class PlaybackSourceService : IPlaybackSourceService
    {
        private readonly AppDbContext _context;

        private static readonly HashSet<string> AllowedTypes =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "MP4",
                "HLS",
                "DASH",
                "WEBM"
            };

        public PlaybackSourceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<PlaybackSourceDto>>
            GetActiveByMovieAsync(long movieId)
        {
            return await _context.PlaybackSources
                .Where(ps =>
                    ps.MovieId == movieId &&
                    ps.IsActive)
                .OrderByDescending(ps => ps.IsDefault)
                .ThenBy(ps => ps.SortOrder)
                .ThenBy(ps => ps.Id)
                .Select(ps => ToDto(ps))
                .ToListAsync();
        }

        public async Task<List<PlaybackSourceDto>>
            GetAllByMovieAsync(long movieId)
        {
            return await _context.PlaybackSources
                .Where(ps => ps.MovieId == movieId)
                .OrderByDescending(ps => ps.IsDefault)
                .ThenBy(ps => ps.SortOrder)
                .ThenBy(ps => ps.Id)
                .Select(ps => ToDto(ps))
                .ToListAsync();
        }

        public async Task<PlaybackSourceDto> CreateAsync(
            long movieId,
            CreatePlaybackSourceDto dto)
        {
            bool movieExists =
                await _context.Movies
                    .AnyAsync(m => m.Id == movieId);

            if (!movieExists)
            {
                throw new KeyNotFoundException(
                    "Không tìm thấy phim."
                );
            }

            ValidateSource(
                dto.SourceUrl,
                dto.SourceType
            );

            if (dto.IsDefault)
            {
                await ClearDefaultAsync(movieId);
            }

            var source = new PlaybackSource
            {
                MovieId = movieId,
                SourceUrl = dto.SourceUrl.Trim(),
                SourceType =
                    dto.SourceType.Trim().ToUpperInvariant(),
                Quality = NormalizeNullable(dto.Quality),
                Language = NormalizeNullable(dto.Language),
                ProviderName =
                    NormalizeNullable(dto.ProviderName),
                License =
                    NormalizeNullable(dto.License),
                AttributionUrl =
                    NormalizeNullable(dto.AttributionUrl),

                SubtitleUrl =
                    NormalizeNullable(dto.SubtitleUrl),

                SubtitleLanguage =
                    NormalizeNullable(dto.SubtitleLanguage),

                SubtitleLabel =
                    NormalizeNullable(dto.SubtitleLabel),

                IsActive = dto.IsActive,
                IsDefault = dto.IsDefault,
                SortOrder = dto.SortOrder,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.PlaybackSources.Add(source);

            await _context.SaveChangesAsync();

            return ToDto(source);
        }

        public async Task<bool> UpdateAsync(
            long id,
            UpdatePlaybackSourceDto dto)
        {
            var source =
                await _context.PlaybackSources
                    .FirstOrDefaultAsync(ps => ps.Id == id);

            if (source == null)
            {
                return false;
            }

            ValidateSource(
                dto.SourceUrl,
                dto.SourceType
            );

            if (dto.IsDefault &&
                !source.IsDefault)
            {
                await ClearDefaultAsync(
                    source.MovieId,
                    source.Id
                );
            }

            source.SourceUrl =
                dto.SourceUrl.Trim();

            source.SourceType =
                dto.SourceType
                    .Trim()
                    .ToUpperInvariant();

            source.Quality =
                NormalizeNullable(dto.Quality);

            source.Language =
                NormalizeNullable(dto.Language);

            source.ProviderName =
                NormalizeNullable(dto.ProviderName);

            source.License =
                NormalizeNullable(dto.License);

            source.AttributionUrl =
                NormalizeNullable(dto.AttributionUrl);

            source.SubtitleUrl =
                NormalizeNullable(dto.SubtitleUrl);

            source.SubtitleLanguage =
                NormalizeNullable(dto.SubtitleLanguage);

            source.SubtitleLabel =
                NormalizeNullable(dto.SubtitleLabel);

            source.IsActive = dto.IsActive;
            source.IsDefault = dto.IsDefault;
            source.SortOrder = dto.SortOrder;
            source.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(long id)
        {
            var source =
                await _context.PlaybackSources
                    .FirstOrDefaultAsync(ps => ps.Id == id);

            if (source == null)
            {
                return false;
            }

            _context.PlaybackSources.Remove(source);

            await _context.SaveChangesAsync();

            return true;
        }

        private async Task ClearDefaultAsync(
            long movieId,
            long? exceptId = null)
        {
            var defaults =
                await _context.PlaybackSources
                    .Where(ps =>
                        ps.MovieId == movieId &&
                        ps.IsDefault &&
                        (!exceptId.HasValue ||
                         ps.Id != exceptId.Value))
                    .ToListAsync();

            foreach (var source in defaults)
            {
                source.IsDefault = false;
                source.UpdatedAt = DateTime.UtcNow;
            }
        }

        private static void ValidateSource(
            string sourceUrl,
            string sourceType)
        {
            if (!Uri.TryCreate(
                    sourceUrl?.Trim(),
                    UriKind.Absolute,
                    out var uri) ||
                (uri.Scheme != Uri.UriSchemeHttp &&
                 uri.Scheme != Uri.UriSchemeHttps))
            {
                throw new InvalidOperationException(
                    "URL nguồn phim không hợp lệ."
                );
            }

            string normalizedType =
                sourceType?.Trim().ToUpperInvariant()
                ?? string.Empty;

            if (!AllowedTypes.Contains(normalizedType))
            {
                throw new InvalidOperationException(
                    "Loại nguồn chỉ hỗ trợ MP4, HLS, DASH hoặc WEBM."
                );
            }
        }

        private static string? NormalizeNullable(
            string? value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? null
                : value.Trim();
        }

        private static PlaybackSourceDto ToDto(
            PlaybackSource source)
        {
            return new PlaybackSourceDto
            {
                Id = source.Id,
                MovieId = source.MovieId,
                SourceUrl = source.SourceUrl,
                SourceType = source.SourceType,
                Quality = source.Quality,
                Language = source.Language,
                ProviderName = source.ProviderName,
                License = source.License,
                AttributionUrl =
                    source.AttributionUrl,

                SubtitleUrl =
                    source.SubtitleUrl,

                SubtitleLanguage =
                    source.SubtitleLanguage,

                SubtitleLabel =
                    source.SubtitleLabel,

                IsActive = source.IsActive,
                IsDefault = source.IsDefault,
                SortOrder = source.SortOrder,
                CreatedAt = source.CreatedAt,
                UpdatedAt = source.UpdatedAt
            };
        }
    }
}