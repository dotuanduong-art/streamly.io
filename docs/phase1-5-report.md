# Phase 1.5 report

UI language: English. Backend messages are shown verbatim, including the current Vietnamese 404 message required by the contract.

## Scope

The frontend movie domain now follows `03-FE-BE-Contract.md`. No routes, pages, dependencies, or product features were added.

## Files changed

- Environment/client: `.env`, `.env.example`, `src/vite-env.d.ts`, `src/api/client.ts`.
- Types/errors/helpers: `src/types/movie.ts`, `src/types/api.ts`, `src/lib/error.ts`, `src/lib/movie.ts`, `src/lib/paginate.ts`, `src/lib/features.ts`, `src/lib/image.ts`, `src/lib/utils.ts`, `src/lib/queryKeys.ts`.
- API/mock/data: `src/api/movies.api.ts`, `src/api/auth.api.ts`, `src/api/genres.api.ts`, `src/features/movies/mockMovies.ts`, `src/features/movies/selectors.ts`, `src/features/movies/hooks/index.ts`.
- Existing UI consumers: `src/components/ui/SmartImage.tsx`, `src/components/ui/Button.tsx`, `src/components/layout/Navbar.tsx`, `src/components/feedback/ErrorState.tsx`, `src/components/hero/HeroBanner.tsx`, `src/components/movie/MovieCard.tsx`, `src/components/movie/MovieRow.tsx`, `src/pages/HomePage.tsx`.
- Route-param validation only: `src/pages/MovieDetailPage.tsx`, `src/pages/WatchPage.tsx`, `src/pages/GenrePage.tsx`, `src/pages/admin/AdminMovieEditPage.tsx`.
- QA fixture: `tests/phase1.tsx`.

## Contract types

`Movie` contains exactly: numeric `id`, `tmdbId`, `title`, optional nullable `overview`, `releaseDate`, `durationMinutes`, `posterUrl`, `backdropUrl`, `trailerKey`, plus `isVisible`, `isFeatured`, `createdAt`, and `updatedAt`.

`MovieDetail` adds optional mock-only `genres`, `cast`, and nullable `rating`. Components hide each missing value independently.

## Switching and capabilities

- `VITE_API_URL` is host-only. Axios uses `${VITE_API_URL}/api`.
- `VITE_USE_MOCK` defaults to true unless its value is exactly `false`.
- Movies switch between contract-shaped mocks and `/movies`, `/movies/{id}`, `/movies/search?q=`.
- Auth and genres remain mock-only because the backend contract marks them unavailable.
- With mock mode off, `genresAvailable` and `similarMoviesAvailable` are false. Home hides genre rows; the similar-movie API returns no unsupported real data.

## Selectors

One public selector filters `isVisible === false`. Feature selectors derive featured, newly added (`createdAt` descending), recently released (`releaseDate` descending), and mock-only genre rows. “Recently Released” replaces “Trending Now”; a code TODO records that true trending requires a backend popularity field.

## Stable selectors

- `search-toggle`, `search-input`, `search-button`
- `movie-row-{slug}`
- `movie-card-{id}`
- `hero-play-button`, `hero-more-info-button`

Primary `Button` instances set the native `disabled` attribute while loading and visibly change their label to “Loading...”. The Navbar search submit is disabled with “Enter a title” until text is present.

## Verification

- `npm run dev -- --host localhost --port 5175`: pass.
- `npx tsc --noEmit`: pass.
- `npm run build`: pass (1,739 modules, production bundle emitted).
- Mock Home: pass; featured, Recently Released, Newly Added, mock genre rows, image fallbacks, and 31 public movies render. The one hidden fixture is absent.
- Search: pass; selector stability, disabled/visible empty state, typing, and `/search?q=neon%20odyssey` navigation verified.
- Hero/card actions: pass; Hero Play and More Info, card Play and card detail navigation verified.
- Null fields: pass; movies missing artwork/overview/date/duration and optional mock extras render without `undefined`, `NaN`, or crashes.
- Hover/keyboard expansion: pass via `:focus-within`; null-safe card panel is visible and stable.
- Mock network-error fixture: pass; friendly connection message and retry recovery verified.
- Real-mode offline: pass; `VITE_USE_MOCK=false` with an unavailable host shows the friendly normalized message in Hero and rows, retry settles to the same state, genre rows are hidden, and browser console has no errors/unhandled rejections.
- Invalid IDs: pass; nonnumeric and nonpositive movie IDs show “Movie not found”.
- `npm run lint`: not available because the repository defines the script but does not have the ESLint executable installed. No dependency was added.

Both configured/local candidate backend hosts timed out. Real API list, detail, 404, and search behavior were not verified.

## Backend questions

1. Confirm list/search return plain arrays. The frontend currently follows the Phase 1.5 instruction, while contract section 4 still marks this undecided.
2. Does public `GET /api/movies` filter `isVisible=false`? The frontend filters defensively, but the backend should also enforce it.
3. Confirm default ordering for list/search and whether search trims or ignores empty `q`.
4. Provide a reachable deployment, tunnel, or LAN URL and allow `http://localhost:5173` through CORS.
5. Define server pagination before replacing the single `paginate()` client helper.
6. Add or specify popularity/trending, genres, cast, rating, and similar-movie data when ready.
7. Specify POST/PUT bodies and list/search response envelopes before admin movie integration.

Frontend handoff facts: React 18/Vite/TypeScript, Axios + TanStack Query, English UI, routes documented in `AGENTS.md`, no search debounce yet, client pagination, and admin pages remain placeholders.
