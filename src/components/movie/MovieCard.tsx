import { Link } from 'react-router-dom';
import { Info, Play, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Movie } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { IconButton } from '@/components/ui/IconButton';

export interface MovieCardProps { movie: Movie }
export function MovieCard({ movie }: MovieCardProps) {
  return <article className="movie-card relative rounded-card bg-background">
    <Link to={`/movie/${movie.id}`} aria-label={`More info about ${movie.title}`} className="block rounded-card">
      <SmartImage path={movie.backdropPath} alt={movie.title} className="aspect-video rounded-card" />
      <h3 className="truncate px-1 pt-3 text-body font-semibold">{movie.title}</h3>
    </Link>
    <div className="movie-card-panel rounded-b-card bg-surface-card px-3 pb-4 pt-3">
      <div className="mb-3 flex items-center gap-2">
        {movie.trailerKey ? <Link className="card-action bg-text-primary text-background" to={`/watch/${movie.id}`} aria-label={`Play ${movie.title}`}><Play size={17} fill="currentColor" /></Link> : <span className="text-caption text-text-secondary">Trailer unavailable</span>}
        <IconButton ariaLabel={`Add ${movie.title} to My List`} variant="outline" size="sm" onClick={() => toast('Coming soon')}><Plus size={18} /></IconButton>
        <Link className="card-action ml-auto border border-text-secondary text-text-primary" to={`/movie/${movie.id}`} aria-label={`More Info: ${movie.title}`}><Info size={18} /></Link>
      </div>
      <div className="flex items-center gap-3 text-caption text-text-secondary"><span className="flex items-center gap-1 text-status-success"><Star size={12} />{movie.rating.toFixed(1)}</span><span>{movie.year}</span><span>{movie.runtime} min</span></div>
      <p className="mt-2 truncate text-caption text-text-secondary">{movie.genres.map((genre) => genre.name).join(' · ')}</p>
    </div>
  </article>;
}
