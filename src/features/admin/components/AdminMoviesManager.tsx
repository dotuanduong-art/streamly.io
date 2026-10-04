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
  if (!features.adminMoviesApiAvailable) return <div className="rounded-card border border-text-primary/10 bg-surface p-8"><h2 className="text-3xl font-bold">Movie management</h2><p className="mt-3 text-text-secondary">Admin movie list API is not available yet</p></div>;
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
  const counts = { total: movies.length, visible: movies.filter((movie) => movie.isVisible).length, hidden: movies.filter((movie) => !movie.isVisible).length, featured: movies.filter((movie) => movie.isFeatured).length };
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
      <div><h2 className="text-3xl font-bold">Movie management</h2><p className="mt-2 text-text-secondary">Manage visibility, featured placement and the movie catalog.</p></div>
      <div className="flex flex-wrap gap-2">{USE_MOCK && <Button data-testid="admin-reset-demo" type="button" variant="outline" leftIcon={<RotateCcw size={17} />} onClick={() => setResetOpen(true)}>Reset demo data</Button>}<Link data-testid="admin-add-movie-button" to="/admin/movies/new" className="inline-flex items-center gap-2 rounded-button bg-brand px-4 py-2 text-sm font-semibold hover:bg-brand-hover"><Plus size={17} />Add movie</Link></div>
    </div>
    <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{Object.entries(counts).map(([label, count]) => <div key={label} className="rounded-card border border-text-primary/10 bg-surface p-4"><p className="text-caption uppercase tracking-wide text-text-muted">{label}</p><p className="mt-1 text-2xl font-bold">{count}</p></div>)}</div>
    <div className="my-6 grid gap-3 rounded-card border border-text-primary/10 bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_repeat(3,180px)_auto]">
      <input data-testid="admin-movie-search" aria-label="Search movies" placeholder="Search movie titles" value={search} onChange={(event) => updateParams({ q: event.target.value || null, page: null }, true)} className="rounded-button border border-text-primary/15 bg-background px-4 py-2.5" />
      <select data-testid="admin-filter-visibility" aria-label="Filter visibility" value={visibility} onChange={(event) => setFilter('visibility', event.target.value)} className="rounded-button border border-text-primary/15 bg-background px-3 py-2.5"><option value="all">All visibility</option><option value="visible">Visible</option><option value="hidden">Hidden</option></select>
      <select data-testid="admin-filter-featured" aria-label="Filter featured" value={featured} onChange={(event) => setFilter('featured', event.target.value)} className="rounded-button border border-text-primary/15 bg-background px-3 py-2.5"><option value="all">All featured states</option><option value="featured">Featured</option></select>
      <select data-testid="admin-filter-trailer" aria-label="Filter trailers" value={trailer} onChange={(event) => setFilter('trailer', event.target.value)} className="rounded-button border border-text-primary/15 bg-background px-3 py-2.5"><option value="all">All trailers</option><option value="with">With trailer</option><option value="without">Without trailer</option></select>
      <Button data-testid="admin-clear-filters" type="button" variant="secondary" disabled={!hasFilters} onClick={() => updateParams({ q: null, visibility: null, featured: null, trailer: null, sort: null, dir: null, page: null, pageSize: null })}>Clear filters</Button>
    </div>
    <DataTable<Movie> testId="admin-movie-table" data={filtered} columns={columns} isLoading={moviesQuery.isLoading} error={moviesQuery.error} onRetry={() => void moviesQuery.refetch()} emptyMessage={movies.length ? 'No movies match these filters.' : 'No movies in the catalog.'}
      sorting={sorting} onSortingChange={(next) => { const value = next[0]; updateParams({ sort: value?.id ?? null, dir: value ? (value.desc ? 'desc' : 'asc') : null, page: null }); }}
      pagination={{ pageIndex, pageSize }} onPaginationChange={(next: PaginationState) => updateParams({ page: next.pageIndex ? String(next.pageIndex + 1) : null, pageSize: next.pageSize === 10 ? null : String(next.pageSize) })}
      getRowId={(movie) => String(movie.id)} renderMobileCard={(movie) => <article data-testid={`admin-movie-row-${movie.id}`} className="rounded-card border border-text-primary/10 bg-surface p-4"><div className="flex gap-4"><SmartImage path={movie.posterUrl} alt={movie.title} className="h-28 w-20 shrink-0 rounded-button" /><div className="min-w-0"><h3 className="font-bold">{movie.title}</h3><p className="text-caption text-text-muted">TMDB {movie.tmdbId}</p><p className="mt-2 text-sm text-text-secondary">{getReleaseYear(movie.releaseDate) ?? 'Year unknown'} · {formatDuration(movie.durationMinutes) ?? 'Duration unknown'}</p><div className="mt-2 flex flex-wrap gap-2"><Badge className={movie.isVisible ? 'text-status-success' : 'text-text-muted'}>{movie.isVisible ? 'Visible' : 'Hidden'}</Badge>{movie.isFeatured && <Badge className="text-status-warning">Featured</Badge>}</div></div></div><div className="mt-4 border-t border-text-primary/10 pt-3"><MovieActionButtons movie={movie} actions={actions} /></div></article>} />
    <ConfirmDialog isOpen={Boolean(pendingDelete)} onClose={() => setPendingDelete(null)} onConfirm={() => void confirmDelete()} title="Delete movie" message={`Delete “${pendingDelete?.title ?? ''}” from the catalog? This removes it from all mock personalized data views too.`} confirmLabel="Delete movie" destructive isLoading={deleteMutation.isPending} />
    <ConfirmDialog isOpen={resetOpen} onClose={() => setResetOpen(false)} onConfirm={() => void confirmReset()} title="Reset demo data" message="Restore every seeded movie and discard all admin movie changes?" confirmLabel="Reset data" destructive isLoading={resetMutation.isPending} />
  </div>;
}
