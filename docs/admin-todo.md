# Deferred admin work

- Add/Edit movie form with Zod validation: `title` at most 255 characters, `durationMinutes` from 1 to 1000, `voteAverage` from 0 to 10, and `popularity` at least 0.
- TMDB import flow UI through the backend.
- Genre attach/detach via `POST /movies/{movieId}/genres/{genreId}` and `DELETE /movies/{movieId}/genres/{genreId}`.
- Admin genres and users pages.
- Server-side paging and filters after the backend defines an admin movie-list endpoint that includes hidden movies.
- Remove header count badges when using server results that do not include catalog totals.
- Verify real-mode `PUT` and `DELETE` against a safe test database.
