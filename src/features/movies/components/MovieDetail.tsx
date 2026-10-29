import { useState } from 'react';
import { ArrowLeft, Play, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import type { MovieDetail as MovieDetailType } from '@/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/modal/Modal';
import { TrailerModal } from '@/components/modal/TrailerModal';
import { MovieRow } from '@/components/movie/MovieRow';
import { MyListButton } from '@/components/movie/MyListButton';
import { formatDuration, formatRating, getReleaseYear } from '@/lib/movie';
import { useMovies } from '@/features/movies/hooks';
import { useWatchRecording } from '@/features/history/hooks/useWatchRecording';
import { Reveal } from '@/components/ui/Reveal';
import { motionTiming } from '@/lib/motion';

export interface MovieDetailProps { movie: MovieDetailType }

export function MovieDetail({ movie }: MovieDetailProps) {
  const navigate = useNavigate();
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const moviesQuery = useMovies(1, 30);
  useWatchRecording(movie.id, trailerOpen && Boolean(movie.trailerKey));
  const overview = movie.overview?.trim() || 'Phim này chưa có nội dung giới thiệu.';
  const otherMovies = moviesQuery.data?.items.filter((item) => item.id !== movie.id) ?? [];

  return (
    <article className="-mt-24">
      <header className="detail-hero relative isolate overflow-hidden" data-testid="detail-hero">
        <SmartImage path={movie.backdropUrl ?? movie.posterUrl} alt="" priority className="absolute inset-0 -z-30 h-full w-full" />
        <div aria-hidden="true" className="hero-gradient-left absolute inset-0 -z-20" />
        <div aria-hidden="true" className="hero-gradient-bottom absolute inset-0 -z-10" />
        <div className="detail-shell page-gutter mx-auto max-w-screen-2xl">
          <Button className="mb-6" variant="secondary" leftIcon={<ArrowLeft size={18} />} onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}>
            Quay lại
          </Button>
          <div className="detail-grid">
            <Reveal className="detail-poster" onMount><div data-testid="detail-poster">
              <SmartImage path={movie.posterUrl} alt={`Áp phích ${movie.title}`} priority className="aspect-[2/3] w-full rounded-card shadow-card" />
            </div></Reveal>
            <Reveal className="detail-title min-w-0" onMount delay={motionTiming.stagger}>
              <h1 data-testid="movie-title" title={movie.title} className="detail-heading line-clamp-3 break-words font-extrabold tracking-tight">{movie.title || 'Phim chưa có tên'}</h1>
            </Reveal>
            <Reveal className="detail-meta overflow-y-auto" onMount delay={motionTiming.stagger * 2}><div className="flex flex-wrap items-start gap-2" aria-label="Thông tin phim">
              <Badge>{getReleaseYear(movie.releaseDate) ?? 'Chưa rõ năm'}</Badge>
              <Badge>{formatDuration(movie.durationMinutes) ?? 'Chưa rõ thời lượng'}</Badge>
              <Badge className="gap-1 text-status-success"><Star size={13} fill="currentColor" />{movie.voteAverage != null ? formatRating(movie.voteAverage) : 'Chưa có đánh giá'}</Badge>
              {movie.genres?.length ? movie.genres.map((genre) => <Link key={genre.id} to={`/genre/${genre.id}`} className="genre-chip inline-flex rounded-button" aria-label={`Thể loại ${genre.name}`}><Badge>{genre.name}</Badge></Link>) : <Badge>Chưa có thể loại</Badge>}
            </div></Reveal>
            <Reveal className="detail-overview min-w-0" onMount delay={motionTiming.stagger * 3}>
              <p className="line-clamp-4 break-words text-body leading-relaxed text-text-secondary" data-testid="movie-overview">{overview}</p>
              {!!movie.overview?.trim() && <button className="mt-2 rounded-button text-sm font-semibold hover:underline" onClick={() => setOverviewOpen(true)} aria-haspopup="dialog">Xem thêm</button>}
            </Reveal>
            <Reveal className="detail-actions" onMount delay={motionTiming.stagger * 4}><div data-testid="detail-actions">
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button data-testid="watch-button" size="lg" leftIcon={<Play size={19} fill="currentColor" />} onClick={() => navigate(`/watch/${movie.id}`)}>Xem</Button>
                <MyListButton movie={movie} />
              </div>
              <Button data-testid="watch-trailer-button" className="mt-3" variant="ghost" size="sm" leftIcon={<Play size={15} />} disabled={!movie.trailerKey} onClick={() => setTrailerOpen(true)}>{movie.trailerKey ? 'Xem trailer' : 'Trailer chưa có'}</Button>
            </div></Reveal>
          </div>
        </div>
      </header>

      <section className="page-gutter mx-auto max-w-screen-2xl py-8">
        <MovieRow title="Có thể bạn cũng thích" testIdSlug="more-movies" movies={otherMovies} isLoading={moviesQuery.isLoading} error={moviesQuery.error} onRetry={() => void moviesQuery.refetch()} />
      </section>
      {!!movie.cast?.length && <section className="page-gutter mx-auto max-w-screen-2xl pb-12" aria-labelledby="cast-heading">
        <h2 id="cast-heading" className="text-section font-semibold">Diễn viên</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {movie.cast.map((member) => <div key={member.id} className="flex min-w-0 items-center gap-3 rounded-card bg-surface p-3">
            <SmartImage path={member.profileUrl} alt={member.name} className="h-12 w-12 shrink-0 rounded-full" />
            <div className="min-w-0"><p className="truncate font-semibold">{member.name}</p><p className="truncate text-caption text-text-secondary">{member.character}</p></div>
          </div>)}
        </div>
      </section>}
      <Modal isOpen={overviewOpen} onClose={() => setOverviewOpen(false)} title={movie.title}>
        <div className="p-6"><p className="whitespace-pre-line break-words leading-relaxed text-text-secondary">{overview}</p><Button className="mt-6" variant="secondary" onClick={() => setOverviewOpen(false)}>Thu gọn</Button></div>
      </Modal>
      <TrailerModal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} title={movie.title} trailerKey={movie.trailerKey} />
    </article>
  );
}
