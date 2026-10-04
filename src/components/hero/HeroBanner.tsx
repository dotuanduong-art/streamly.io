import { Link } from 'react-router-dom';
import { Info, Play, Star } from 'lucide-react';
import type { MovieDetail } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { Skeleton } from '@/components/feedback/Skeleton';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatDuration, formatRating, getReleaseYear } from '@/lib/movie';

export interface HeroBannerProps { movie?: MovieDetail; isLoading?: boolean; error?: unknown; onRetry?: () => void }
export function HeroBanner({ movie, isLoading, error, onRetry }: HeroBannerProps) {
  if (isLoading) return <section className="hero-frame page-gutter flex items-center" aria-label="Đang tải phim nổi bật" role="status"><div className="w-full max-w-xl space-y-6"><Skeleton className="h-4 w-32" /><Skeleton className="h-24 w-4/5" /><Skeleton className="h-16 w-full" /><Skeleton className="h-12 w-64" /></div></section>;
  if (error || !movie) return <section className="hero-frame page-gutter flex items-center justify-center">{error ? <ErrorState title="Không thể tải phim nổi bật" error={error} onRetry={onRetry} /> : <EmptyState title="Sắp có thêm nhiều câu chuyện" description="Hãy quay lại để xem lựa chọn nổi bật mới." />}</section>;
  const year = getReleaseYear(movie.releaseDate);
  const duration = formatDuration(movie.durationMinutes);
  return <section className="hero-frame relative isolate flex items-center">
    <SmartImage path={movie.backdropUrl ?? movie.posterUrl} alt="" priority className="absolute inset-0 -z-30 h-full w-full" />
    <div className="hero-gradient-left absolute inset-0 -z-20" /><div className="hero-gradient-bottom absolute inset-0 -z-10" />
    <div className="page-gutter w-full pb-12 pt-24 md:pb-16"><div className="max-w-xl">
      <p className="mb-4 text-caption font-semibold uppercase tracking-widest text-text-secondary">Lựa chọn nổi bật</p>
      <h1 className="text-hero font-bold leading-snug tracking-tight">{movie.title}</h1>
      {(movie.voteAverage != null || year || duration) && <div className="mt-5 flex items-center gap-4 text-metadata text-text-secondary">
        {movie.voteAverage != null && <span className="flex items-center gap-1 text-status-success"><Star size={16} fill="currentColor" />{formatRating(movie.voteAverage)}</span>}
        {year && <span>{year}</span>}{duration && <span>{duration}</span>}
      </div>}
      {movie.overview && <p className="mt-5 max-w-lg line-clamp-3 text-body leading-relaxed text-text-primary/85">{movie.overview}</p>}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        {movie.trailerKey && <Link data-testid="hero-play-button" className="hero-button bg-text-primary text-background hover:bg-text-secondary" to={`/watch/${movie.id}`}><Play size={20} fill="currentColor" />Phát</Link>}
        <Link data-testid="hero-more-info-button" className="hero-button bg-surface-elevated/90 text-text-primary hover:bg-surface-hover" to={`/movie/${movie.id}`}><Info size={20} />Thông tin chi tiết</Link>
      </div>
      {!movie.trailerKey && <p className="mt-3 text-caption text-text-secondary">Trailer chưa có cho phim này.</p>}
    </div></div>
  </section>;
}
