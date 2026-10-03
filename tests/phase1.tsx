import { AxiosError } from 'axios';
import { apiClient } from '../src/api/client';
import { useAuthStore } from '../src/store/useAuthStore';
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { moviesApi } from '../src/api/movies.api';
import { mockMovies, mockGenres } from '../src/features/movies/mockMovies';
import { HeroBanner } from '../src/components/hero/HeroBanner';
import { MovieRow } from '../src/components/movie/MovieRow';
import { useFeaturedMovies, useTrendingMovies } from '../src/features/movies/hooks';
import { SmartImage } from '../src/components/ui/SmartImage';
import { getImageUrl } from '../src/lib/image';
import '../src/index.css';

const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
let mode = 'loading';
const result = async (movies: typeof mockMovies) => {
  await new Promise(resolve => setTimeout(resolve, 1800));
  if (mode === 'error') throw new Error('Intentional QA failure');
  return mode === 'empty' ? [] : movies;
};
moviesApi.getFeaturedMovies = () => result([mockMovies[4]]);
moviesApi.getTrendingMovies = () => result(mockMovies.slice(0, 8));
function Checks() {
  const [, refresh] = useState(0);
  const featured = useFeaturedMovies();
  const trending = useTrendingMovies();
  const change = (next: string) => { mode = next; client.resetQueries(); refresh(value => value + 1); };
  return <>
    <div className="relative z-50 flex flex-wrap gap-4 bg-surface p-4">
      <button onClick={() => { useAuthStore.getState().login({ accessToken: 'qa-local-token', user: { id: 'qa-user', email: 'qa@example.test', displayName: 'QA Viewer', role: 'User' } }); window.location.assign('/profile'); }}>Test user session</button>
      <button onClick={() => { useAuthStore.getState().login({ accessToken: 'qa-local-token', user: { id: 'qa-admin', email: 'qa@example.test', displayName: 'QA Admin', role: 'Admin' } }); window.location.assign('/'); }}>Test admin menu</button>
      <button onClick={() => { void apiClient.get('/qa-only', { adapter: async (config) => { throw new AxiosError('QA unauthorized', 'ERR_BAD_REQUEST', config, undefined, { data: {}, status: 401, statusText: 'Unauthorized', headers: {}, config }); } }).catch(() => {}); }}>Test 401 redirect</button>
      <button onClick={() => change('loading')}>Test loading</button><button onClick={() => change('error')}>Force API error</button><button onClick={() => { mode = 'success'; }}>Restore API for retry</button><button onClick={() => change('empty')}>Test empty</button>
      <output>Fixtures: {mockMovies.length} movies; {mockGenres.length} genres; min {Math.min(...mockGenres.map(g => g.movieCount ?? 0))} per genre. Image helper: {getImageUrl(null) === null && getImageUrl('/test.jpg', 'w500') === 'https://image.tmdb.org/t/p/w500/test.jpg' && getImageUrl('https://picsum.photos/seed/a/500/750') === 'https://picsum.photos/seed/a/500/750' ? 'PASS' : 'FAIL'}</output>
    </div>
    <HeroBanner movie={featured.data?.[0]} isLoading={featured.isPending} isError={featured.isError} onRetry={() => void featured.refetch()} />
    <div className="page-gutter"><MovieRow title="QA movies" movies={trending.data} isLoading={trending.isPending} isError={trending.isError} onRetry={() => void trending.refetch()} />
      <SmartImage path={null} alt="Null fixture" className="aspect-video w-40" /><SmartImage path="/missing-image.jpg" alt="Broken fixture" className="aspect-video w-40" />
    </div>
  </>;
}
ReactDOM.createRoot(document.getElementById('root')!).render(<BrowserRouter><QueryClientProvider client={client}><Checks /></QueryClientProvider></BrowserRouter>);


