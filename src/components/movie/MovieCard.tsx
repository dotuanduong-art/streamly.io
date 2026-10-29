import { Link } from 'react-router-dom';
import { Info, Play, Star } from 'lucide-react';
import type { MovieDetail } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { formatRating, getReleaseYear } from '@/lib/movie';
import { MyListButton } from './MyListButton';

export interface MovieCardProps { movie: MovieDetail; showListAction?: boolean }

export function MovieCard({ movie, showListAction = true }: MovieCardProps) {
  const year = getReleaseYear(movie.releaseDate);
  return <article className="movie-card group relative h-full rounded-card bg-background">
    <div className="relative">
      <Link data-testid={`movie-card-${movie.id}`} to={`/movie/${movie.id}`} aria-label={`Thông tin chi tiết về ${movie.title}`} className="block rounded-card">
        <div className="relative aspect-[2/3] overflow-hidden rounded-card bg-surface-card">
          <SmartImage path={movie.posterUrl ?? movie.backdropUrl} alt={movie.title} className="movie-card-art h-full w-full rounded-card" />
          <div className="movie-card-overlay pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-black/10 to-transparent p-3 pr-16">
            <p className="line-clamp-2 text-sm font-semibold">{movie.title}</p>
            <div className="mt-1 flex items-center gap-3 text-caption text-white/80">
              {year && <span>{year}</span>}
              {movie.voteAverage != null && <span className="flex items-center gap-1 text-status-success"><Star size={12} fill="currentColor" />{formatRating(movie.voteAverage)}</span>}
            </div>
          </div>
        </div>
      </Link>
      <Link className="movie-card-play absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-card" to={`/watch/${movie.id}`} aria-label={`Xem ${movie.title}`}><Play size={21} fill="currentColor" /></Link>
      {showListAction && <div className="movie-card-touch-action absolute right-2 top-2 rounded-full bg-background/90"><MyListButton movie={movie} variant="icon" /></div>}
    </div>
    <h3 className="movie-card-caption mt-2 truncate text-sm font-semibold" title={movie.title}>{movie.title}</h3>
    <div className="movie-card-panel rounded-b-card bg-surface-card p-3">
      <p className="mb-3 truncate text-sm font-bold">{movie.title}</p>
      <div className="flex items-center gap-2">
        <Link className="card-action motion-button bg-text-primary text-background" to={`/watch/${movie.id}`} aria-label={`Xem ${movie.title}`}><Play size={17} fill="currentColor" /></Link>
        {showListAction && <MyListButton movie={movie} variant="icon" />}
        <Link className="card-action motion-button ml-auto border border-text-secondary" to={`/movie/${movie.id}`} aria-label={`Thông tin chi tiết: ${movie.title}`}><Info size={18} /></Link>
      </div>
      {!!movie.genres?.length && <p className="mt-3 truncate text-caption text-text-secondary">{movie.genres.map((genre) => genre.name).join(' · ')}</p>}
    </div>
  </article>;
}
