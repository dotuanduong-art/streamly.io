# Backend handoff

## Frontend

The standalone client uses React 18, TypeScript, Vite, Axios, TanStack Query, and Zustand. Local development runs at `http://localhost:5173`. The production CORS origin will be `https://<vercel-project>.vercel.app`; replace this placeholder after the first deployment and allow both exact origins.

`VITE_API_URL` contains the backend HTTPS host only. The Axios client appends `/api` and sends a Bearer token when present.

## Real-mode calls

- `GET /api/movies`
- `GET /api/movies/{id}`
- `GET /api/movies/search?q={query}&limit={limit}` (`6` for suggestions, `50` for the search page)
- `GET /api/genres`
- `GET /api/genres/{id}/movies`
- `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`

Admin `PUT /api/movies/{id}` and `DELETE /api/movies/{id}` are prepared, but the real admin UI is gated because no admin list endpoint can return hidden movies. My List, History, and Profile remain mock-only; see [`proposed-api.md`](proposed-api.md).

The client accepts `{ message }` and ASP.NET ProblemDetails (`title`, `detail`, `errors`). A 401 outside login/register clears the session and returns to login with `state.from`; 403 shows a permission error without redirecting. Network failures do not clear the session.

## Open questions

- Define the admin movie-list endpoint, filters, hidden-movie behavior, and server paging.
- Confirm whether `POST /history/{movieId}` increments `viewCount`, and define the exact History item shape.
- Agree on `DELETE /history`, `DELETE /history/{movieId}`, and `PUT /profile`.
- Define POST/PUT movie request bodies, including genre attachment semantics.
- Add search paging beyond the current 50-result limit.
- Define cast and similar-movie endpoints.
- Supply the public HTTPS backend URL and confirm the final Vercel CORS origin.
