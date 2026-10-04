# AGENTS.md — Streaming Website Frontend

## 1. PROJECT CONTEXT

This project is a frontend-only streaming movie website inspired by the UX patterns of Netflix.

The project is an academic project intended to produce a working, demonstrable product.

The frontend must be developed independently from the backend while remaining compatible with the planned REST API contract.

The authoritative project documents are:

- `01-PRD.md`
- `02-Tech-Stack-Architecture.md`
- `03-FE-BE-Contract.md`

These documents are the source of truth.

Where `03-FE-BE-Contract.md` conflicts with `01-PRD.md` or `02-Tech-Stack-Architecture.md` about API shape, `03-FE-BE-Contract.md` wins.

This repository is FRONTEND ONLY; never add backend code here.

When implementing a feature, always prefer the requirements defined in these documents over assumptions or generic conventions.

Do not invent major features that are not defined in the PRD.

Do not remove or alter defined P0 requirements without explicit instruction.

---

# 2. PRODUCT GOAL

Build a polished movie streaming frontend with a visual language inspired by Netflix.

The product must support:

- Movie discovery
- Hero banner
- Horizontal movie carousels
- Movie details
- Movie search
- Genre browsing
- YouTube trailer playback
- Authentication UI
- My List
- Watch history
- User profile
- Admin movie management UI

The product must feel like a real streaming platform rather than a collection of disconnected demo pages.

---

# 3. TECHNOLOGY STACK

Use the following stack.

### Core

- React 18
- Vite
- TypeScript
- Tailwind CSS

### Routing

- React Router v6

### Server state / API

- TanStack Query
- Axios

### Global state

- Zustand

### Forms

- React Hook Form
- Zod

### UI

- Embla Carousel or Swiper
- lucide-react
- Framer Motion when animation is useful
- react-hot-toast

### Admin tables

- TanStack Table

Do not introduce additional libraries unless there is a clear technical reason.

Prefer the existing stack whenever possible.

---

# 4. FRONTEND ARCHITECTURE

Use this structure:

```text
src/
├── api/
├── components/
├── features/
├── hooks/
├── pages/
├── routes/
├── store/
├── types/
└── lib/
```

Responsibilities:

### `api/`

Contains API clients and API functions.

Examples:

```text
api/
├── client.ts
├── auth.api.ts
├── movies.api.ts
├── user.api.ts
└── admin.api.ts
```

Do not put UI logic here.

---

### `components/`

Contains reusable UI components.

Examples:

```text
components/
├── layout/
├── navbar/
├── movie/
├── carousel/
├── hero/
├── modal/
├── button/
├── form/
└── feedback/
```

Reusable components should not contain page-specific business logic.

---

### `features/`

Organize feature-specific logic.

Examples:

```text
features/
├── auth/
├── movies/
├── my-list/
├── history/
├── profile/
└── admin/
```

A feature may contain:

- hooks
- components
- schemas
- types
- utilities
- feature-specific logic

---

### `pages/`

One route corresponds to one page.

Examples:

```text
pages/
├── HomePage.tsx
├── LoginPage.tsx
├── RegisterPage.tsx
├── MovieDetailPage.tsx
├── SearchPage.tsx
├── GenrePage.tsx
├── WatchPage.tsx
├── MyListPage.tsx
├── HistoryPage.tsx
├── ProfilePage.tsx
├── NotFoundPage.tsx
└── admin/
```

Pages should primarily compose components.

Avoid putting large amounts of business logic directly inside pages.

---

### `routes/`

Contains:

- router configuration
- protected routes
- admin routes
- authentication guards

Example:

```text
routes/
├── AppRouter.tsx
├── ProtectedRoute.tsx
└── AdminRoute.tsx
```

---

### `store/`

Contains Zustand stores.

Primary store:

```text
authStore
```

Use global state only when global state is actually required.

Do not put server data into Zustand when TanStack Query should manage it.

---

### `types/`

Contains TypeScript models matching the API contract.

Examples:

```text
types/
├── movie.ts
├── user.ts
├── auth.ts
├── genre.ts
├── pagination.ts
└── api.ts
```

Use strict typing.

Avoid `any`.

---

### `lib/`

Contains utilities and constants.

Examples:

```text
lib/
├── constants.ts
├── utils.ts
├── image.ts
└── storage.ts
```

---

# 5. BACKEND INDEPENDENCE

This project is currently frontend-only.

The backend does not need to exist during the initial frontend development.

However, the frontend architecture MUST remain compatible with the planned backend.

Future architecture:

```text
React SPA
    |
    | HTTPS / JSON
    v
ASP.NET Core Web API
    |
    +── PostgreSQL
    |
    +── TMDB API
```

The frontend must eventually communicate only with the backend.

The frontend must NOT call TMDB directly.

Never place a TMDB API key in frontend code.

---

# 6. MOCK API RULE

During frontend-only development, use mock data.

However, mock data must imitate the expected backend structure.

Do NOT create random UI-specific data structures that would later require rewriting the application.

The migration path should be:

```text
Mock API
    ↓
Real API
```

not:

```text
Mock UI data
    ↓
Rewrite entire application
```

Prefer this architecture:

```text
Component
   ↓
Feature Hook
   ↓
API Function
   ↓
Mock API / Real API
```

For example:

```text
MovieCard
   ↓
useMovies()
   ↓
moviesApi.getMovies()
   ↓
mockMovies
```

Later:

```text
MovieCard
   ↓
useMovies()
   ↓
moviesApi.getMovies()
   ↓
GET /api/v1/movies
```

The component should not need to know whether the data comes from mock data or the backend.

---

# 7. API CONTRACT

The planned backend contract uses:

```text
Base URL:
{API_URL}/api/v1
```

JSON fields use:

```text
camelCase
```

Authentication:

```http
Authorization: Bearer <accessToken>
```

Pagination:

```text
?page=1&pageSize=20
```

Expected pagination response:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "totalItems": 0,
  "totalPages": 0
}
```

Errors should be compatible with ASP.NET ProblemDetails:

```json
{
  "title": "...",
  "status": 400,
  "detail": "...",
  "errors": {
    "field": ["message"]
  }
}
```

Do not hardcode backend-specific implementation details into UI components.

---

# 8. ROUTES

The following routes are required by the PRD.

Public:

```text
/
 /movie/:id
 /search?q=
 /genre/:id
 /watch/:id
 /login
 /register
```

User:

```text
/my-list
/history
/profile
```

Admin:

```text
/admin
/admin/movies
/admin/movies/new
/admin/movies/:id
/admin/genres
/admin/users
```

Fallback:

```text
*
```

---

# 9. USER ROLES

There are three roles:

```text
Guest
User
Admin
```

### Guest

Can:

- browse home
- view movie details
- search
- browse genres
- watch trailers

### User

Can additionally:

- My List
- watch history
- profile

### Admin

Can additionally:

- manage movies
- manage genres
- manage users
- access dashboard

Frontend route guards are for UX.

They are NOT security.

The backend will ultimately enforce authorization.

---

# 10. AUTHENTICATION

Planned authentication:

```text
JWT Bearer
```

Login flow:

```text
Login Form
    ↓
POST /auth/login
    ↓
accessToken + user
    ↓
authStore
    ↓
Axios Authorization header
```

For the frontend-only phase, mock the login response.

The initial project may store the access token in localStorage because this is the documented project decision.

Do not claim localStorage is fully secure.

Future improvement:

```text
access token
+
httpOnly refresh token
```

---

# 11. MOVIE DATA

Movie data should support at least:

- id
- title
- description
- year
- duration
- genres
- cast
- rating
- poster
- backdrop
- trailerKey
- featured state

Images may use TMDB image CDN URLs in mock data.

Do not require the frontend to call TMDB.

---

# 12. TRAILER

The project only plays movie trailers.

It does NOT host or stream full copyrighted movies.

Trailer data comes from:

```text
trailerKey
```

Render YouTube using:

```text
https://www.youtube.com/embed/{trailerKey}
```

If a movie has no trailer:

- hide or disable the watch trailer action
- show an appropriate message

Do not invent a fake playable movie source.

---

# 13. DESIGN DIRECTION

The visual direction is:

```text
Netflix-inspired
+
original project branding
```

Do not blindly copy Netflix branding.

Do not hardcode Netflix logos or identity into the application.

Use a dark cinematic interface.

Prioritize:

- large cinematic hero
- strong contrast
- large movie artwork
- horizontal content rows
- hover interactions
- smooth transitions
- clean typography
- minimal visual clutter
- strong hierarchy

The UI should feel like a modern streaming platform.

---

# 14. DESIGN SYSTEM

Establish reusable design tokens before building many pages.

Define:

### Colors

Primary dark background.

Secondary dark surfaces.

Primary text.

Secondary text.

Accent color.

Success.

Warning.

Error.

### Spacing

Use Tailwind's spacing system consistently.

### Radius

Use a small set of reusable radius values.

### Typography

Define:

- heading
- body
- caption
- metadata

Avoid random font sizes across components.

---

# 15. CORE COMPONENTS

Build reusable components before duplicating page-specific UI.

Minimum components:

```text
Navbar
HeroBanner
MovieCard
MovieRow
MovieCarousel
MovieGrid
SearchBar
MovieDetail
TrailerModal
TrailerPlayer
Button
IconButton
Badge
Modal
Skeleton
EmptyState
ErrorState
LoadingSpinner
Toast
Footer
```

Admin components:

```text
AdminLayout
AdminSidebar
DataTable
MovieForm
MovieSearch
ConfirmDialog
```

---

# 16. HOME PAGE

The home page should contain:

```text
Navbar
Hero Banner
Trending row
Newly Added row
Genre-based rows
Footer
```

The PRD requires:

- hero banner
- trending movies
- newly added movies
- genre-based movie rows

Movie rows should support horizontal scrolling.

Movie cards should have hover enlargement.

---

# 17. MOVIE CARD

Movie cards are a core component.

Default:

```text
poster
title
```

Hover may reveal:

```text
larger card
play button
title
year
rating
genre
My List action
```

Avoid making cards excessively large.

Cards must work on:

- desktop
- tablet
- mobile

---

# 18. MOVIE DETAIL

Movie detail should support:

```text
backdrop
poster
title
description
year
duration
genres
cast
rating
watch trailer
add/remove My List
similar movies
```

The page must have clear hierarchy.

---

# 19. SEARCH

Search route:

```text
/search?q=
```

Support:

- search input
- suggestions while typing
- result grid
- loading state
- empty state
- error state

Do not make the search page visually identical to the home page.

---

# 20. LOADING / ERROR / EMPTY STATES

Every asynchronous page must consider:

```text
loading
success
empty
error
```

Use skeleton UI rather than displaying blank screens.

Never leave the user staring at an empty page while data loads.

---

# 21. RESPONSIVE DESIGN

The PRD explicitly requires:

```text
desktop
tablet
mobile
```

Design mobile intentionally.

Do not simply shrink desktop layouts.

Consider:

- mobile navbar
- horizontal carousels
- card sizing
- typography
- hero height
- modal behavior
- movie detail layout
- admin tables

---

# 22. PERFORMANCE

Prioritize:

- lazy loading images
- appropriate image sizes
- avoiding unnecessary re-renders
- React Query caching
- code splitting where appropriate
- lightweight animations

Do not sacrifice usability for premature optimization.

---

# 23. ACCESSIBILITY

Use:

- semantic HTML
- accessible buttons
- meaningful alt text
- keyboard navigation
- visible focus states
- proper labels for inputs
- sufficient text contrast

Do not use clickable `<div>` elements when a button or link is appropriate.

---

# 24. CODE QUALITY

Rules:

- TypeScript strict mode
- avoid `any`
- meaningful names
- small components
- reusable components
- no duplicated business logic
- no giant components
- no unnecessary abstraction
- no dead code
- no unused imports
- no console errors

Prefer readable code over clever code.

---

# 25. COMPONENT RULE

Before creating a new component, ask:

> Does this UI pattern already exist?

If yes:

```text
reuse it
```

If no:

```text
create a reusable component if it is likely to appear more than once
```

Do not create abstraction purely for abstraction's sake.

---

# 26. STATE MANAGEMENT

Use:

### TanStack Query

For:

- movies
- genres
- search results
- movie details
- history
- My List
- admin data

### Zustand

For:

- authentication
- current user
- access token
- global client-side state

Do not duplicate server state in Zustand.

---

# 27. FORMS

Use:

```text
React Hook Form
+
Zod
```

for:

- login
- register
- profile
- movie admin form

Validation should be typed and reusable.

---

# 28. ANIMATION

Use animation intentionally.

Good uses:

- navbar transition
- movie card hover
- modal enter/exit
- hero transitions
- page transitions where appropriate

Avoid:

- excessive animation
- animation on every element
- animations that hurt performance
- animations that make navigation slower

---

# 29. ADMIN UI

Admin pages are part of the frontend.

The admin interface should feel like a real management dashboard.

Required P0 UI:

```text
Movie list
Search
Filter
Pagination
Add movie
Edit movie
Hide/show movie
Delete movie
TMDB import flow UI
```

The actual TMDB request will eventually go through the backend.

For frontend-only development, mock it.

---

# 30. TMDB IMPORT FLOW

Expected UX:

```text
Admin
  ↓
Search movie
  ↓
Movie search results
  ↓
Select movie
  ↓
Preview movie information
  ↓
Import
  ↓
Movie appears in database/list
```

Do not implement direct TMDB API access in frontend.

---

# 31. FOOTER

Footer should include the TMDB attribution required by the project:

```text
This product uses the TMDB API but is not endorsed or certified by TMDB
```

Keep the footer clean and unobtrusive.

---

# 32. DEFINITION OF DONE

A feature is not considered complete merely because the happy path works.

Before considering a feature done, verify:

- desktop
- tablet
- mobile
- loading
- error
- empty
- hover
- keyboard interaction where relevant
- route behavior
- refresh behavior
- TypeScript errors
- console errors

For P0 features, the complete user flow should work with mock data.

---

# 33. DEVELOPMENT PROCESS

Work incrementally.

For every task:

1. Inspect the existing project.
2. Understand current architecture.
3. Identify reusable components.
4. Implement the smallest complete version.
5. Run the project.
6. Check TypeScript.
7. Check console.
8. Fix errors.
9. Test the relevant route.
10. Only then move to the next task.

Do not generate the entire application blindly in one step.

---

# 34. IMPORTANT AI BEHAVIOR

Do NOT:

- rewrite working code unnecessarily
- change the technology stack
- install random packages
- create duplicate components
- bypass the architecture
- call TMDB directly from frontend
- hardcode secrets
- create fake backend logic inside components
- put everything into one file
- use `any` to silence TypeScript
- remove requirements because they are inconvenient

DO:

- inspect before editing
- reuse existing code
- keep changes focused
- explain important architectural decisions
- keep the application runnable after each phase
- prefer simple solutions
- follow the PRD
- follow the architecture document

---

# 35. PRIORITY

When requirements conflict, use this priority:

```text
1. Explicit user instruction
2. PRD
3. Tech Stack & Architecture
4. Existing project architecture
5. General engineering conventions
```

Never silently override the PRD.

If a requirement is genuinely ambiguous, ask before making a major architectural decision.

---

# 36. CURRENT DEVELOPMENT MODE

Current mode:

```text
FRONTEND ONLY
```

Backend:

```text
NOT REQUIRED YET
```

Therefore:

```text
Use mock API/data.
Keep API boundaries clean.
Do not couple components to mock implementation.
Prepare the project for backend integration.
```

The goal is to produce a polished, demonstrable frontend that can later connect to the real ASP.NET Core API without rewriting the UI architecture.
