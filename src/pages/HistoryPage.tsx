import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { ConfirmDialog } from '@/components/modal/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { useClearHistory, useHistory, useRemoveFromHistory } from '@/features/history/hooks';
import { paginate } from '@/lib/paginate';
import { formatRelativeTime } from '@/lib/time';
import { features } from '@/lib/features';

const PAGE_SIZE = 12;

export function HistoryPage() {
  const [page, setPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const history = useHistory();
  const remove = useRemoveFromHistory();
  const clear = useClearHistory();
  const items = history.data ?? [];
  const visible = paginate(items, 1, page * PAGE_SIZE);
  const watchedAt = useMemo(() => new Map(items.map((item) => [item.movie.id, item.watchedAt])), [items]);

  const confirmClear = async () => {
    try {
      await clear.mutateAsync();
      setConfirmOpen(false);
      setPage(1);
    } catch {
      // The mutation restores cached data and displays the normalized error.
    }
  };

  if (!features.historyAvailable) return <PageContainer><h1 className="text-heading font-bold">Watch History</h1><p className="mt-3 text-text-secondary">Watch history is coming soon.</p><Link to="/" className="mt-5 inline-block font-semibold text-brand hover:underline">Browse movies</Link></PageContainer>;

  return <PageContainer>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-heading font-bold">Watch History</h1>
        {!history.isLoading && !history.isError && <p className="mt-2 text-text-secondary">{items.length} {items.length === 1 ? 'movie' : 'movies'} watched</p>}
      </div>
      {items.length > 0 && <Button data-testid="history-clear-button" type="button" variant="outline" onClick={() => setConfirmOpen(true)}>Clear history</Button>}
    </div>
    {!history.isLoading && !history.isError && items.length === 0 ? <div className="rounded-card border border-text-primary/10 bg-surface p-10 text-center">
      <p className="mb-5 text-text-secondary">Your watch history is empty.</p>
      <Link to="/" className="font-semibold text-brand hover:underline">Browse movies</Link>
    </div> : <MovieGrid
      movies={visible.items.map((item) => item.movie)}
      isLoading={history.isLoading}
      error={history.error}
      onRetry={() => void history.refetch()}
      itemTestId={(movie) => `history-item-${movie.id}`}
      renderMeta={(movie) => {
        const timestamp = watchedAt.get(movie.id);
        return timestamp ? <time dateTime={timestamp} title={timestamp} className="mt-2 block text-caption text-text-secondary">Watched {formatRelativeTime(timestamp)}</time> : null;
      }}
      renderAction={(movie) => <button type="button" data-testid={`history-remove-${movie.id}`} aria-label={`Remove ${movie.title} from history`} disabled={remove.isPending} onClick={() => remove.mutate(movie.id)} className="rounded-full bg-background/90 p-2 text-text-primary shadow-card hover:bg-status-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>}
    />}
    {items.length > visible.items.length && <div className="mt-8 text-center"><Button type="button" variant="secondary" onClick={() => setPage((value) => value + 1)}>Load more</Button></div>}
    <ConfirmDialog isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={() => void confirmClear()} title="Clear watch history" message="Remove every movie from your watch history? This cannot be undone." confirmLabel="Clear history" destructive isLoading={clear.isPending} />
  </PageContainer>;
}

export default HistoryPage;
