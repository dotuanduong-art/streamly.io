import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { SearchBar } from '@/components/movie/SearchBar';
import { MovieGrid } from '@/components/movie/MovieGrid';
import { Button } from '@/components/ui/Button';
import { useGenres, useSearchMovies } from '@/features/movies/hooks';
import { features } from '@/lib/features';

const PAGE_SIZE = 12;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const [page, setPage] = useState(1);
  const results = useSearchMovies(query, 1, page * PAGE_SIZE);
  const genres = useGenres();

  useEffect(() => setPage(1), [query]);
  useEffect(() => { document.title = query ? `Search: ${query} | Streamly` : 'Search | Streamly'; }, [query]);

  const submit = (nextQuery: string) => setSearchParams({ q: nextQuery });
  return <div className="min-h-[75svh] bg-surface/35 pb-20">
    <PageContainer>
      <header className="border-b border-text-primary/10 py-10 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Discover</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-5xl">Find your next movie</h1>
        <div className="mt-7 max-w-3xl"><SearchBar initialValue={query} onSubmit={submit} /></div>
      </header>

      <section className="py-10" aria-live="polite">
        {!query ? <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold">Search by title</h2>
          <p className="mt-3 text-text-secondary">Enter a movie title to see matching results.</p>
          {features.genresAvailable && !!genres.data?.length && <div className="mt-7 flex flex-wrap gap-2">{genres.data.map((genre) => <Link key={genre.id} to={`/genre/${genre.id}`} className="rounded-full border border-text-primary/15 px-4 py-2 text-sm hover:bg-surface-elevated">{genre.name}</Link>)}</div>}
        </div> : <>
          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-2xl font-semibold">Results for “{query}”</h2>{results.data && <p className="mt-2 text-sm text-text-secondary">{results.data.totalItems} {results.data.totalItems === 1 ? 'movie' : 'movies'} found</p>}</div>
          </div>
          <MovieGrid movies={results.data?.items} isLoading={results.isLoading} error={results.error} onRetry={() => void results.refetch()} emptyMessage={`No results for “${query}”.`} />
          {results.data && page < results.data.totalPages && <div className="mt-10 flex justify-center"><Button onClick={() => setPage((current) => current + 1)}>Load more</Button></div>}
        </>}
      </section>
    </PageContainer>
  </div>;
}
