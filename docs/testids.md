# Stable test IDs

These selectors are part of the Selenium-facing UI contract. Dynamic placeholders are shown with `{id}` or `{slug}`.

| Test ID | Component | Purpose |
|---|---|---|
| `search-toggle` | Navbar | Open or close Navbar search |
| `search-input` | SearchBar | Search text input |
| `search-button` | SearchBar | Submit a search |
| `search-suggestion-{id}` | SearchBar | Select a movie suggestion |
| `movie-card-{id}` | MovieCard, MovieGrid | Open a movie detail page |
| `movie-row-{slug}` | MovieRow | Identify a carousel row |
| `hero-play-button` | HeroBanner | Open the featured trailer page |
| `hero-more-info-button` | HeroBanner | Open featured movie details |
| `movie-title` | MovieDetail | Detail-page movie title |
| `watch-trailer-button` | MovieDetail | Open the trailer modal |
| `my-list-button` | MyListButton | Add or remove a movie |
| `modal` | Modal | Active accessible dialog |
| `trailer-modal` | TrailerModal | Trailer dialog content |
| `login-email` | LoginForm | Login email input |
| `login-password` | LoginForm | Login password input |
| `login-submit` | LoginForm | Submit login |
| `login-error` | LoginForm | Login API error alert |
| `register-display-name` | RegisterForm | Optional display name input |
| `register-email` | RegisterForm | Registration email input |
| `register-password` | RegisterForm | Registration password input |
| `register-confirm` | RegisterForm | Confirm registration password |
| `register-submit` | RegisterForm | Submit registration |
| `register-error` | RegisterForm | Registration API error alert |

`tests/phase1.tsx` was an unreferenced manual Phase 1 fixture. It was not run by an npm script and was deleted in Phase 3; production compilation already included only `src`.
