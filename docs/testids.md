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
| `confirm-dialog` | ConfirmDialog | Active confirmation content |
| `confirm-dialog-confirm` | ConfirmDialog | Confirm action |
| `confirm-dialog-cancel` | ConfirmDialog | Cancel action |
| `history-item-{movieId}` | HistoryPage/MovieGrid | Watched movie entry |
| `history-remove-{movieId}` | HistoryPage | Remove one watch entry |
| `history-clear-button` | HistoryPage | Open clear-all confirmation |
| `profile-form` | ProfileForm | Profile editor |
| `profile-display-name` | ProfileForm | Editable display name |
| `profile-save` | ProfileForm | Save profile |
| `profile-avatar-option-{n}` | ProfileForm | Preset avatar radio option (1–8) |
| `admin-layout` | AdminLayout | Admin application shell |
| `admin-sidebar` | AdminSidebar | Desktop admin navigation |
| `admin-sidebar-toggle` | AdminLayout | Open mobile admin navigation |
| `admin-movie-table` | DataTable | Admin movie results |
| `admin-movie-row-{id}` | DataTable | Movie table row or mobile card |
| `admin-movie-search` | AdminMoviesManager | Client-side title search |
| `admin-filter-visibility` | AdminMoviesManager | Visibility filter |
| `admin-filter-featured` | AdminMoviesManager | Featured filter |
| `admin-filter-trailer` | AdminMoviesManager | Trailer filter |
| `admin-clear-filters` | AdminMoviesManager | Reset search and filters |
| `admin-add-movie-button` | AdminMoviesManager | Open Phase 6 add placeholder |
| `admin-edit-{id}` | MovieActionButtons | Open Phase 6 edit placeholder |
| `admin-toggle-visibility-{id}` | MovieActionButtons | Show or hide a movie |
| `admin-toggle-featured-{id}` | MovieActionButtons | Add or remove featured state |
| `admin-delete-{id}` | MovieActionButtons | Open delete confirmation |
| `admin-page-size` | DataTable | Choose 10, 20, or 50 rows |
| `admin-page-prev` | DataTable | Previous client-side page |
| `admin-page-next` | DataTable | Next client-side page |
| `admin-reset-demo` | AdminMoviesManager | Restore mock movie seed |

`tests/phase1.tsx` was an unreferenced manual Phase 1 fixture. It was not run by an npm script and was deleted in Phase 3; production compilation already included only `src`.
