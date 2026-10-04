# PROPOSED — NOT AGREED WITH BACKEND

These endpoints are frontend proposals for Auth and My List. They do not exist in the current backend contract.

## Auth

- `POST /auth/register` with `{ email, password, displayName? }` → `201 AuthResponse`
- `POST /auth/login` with `{ email, password }` → `200 AuthResponse`

```ts
type AuthResponse = { accessToken: string; user: User };
type User = { id: number; email: string; displayName: string; avatarUrl?: string | null; role: 'User' | 'Admin' };
```

Expected errors: `400` validation, `401` invalid credentials, `403` forbidden, `409` duplicate email.

## My List

- `GET /my-list` → `200 Movie[]`
- `POST /my-list` with `{ movieId: number }` → `204`
- `DELETE /my-list/{movieId}` → `204`

All My List endpoints require `Authorization: Bearer <accessToken>`.

Error bodies use `{ message }`. Validation errors use `{ message, errors: Record<string, string[]> }`.

## Watch History (proposed)

- `GET /history` → `200 HistoryItem[]`, newest first. `HistoryItem = { movie: Movie, watchedAt: string }` with an ISO 8601 UTC timestamp.
- `POST /history` with `{ movieId: number }` → `204`; upsert one entry per movie and update `watchedAt` on each watch.
- `DELETE /history/{movieId}` → `204`.
- `DELETE /history` → `204`.

## Profile (proposed)

- `PUT /profile` with `{ displayName: string, avatarUrl?: string | null }` → `200 User`.
- Avatar upload is out of scope; `avatarUrl` is a plain URL string.

History and Profile require a Bearer token. Proposed errors: `400` invalid input, `401` unauthenticated, `403` forbidden, `404` missing movie; bodies are `{ message }` or validation `{ message, errors }`.

## Admin Movies (proposed)

The endpoints exist, but the update body and hidden-movie list behavior below are **PROPOSED — NOT AGREED WITH BACKEND**.

- `PUT /api/movies/{id}`: the frontend assumes a full `UpdateMovieRequest` body containing `title`, `overview`, `releaseDate`, `durationMinutes`, `posterUrl`, `backdropUrl`, `trailerKey`, `tmdbId`, `isVisible`, and `isFeatured`. Backend must confirm these field names, whether partial updates are allowed, and whether `id` is required in the body.
- `DELETE /api/movies/{id}`: expected `204` or `200`; missing movie returns `404 { message }`.
- `GET /api/movies`: does it include `isVisible = false` for admins? If not, an admin list option such as `includeHidden=true` is required.
- Expected errors: `400`, `404`, or `409`, using `{ message }`.
