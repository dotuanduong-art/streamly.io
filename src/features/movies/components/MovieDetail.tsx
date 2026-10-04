import { useState } from 'react';
import { Play, Star } from 'lucide-react';
import type { MovieDetail as MovieDetailType } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TrailerModal } from '@/components/modal/TrailerModal';
import { MovieRow } from '@/components/movie/MovieRow';
import { formatDuration, formatRating, getReleaseYear } from '@/lib/movie';
import { useSimilarMovies } from '@/features/movies/hooks';
import { features } from '@/lib/features';
import { MyListButton } from '@/components/movie/MyListButton';
import { useWatchRecording } from '@/features/history/hooks/useWatchRecording';

export interface MovieDetailProps {
  movie: MovieDetailType;
}

function initials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase();
}

export function MovieDetail({ movie }: MovieDetailProps) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  const similar = useSimilarMovies(movie.id);
  const year = getReleaseYear(movie.releaseDate);
  const duration = formatDuration(movie.durationMinutes);
  const hasTrailer = Boolean(movie.trailerKey?.trim());
  useWatchRecording(movie.id, trailerOpen && hasTrailer);

  return <article className="-mt-24">
    <header className="relative min-h-[70svh] overflow-hidden pt-24">
      <SmartImage path={movie.backdropUrl ?? movie.posterUrl} alt="" priority className="absolute inset-0 h-full w-full" />
      <div aria-hidden="true" className="hero-gradient-left absolute inset-0" />
      <div aria-hidden="true" className="hero-gradient-bottom absolute inset-0" />
      <div className="page-gutter relative mx-auto flex min-h-[70svh] max-w-screen-2xl items-end py-12 sm:py-16 lg:items-center">
        <div className="grid w-full gap-7 lg:grid-cols-[220px_minmax(0,700px)] lg:items-end">
          <SmartImage path={movie.posterUrl} alt={`Áp phích ${movie.title}`} className="hidden aspect-[2/3] w-full rounded-card shadow-card lg:block" />
          <div>
            <h1 data-testid="movie-title" className="max-w-4xl text-4xl font-extrabold leading-snug tracking-tight sm:text-5xl lg:text-6xl">{movie.title}</h1>
            {(year || duration || movie.voteAverage != null || movie.genres?.length) && <div className="mt-5 flex flex-wrap gap-2">
              {year && <Badge>{year}</Badge>}
              {duration && <Badge>{duration}</Badge>}
              {movie.voteAverage != null && <Badge className="gap-1 text-status-success"><Star size={13} fill="currentColor" />{formatRating(movie.voteAverage)}</Badge>}
              {movie.genres?.map((genre) => <Badge key={genre.id}>{genre.name}</Badge>)}
            </div>}
            <p className="mt-6 max-w-2xl text-body leading-relaxed text-text-secondary sm:text-lg">{movie.overview?.trim() || 'Phim này chưa có nội dung giới thiệu.'}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button data-testid="watch-trailer-button" size="lg" disabled={!hasTrailer} leftIcon={<Play size={19} fill="currentColor" />} onClick={() => setTrailerOpen(true)}>Xem trailer</Button>
              <MyListButton movie={movie} />
            </div>
            {!hasTrailer && <p className="mt-3 text-sm text-text-secondary">Trailer chưa có.</p>}
          </div>
        </div>
      </div>
    </header>

    {!!movie.cast?.length && <section className="page-gutter mx-auto max-w-screen-2xl py-12" aria-labelledby="cast-heading">
      <h2 id="cast-heading" className="text-section font-semibold leading-snug">Diễn viên</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {movie.cast.map((member) => <div key={member.id} className="flex min-w-0 items-center gap-3 rounded-card bg-surface p-3">
          {member.profileUrl ? <SmartImage path={member.profileUrl} alt={member.name} className="h-12 w-12 shrink-0 rounded-full" /> : <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-elevated text-sm font-bold">{initials(member.name)}</div>}
          <div className="min-w-0"><p className="truncate font-semibold">{member.name}</p><p className="truncate text-caption text-text-secondary">{member.character}</p></div>
        </div>)}
      </div>
    </section>}

    {features.similarMoviesAvailable && <div className="page-gutter mx-auto max-w-screen-2xl py-4">
      <MovieRow title="Phim tương tự" testIdSlug="more-like-this" movies={similar.data} isLoading={similar.isLoading} error={similar.error} onRetry={() => void similar.refetch()} />
    </div>}
    <TrailerModal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} trailerKey={movie.trailerKey} title={movie.title} />
  </article>;
}
