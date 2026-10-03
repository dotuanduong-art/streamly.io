import { Link } from 'react-router-dom';
import { Info, Play, Star } from 'lucide-react';
import type { MovieDetail } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { formatDuration, getReleaseYear } from '@/lib/movie';
import { MyListButton } from './MyListButton';

export interface MovieCardProps { movie: MovieDetail }
export function MovieCard({ movie }: MovieCardProps) {
  const year = getReleaseYear(movie.releaseDate);
  const duration = formatDuration(movie.durationMinutes);
  return <article className="movie-card relative rounded-card bg-background">
    <Link data-testid={`movie-card-${movie.id}`} to={`/movie/${movie.id}`} aria-label={`More info about ${movie.title}`} className="block rounded-card">
      <SmartImage path={movie.backdropUrl ?? movie.posterUrl} alt={movie.title} className="aspect-video rounded-card" />
      <h3 className="truncate px-1 pt-3 text-body font-semibold">{movie.title}</h3>
    </Link>
    <div className="movie-card-panel rounded-b-card bg-surface-card px-3 pb-4 pt-3">
      <div className="mb-3 flex items-center gap-2">
        {movie.trailerKey ? <Link className="card-action bg-text-primary text-background" to={`/watch/${movie.id}`} aria-label={`Play ${movie.title}`}><Play size={17} fill="currentColor" /></Link> : <span className="text-caption text-text-secondary">Trailer unavailable</span>}
        <MyListButton movie={movie} variant="icon" />
        <Link className="card-action ml-auto border border-text-secondary text-text-primary" to={`/movie/${movie.id}`} aria-label={`More Info: ${movie.title}`}><Info size={18} /></Link>
      </div>
      {(movie.rating != null || year || duration) && <div className="flex items-center gap-3 text-caption text-text-secondary">
        {movie.rating != null && <span className="flex items-center gap-1 text-status-success"><Star size={12} />{movie.rating.toFixed(1)}</span>}
        {year && <span>{year}</span>}{duration && <span>{duration}</span>}
      </div>}
      {!!movie.genres?.length && <p className="mt-2 truncate text-caption text-text-secondary">{movie.genres.map((genre) => genre.name).join(' · ')}</p>}
    </div>
  </article>;
}
