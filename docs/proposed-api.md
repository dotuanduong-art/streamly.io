# Frontend API notes

Contract v1.1 defines Auth plus the core My List and History paths below. The frontend still keeps personalized data on its mock layer until those domains are enabled for real mode.

## Auth

- `POST /auth/register` with `{ email, password, displayName }` → `201 AuthResponse`
- `POST /auth/login` with `{ email, password }` → `200 AuthResponse`
- `GET /auth/me` → `200 User`

```ts
type AuthResponse = { accessToken: string; user: User };
type User = { id: number; email: string; displayName: string; avatarUrl?: string | null; role: 'User' | 'Admin'; createdAt: string };
```

Expected errors: `400` validation, `401` invalid credentials, `403` forbidden, `409` duplicate email.

## My List

- `GET /my-list` → `200 Movie[]`
- `POST /my-list/{movieId}` → `204`
- `DELETE /my-list/{movieId}` → `204`

All My List endpoints require `Authorization: Bearer <accessToken>`.

Error bodies use `{ message }`. Validation errors use `{ message, errors: Record<string, string[]> }`.

## Watch History

- `GET /history` → `200 HistoryItem[]`, newest first. `HistoryItem = { movie: Movie, watchedAt: string }` with an ISO 8601 UTC timestamp.
- `POST /history/{movieId}` → `204`; upsert one entry per movie and update `watchedAt` on each watch.

### PROPOSED — NOT AGREED WITH BACKEND

- `DELETE /history/{movieId}` → `204`.
- `DELETE /history` → `204`.

## Profile — PROPOSED, NOT AGREED WITH BACKEND

- `PUT /profile` with `{ displayName: string, avatarUrl?: string | null }` → `200 User`.
- Avatar upload is out of scope; `avatarUrl` is a plain URL string.

History and Profile require a Bearer token. Proposed errors: `400` invalid input, `401` unauthenticated, `403` forbidden, `404` missing movie; bodies are `{ message }` or validation `{ message, errors }`.

## Admin Movies (proposed)

The write endpoints exist, but a real admin list is disabled until the backend provides an endpoint that includes hidden movies.

- `PUT /api/movies/{id}`: `UpdateMovieRequest` contains `title`, `overview`, `releaseDate`, `durationMinutes`, `posterUrl`, `backdropUrl`, `trailerKey`, `isVisible`, `isFeatured`, `voteAverage`, and `popularity`; response `204`.
- `DELETE /api/movies/{id}`: response `204`; missing movie returns `404 { message }`.
- `GET /api/movies`: does it include `isVisible = false` for admins? If not, an admin list option such as `includeHidden=true` is required.
- Expected errors: `400`, `404`, or `409`, using `{ message }`.
