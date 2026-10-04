import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { Plus, RotateCcw } from 'lucide-react';
import type { Movie } from '@/types';
import { DataTable } from '@/components/admin/DataTable';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';
import { SmartImage } from '@/components/ui/SmartImage';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { USE_MOCK } from '@/lib/constants';
import { features } from '@/lib/features';
import { formatDuration, getReleaseYear } from '@/lib/movie';
import { useAdminMovies, useDeleteMovie, useResetDemoMovies, useSetMovieFeatured, useSetMovieVisibility } from '../hooks';
import { createMovieColumns, MovieActionButtons, type AdminMovieActions } from '../movieColumns';
import { filterAdminMovies, type FeaturedFilter, type TrailerFilter, type VisibilityFilter } from '../movieFilters';

const validPageSize = (value: number) => [10, 20, 50].includes(value) ? value : 10;

export function AdminMoviesManager() {
  if (!features.adminMoviesApiAvailable) return <div className="rounded-card border border-text-primary/10 bg-surface p-8"><h2 className="text-3xl font-bold leading-snug">Quản lý phim</h2><p className="mt-3 text-text-secondary">API danh sách phim quản trị chưa khả dụng</p></div>;
  return <AvailableAdminMoviesManager />;
}

function AvailableAdminMoviesManager() {
  const [params, setParams] = useSearchParams();
  const paramsRef = useRef(new URLSearchParams(params));
  useEffect(() => { paramsRef.current = new URLSearchParams(params); }, [params]);
  const moviesQuery = useAdminMovies();
  const visibilityMutation = useSetMovieVisibility();
  const featuredMutation = useSetMovieFeatured();
  const deleteMutation = useDeleteMovie();
  const resetMutation = useResetDemoMovies();
  const [pendingDelete, setPendingDelete] = useState<Movie | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const search = params.get('q') ?? '';
  const debouncedSearch = useDebounce(search, 300);
  const visibility = (['visible', 'hidden'].includes(params.get('visibility') ?? '') ? params.get('visibility') : 'all') as VisibilityFilter;
  const featured = (params.get('featured') === 'featured' ? 'featured' : 'all') as FeaturedFilter;
  const trailer = (['with', 'without'].includes(params.get('trailer') ?? '') ? params.get('trailer') : 'all') as TrailerFilter;
  const pageSize = validPageSize(Number(params.get('pageSize') ?? 10));
  const pageIndex = Math.max(0, Number(params.get('page') ?? 1) - 1 || 0);
  const requestedSort = params.get('sort') ?? 'createdAt';
  const sortId = ['title', 'releaseDate', 'durationMinutes', 'isVisible', 'isFeatured', 'trailer', 'createdAt'].includes(requestedSort) ? requestedSort : 'createdAt';
  const sorting: SortingState = [{ id: sortId, desc: params.get('dir') !== 'asc' }];
  const updateParams = (changes: Record<string, string | null>, replace = false) => {
    const next = new URLSearchParams(paramsRef.current);
    Object.entries(changes).forEach(([key, value]) => value == null || value === '' ? next.delete(key) : next.set(key, value));
    paramsRef.current = next;
    setParams(next, { replace });
  };
  const movies = moviesQuery.data ?? [];
  const filtered = useMemo(() => filterAdminMovies(movies, { search: debouncedSearch, visibility, featured, trailer }), [movies, debouncedSearch, visibility, featured, trailer]);
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (pageIndex + 1 > maxPage) updateParams({ page: String(maxPage) }, true);
  }, [filtered.length, pageIndex, pageSize]);

  const visibilityPendingId = visibilityMutation.isPending ? visibilityMutation.variables?.id : undefined;
  const featuredPendingId = featuredMutation.isPending ? featuredMutation.variables?.id : undefined;
  const deletePendingId = deleteMutation.isPending ? deleteMutation.variables : undefined;
  const actions: AdminMovieActions = useMemo(() => ({
    onToggleVisibility: (movie) => visibilityMutation.mutate({ id: movie.id, value: !movie.isVisible }),
    onToggleFeatured: (movie) => featuredMutation.mutate({ id: movie.id, value: !movie.isFeatured }),
    onDelete: setPendingDelete,
    visibilityPendingId, featuredPendingId, deletePendingId,
  }), [visibilityPendingId, featuredPendingId, deletePendingId]);
  const columns = useMemo(() => createMovieColumns(actions), [actions]);
  const counts = { 'Tổng số': movies.length, 'Hiển thị': movies.filter((movie) => movie.isVisible).length, 'Đã ẩn': movies.filter((movie) => !movie.isVisible).length, 'Nổi bật': movies.filter((movie) => movie.isFeatured).length };
  const hasFilters = Boolean(search || visibility !== 'all' || featured !== 'all' || trailer !== 'all');
  const setFilter = (key: string, value: string, defaultValue = 'all') => updateParams({ [key]: value === defaultValue ? null : value, page: null });
  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try { await deleteMutation.mutateAsync(pendingDelete.id); setPendingDelete(null); } catch { /* Hook displays normalized errors and keeps the dialog open. */ }
  };
  const confirmReset = async () => {
    try { await resetMutation.mutateAsync(); setResetOpen(false); } catch { /* Hook displays normalized errors. */ }
  };

  return <div>
    <div className="flex flex-wrap items-start justify-between gap-5">
      <div><h2 className="text-3xl font-bold leading-snug">Quản lý phim</h2><p className="mt-2 text-text-secondary">Quản lý trạng thái hiển thị, vị trí nổi bật và danh mục phim.</p></div>
      <div className="flex flex-wrap gap-2">{USE_MOCK && <Button data-testid="admin-reset-demo" type="button" variant="outline" leftIcon={<RotateCcw size={17} />} onClick={() => setResetOpen(true)}>Đặt lại dữ liệu mẫu</Button>}<Link data-testid="admin-add-movie-button" to="/admin/movies/new" className="inline-flex items-center gap-2 rounded-button bg-brand px-4 py-2 text-sm font-semibold hover:bg-brand-hover"><Plus size={17} />Thêm phim</Link></div>
    </div>
    <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{Object.entries(counts).map(([label, count]) => <div key={label} className="rounded-card border border-text-primary/10 bg-surface p-4"><p className="text-caption uppercase tracking-wide text-text-muted">{label}</p><p className="mt-1 text-2xl font-bold">{count}</p></div>)}</div>
    <div className="my-6 grid gap-3 rounded-card border border-text-primary/10 bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_repeat(3,180px)_auto]">
      <input data-testid="admin-movie-search" aria-label="Tìm kiếm phim" placeholder="Tìm theo tên phim" value={search} onChange={(event) => updateParams({ q: event.target.value || null, page: null }, true)} className="rounded-button border border-text-primary/15 bg-background px-4 py-2.5" />
      <select data-testid="admin-filter-visibility" aria-label="Lọc trạng thái hiển thị" value={visibility} onChange={(event) => setFilter('visibility', event.target.value)} className="rounded-button border border-text-primary/15 bg-background px-3 py-2.5"><option value="all">Mọi trạng thái</option><option value="visible">Hiển thị</option><option value="hidden">Đã ẩn</option></select>
      <select data-testid="admin-filter-featured" aria-label="Lọc trạng thái nổi bật" value={featured} onChange={(event) => setFilter('featured', event.target.value)} className="rounded-button border border-text-primary/15 bg-background px-3 py-2.5"><option value="all">Mọi trạng thái nổi bật</option><option value="featured">Nổi bật</option></select>
      <select data-testid="admin-filter-trailer" aria-label="Lọc trailer" value={trailer} onChange={(event) => setFilter('trailer', event.target.value)} className="rounded-button border border-text-primary/15 bg-background px-3 py-2.5"><option value="all">Tất cả trailer</option><option value="with">Có trailer</option><option value="without">Không có trailer</option></select>
      <Button data-testid="admin-clear-filters" type="button" variant="secondary" disabled={!hasFilters} onClick={() => updateParams({ q: null, visibility: null, featured: null, trailer: null, sort: null, dir: null, page: null, pageSize: null })}>Xóa bộ lọc</Button>
    </div>
    <DataTable<Movie> testId="admin-movie-table" data={filtered} columns={columns} isLoading={moviesQuery.isLoading} error={moviesQuery.error} onRetry={() => void moviesQuery.refetch()} emptyMessage={movies.length ? 'Không có phim phù hợp với bộ lọc.' : 'Danh mục chưa có phim.'}
      sorting={sorting} onSortingChange={(next) => { const value = next[0]; updateParams({ sort: value?.id ?? null, dir: value ? (value.desc ? 'desc' : 'asc') : null, page: null }); }}
      pagination={{ pageIndex, pageSize }} onPaginationChange={(next: PaginationState) => updateParams({ page: next.pageIndex ? String(next.pageIndex + 1) : null, pageSize: next.pageSize === 10 ? null : String(next.pageSize) })}
      getRowId={(movie) => String(movie.id)} renderMobileCard={(movie) => <article data-testid={`admin-movie-row-${movie.id}`} className="rounded-card border border-text-primary/10 bg-surface p-4"><div className="flex gap-4"><SmartImage path={movie.posterUrl} alt={movie.title} className="h-28 w-20 shrink-0 rounded-button" /><div className="min-w-0"><h3 className="font-bold leading-snug">{movie.title}</h3><p className="text-caption text-text-muted">TMDB {movie.tmdbId}</p><p className="mt-2 text-sm text-text-secondary">{getReleaseYear(movie.releaseDate) ?? 'Chưa rõ năm'} · {formatDuration(movie.durationMinutes) ?? 'Chưa rõ thời lượng'}</p><div className="mt-2 flex flex-wrap gap-2"><Badge className={movie.isVisible ? 'text-status-success' : 'text-text-muted'}>{movie.isVisible ? 'Hiển thị' : 'Đã ẩn'}</Badge>{movie.isFeatured && <Badge className="text-status-warning">Nổi bật</Badge>}</div></div></div><div className="mt-4 border-t border-text-primary/10 pt-3"><MovieActionButtons movie={movie} actions={actions} /></div></article>} />
    <ConfirmDialog isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} onConfirm={() => void confirmDelete()} title="Xóa phim" message={`Xóa “${pendingDelete?.title ?? ''}” khỏi danh mục? Phim cũng sẽ bị xóa khỏi mọi dữ liệu cá nhân hóa mẫu.`} confirmLabel="Xóa phim" destructive isLoading={deleteMutation.isPending} />
    <ConfirmDialog isOpen={resetOpen} onClose={() => setResetOpen(false)} onConfirm={() => void confirmReset()} title="Đặt lại dữ liệu mẫu" message="Khôi phục toàn bộ phim mẫu và hủy mọi thay đổi quản trị?" confirmLabel="Đặt lại dữ liệu" destructive isLoading={resetMutation.isPending} />
  </div>;
}
