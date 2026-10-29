import { Skeleton } from '@/components/feedback/Skeleton';

export function MovieDetailSkeleton() {
  return <div className="-mt-24" role="status" aria-label="Đang tải thông tin phim">
    <div className="detail-hero"><div className="detail-shell page-gutter mx-auto max-w-screen-2xl">
      <Skeleton className="mb-6 h-[38px] w-28" />
      <div className="detail-grid">
        <Skeleton className="detail-poster aspect-[2/3] w-full self-start rounded-card" />
        <div className="detail-title"><Skeleton className="h-12 w-3/4" /></div>
        <div className="detail-meta"><Skeleton className="h-7 w-3/4" /></div>
        <div className="detail-overview"><Skeleton className="h-24 w-full" /></div>
        <div className="detail-actions"><Skeleton className="h-12 w-full sm:w-80" /></div>
      </div>
    </div></div>
    <div className="page-gutter mx-auto max-w-screen-2xl py-8"><Skeleton className="h-8 w-64" /></div>
  </div>;
}
