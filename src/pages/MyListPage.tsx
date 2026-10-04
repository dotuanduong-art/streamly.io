import { Link } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { MyListButton } from '@/components/movie/MyListButton';
import { useMyList } from '@/features/my-list/hooks';
import { features } from '@/lib/features';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function MyListPage() {
  useDocumentTitle('Danh sách của tôi | Streamly');
  const list = useMyList();
  if (!features.myListAvailable) return <PageContainer><h1 className="text-heading font-bold leading-snug">Danh sách của tôi</h1><p className="mt-3 text-text-secondary">Danh sách của tôi sẽ sớm ra mắt.</p><Link to="/" className="mt-5 inline-block font-semibold text-brand hover:underline">Khám phá phim</Link></PageContainer>;
  return <PageContainer>
    <header className="py-8 sm:py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Bộ sưu tập</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-3"><h1 className="text-4xl font-bold leading-snug sm:text-5xl">Danh sách của tôi</h1>{list.data && <p className="text-text-secondary">{list.data.length} phim</p>}</div>
    </header>
    {!list.isLoading && !list.isError && list.data?.length === 0 ? <div className="rounded-card border border-text-primary/10 bg-surface p-10 text-center sm:p-16"><h2 className="text-2xl font-semibold leading-snug">Danh sách đang chờ bộ phim đầu tiên</h2><p className="mx-auto mt-3 max-w-lg text-text-secondary">Khám phá Streamly và dùng nút dấu cộng để lưu phim tại đây.</p><Link to="/" className="mt-7 inline-flex rounded-button bg-text-primary px-5 py-3 font-semibold text-background">Khám phá phim</Link></div>
      : <MovieGrid movies={list.data} isLoading={list.isLoading} error={list.error} onRetry={() => void list.refetch()} renderAction={(movie) => <MyListButton movie={movie} variant="icon" className="bg-background/90" />} />}
  </PageContainer>;
}
