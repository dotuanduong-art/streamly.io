# FE–BE Contract (from the backend developer, v1.0)

> Source: `FE-BE.docx`. This file is the REAL contract of the backend as it exists today.
> Where it conflicts with `01-PRD.md` or `02-Tech-Stack-Architecture.md` about API shape
> (base URL, field names, error format, pagination, database), THIS FILE WINS.
> Do not invent endpoints or fields that are not listed here. Anything marked "NOT AVAILABLE"
> must stay behind the mock layer.

## 1. Architecture rules
- Frontend never talks to SQL Server and never calls TMDB. TMDB key lives only in the backend.
- Frontend talks to the backend only through REST + JSON, via ONE API client and ONE base-URL env var.
- Any change of endpoint name, JSON field, or data type must be agreed with the backend first.
- Features without an official API may use mock JSON, but the mock shape must follow this spec.

## 2. Backend status
| Area | Status |
|---|---|
| Movie CRUD + Search | AVAILABLE |
| Genre / Movie-Genre | NOT AVAILABLE |
| Auth + JWT | NOT AVAILABLE |
| My List (favorites) | NOT AVAILABLE |
| Watch History | NOT AVAILABLE |
| TMDB import | NOT AVAILABLE |
| Admin security (ADMIN role) | NOT AVAILABLE |

Stack: ASP.NET Core Web API + EF Core + SQL Server 2022 (database `StreamlyDb`).

## 3. Base URL
- Env var: `VITE_API_URL` holds the **host only** (example: `https://localhost:7160`).
- Paths below include the `/api` prefix. There is **no `/v1`**.
- The backend's localhost URL only works on the backend's machine. The frontend machine needs a
  deployed URL, tunnel, or LAN address. Until then use mock mode.

## 4. Endpoints (AVAILABLE)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/movies` | List movies |
| GET | `/api/movies/{id}` | Movie detail |
| GET | `/api/movies/search?q=inter` | Search by title (also for suggestions) |
| POST | `/api/movies` | Create movie manually (admin, temporary) |
| PUT | `/api/movies/{id}` | Update movie (admin) |
| DELETE | `/api/movies/{id}` | Delete movie (admin) |

Not yet specified by the backend (ask before relying on them): response shape of list/search
(plain array vs paged object), pagination parameters, whether public GET hides `isVisible=false`,
default ordering, request body of POST/PUT.

## 5. Movie JSON (exact field names)
```json
{
  "id": 1,
  "tmdbId": 157336,
  "title": "Interstellar",
  "overview": "...",
  "releaseDate": "2014-11-07T00:00:00",
  "durationMinutes": 169,
  "posterUrl": "https://...",
  "backdropUrl": "https://...",
  "trailerKey": "zSWdZVtXT7E",
  "isVisible": true,
  "isFeatured": true,
  "createdAt": "2026-10-02T15:00:00Z",
  "updatedAt": "2026-10-02T15:00:00Z"
}
```

```ts
export interface Movie {
  id: number;
  tmdbId: number;
  title: string;
  overview?: string | null;
  releaseDate?: string | null;     // no timezone suffix; take the year with slice(0, 4)
  durationMinutes?: number | null;
  posterUrl?: string | null;       // full absolute URL, not a TMDB path
  backdropUrl?: string | null;     // full absolute URL
  trailerKey?: string | null;
  isVisible: boolean;
  isFeatured: boolean;
  createdAt: string;               // ISO 8601 UTC
  updatedAt: string;
}
```

Fields the UI would like but the backend does NOT provide yet: genres, cast, rating, similar movies,
popularity/trending signal, server-side pagination. They may exist in the mock layer only, as
OPTIONAL fields, and the UI must render correctly when they are missing.

## 6. Errors (current)
The backend currently returns a simple body, not ASP.NET ProblemDetails:
- `GET /api/movies/99999` → 404 `{ "message": "Không tìm thấy phim." }`
- `POST /api/movies` with an existing tmdbId → 409 `{ "message": "Phim với TMDB ID này đã tồn tại." }`

The frontend must show `message` from the backend (admin 400/409 especially), and should also
tolerate ProblemDetails (`title`, `detail`, `errors`) in case the backend switches later.
Network/CORS errors must show a friendly message and must not leak unhandled promise rejections.

## 7. Trailer
Backend returns `trailerKey`. Frontend embeds `https://www.youtube.com/embed/{trailerKey}`.
If `trailerKey` is null/empty: hide or disable the action and show a message. Never render a broken iframe.

## 8. Auth (future)
- Header: `Authorization: Bearer <accessToken>`.
- Never send a role from the UI to grant permission. Frontend route guards are UX only.
- 401 → back to login. 403 → show a "no permission" state.

## 9. Required `data-testid` (Selenium, software testing course)
| Element | data-testid |
|---|---|
| Search input | `search-input` |
| Search submit button | `search-button` |
| Movie card | `movie-card-{id}` |
| Movie title (detail page) | `movie-title` |
| Watch trailer button | `watch-trailer-button` |
| My List button | `my-list-button` |
| Login email | `login-email` |
| Login password | `login-password` |
| Login submit | `login-submit` |
| Admin movie form | `admin-movie-form` |

Rules: no random IDs as selectors; do not depend on long or dynamic Tailwind classes; primary buttons
need clear disabled/loading states; animations must settle into a stable final state; no serious
console errors during the demo.

## 10. Integration order
GET movies → detail → search first. Only then Auth / My List / History.
Frontend must send the backend: stack, local origin (`http://localhost:5173`) for CORS, routes,
UI language, API client choice, search debounce, pagination approach, admin progress, and any extra
fields the UI needs.
