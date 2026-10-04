import { Skeleton } from '@/components/feedback/Skeleton';

export function MovieDetailSkeleton() {
  return <div className="page-gutter mx-auto min-h-[75svh] max-w-screen-2xl pt-16" role="status" aria-label="Đang tải thông tin phim">
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,700px)] lg:items-end">
      <Skeleton className="hidden aspect-[2/3] rounded-card lg:block" />
      <div><Skeleton className="h-14 w-3/4" /><Skeleton className="mt-5 h-7 w-1/2" /><Skeleton className="mt-7 h-24 w-full" /><Skeleton className="mt-7 h-12 w-64" /></div>
    </div>
  </div>;
}
