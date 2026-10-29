import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useGenres, useMoviesByGenre } from '@/features/movies/hooks';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { isValidMovieId } from '@/lib/movie';

export default function GenrePage() {
  const { id } = useParams<{ id: string }>();
  const genreId = Number(id);
  const [params, setParams] = useSearchParams();
  const requestedPage = Number(params.get('page') ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const requestedSize = Number(params.get('pageSize') ?? 12);
  const pageSize = [12, 24, 48].includes(requestedSize) ? requestedSize : 12;
  const genres = useGenres();
  const movies = useMoviesByGenre(genreId, page, pageSize);
  const genre = genres.data?.find((item) => item.id === genreId);
  const totalPages = movies.data?.totalPages;
  useDocumentTitle(genre ? `${genre.name} | Streamly` : 'Thể loại | Streamly');

  useEffect(() => {
    const lastPage = totalPages === undefined ? page : Math.max(1, totalPages);
    const safePage = Math.min(page, lastPage);
    if (safePage !== requestedPage || requestedSize !== pageSize) {
      const next = new URLSearchParams(params);
      next.set('page', String(safePage));
      next.set('pageSize', String(pageSize));
      setParams(next, { replace: true });
    }
  }, [page, requestedPage, requestedSize, pageSize, totalPages, params, setParams]);

  const changePage = (nextPage: number, nextSize = pageSize) => {
    setParams({ page: String(nextPage), pageSize: String(nextSize) });
    window.scrollTo(0, 0);
  };

  if (!isValidMovieId(genreId)) return <PageContainer><EmptyState title="Không tìm thấy thể loại" description="Thể loại này không tồn tại." /><Link to="/" className="text-brand hover:underline">Về trang chủ</Link></PageContainer>;
  if (genres.isLoading) return <PageContainer><MovieGrid isLoading /></PageContainer>;
  if (genres.isError) return <PageContainer><ErrorState title="Không thể tải thể loại" error={genres.error} onRetry={() => void genres.refetch()} /></PageContainer>;
  if (!genre) return <PageContainer><EmptyState title="Không tìm thấy thể loại" description="Hãy chọn một thể loại khác từ trình đơn." /><Link to="/" className="text-brand hover:underline">Về trang chủ</Link></PageContainer>;

  return <PageContainer>
    <header className="py-10 sm:py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Duyệt theo thể loại</p>
      <h1 className="mt-3 text-4xl font-bold leading-snug sm:text-5xl">{genre.name}</h1>
      <nav aria-label="Thể loại" className="mt-7 flex flex-wrap gap-2">{genres.data?.map((item) => <Link key={item.id} to={`/genre/${item.id}?page=1&pageSize=${pageSize}`} aria-current={item.id === genreId ? 'page' : undefined} className={`genre-chip rounded-full border px-4 py-2 text-sm ${item.id === genreId ? 'border-brand bg-brand text-white' : 'border-text-primary/15 hover:bg-surface-elevated'}`}>{item.name}</Link>)}</nav>
    </header>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-sm text-text-secondary">
      <p role="status" aria-live="polite">{movies.isLoading ? 'Đang tải phim…' : movies.data ? `${movies.data.totalItems} phim · Trang ${Math.min(page, Math.max(1, movies.data.totalPages))} / ${Math.max(1, movies.data.totalPages)}` : 'Danh sách phim'}</p>
      <label className="flex items-center gap-2">Phim mỗi trang<select data-testid="genre-page-size" className="rounded-button border border-white/15 bg-surface p-2" value={pageSize} onChange={(event) => changePage(1, Number(event.target.value))}>{[12, 24, 48].map((size) => <option key={size} value={size}>{size}</option>)}</select></label>
    </div>
    <MovieGrid movies={movies.data?.items} isLoading={movies.isLoading || (totalPages !== undefined && page > Math.max(1, totalPages))} error={movies.error} onRetry={() => void movies.refetch()} emptyMessage={`Chưa có phim thuộc thể loại ${genre.name}.`} />
    {movies.data && movies.data.totalPages > 1 && <nav aria-label="Phân trang phim" className="mt-10 flex items-center justify-center gap-4">
      <Button data-testid="genre-page-prev" variant="secondary" disabled={page <= 1} onClick={() => changePage(page - 1)}>Trang trước</Button>
      <span className="text-sm">{page} / {movies.data.totalPages}</span>
      <Button data-testid="genre-page-next" variant="secondary" disabled={page >= movies.data.totalPages} onClick={() => changePage(page + 1)}>Trang sau</Button>
    </nav>}
  </PageContainer>;
}
