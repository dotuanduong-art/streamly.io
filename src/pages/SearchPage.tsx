import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { SearchBar } from '@/components/movie/SearchBar';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { Button } from '@/components/ui/Button';
import { useGenres, useSearchMovies } from '@/features/movies/hooks';

const PAGE_SIZE = 12;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const [page, setPage] = useState(1);
  // Backend paging is not available yet, so search can expose only the first 50 server results.
  const results = useSearchMovies(query, 1, page * PAGE_SIZE, 50);
  const genres = useGenres();

  useEffect(() => setPage(1), [query]);
  useEffect(() => { document.title = query ? `Tìm kiếm: ${query} | Streamly` : 'Tìm kiếm | Streamly'; }, [query]);

  const submit = (nextQuery: string) => setSearchParams({ q: nextQuery });
  return <div className="min-h-[75svh] bg-surface/35 pb-20">
    <PageContainer>
      <header className="border-b border-text-primary/10 py-10 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Khám phá</p>
        <h1 className="mt-3 text-3xl font-bold leading-snug sm:text-5xl">Tìm bộ phim tiếp theo</h1>
        <div className="mt-7 max-w-3xl"><SearchBar initialValue={query} onSubmit={submit} /></div>
      </header>

      <section className="py-10" aria-live="polite">
        {!query ? <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold leading-snug">Tìm kiếm theo tên phim</h2>
          <p className="mt-3 text-text-secondary">Nhập tên phim để xem kết quả phù hợp.</p>
          {!!genres.data?.length && <div className="mt-7 flex flex-wrap gap-2">{genres.data.map((genre) => <Link key={genre.id} to={`/genre/${genre.id}`} className="rounded-full border border-text-primary/15 px-4 py-2 text-sm hover:bg-surface-elevated">{genre.name}</Link>)}</div>}
        </div> : <>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-2xl font-semibold leading-snug">Kết quả cho “{query}”</h2>{results.data && <p className="mt-2 text-sm text-text-secondary">Tìm thấy {results.data.totalItems.toLocaleString('vi-VN')} phim</p>}</div>
          </div>
          <MovieGrid movies={results.data?.items} isLoading={results.isLoading} error={results.error} onRetry={() => void results.refetch()} emptyMessage={`Không có kết quả cho “${query}”.`} />
          {results.data && page < results.data.totalPages && <div className="mt-10 flex justify-center"><Button onClick={() => setPage((current) => current + 1)}>Xem thêm</Button></div>}
        </>}
      </section>
    </PageContainer>
  </div>;
}
