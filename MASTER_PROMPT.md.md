# MASTER VIBE CODING PROMPT

You are the lead frontend engineer and UI engineer for this project.

You are working on a frontend-only movie streaming website inspired by Netflix.

The project is an academic project designed to be demonstrated.

---

## SOURCE OF TRUTH

Before doing any implementation, read:

```text
AGENTS.md
01-PRD.md
02-Tech-Stack-Architecture.md
```

`AGENTS.md` defines engineering rules.

`01-PRD.md` defines product requirements.

`02-Tech-Stack-Architecture.md` defines the technical architecture.

Do not contradict these documents.

---

# YOUR PRIMARY OBJECTIVE

Build a polished, production-quality frontend for the movie streaming platform.

The application should feel like a coherent real-world streaming product.

It should NOT feel like:

- a generic dashboard
- a collection of demo pages
- an AI-generated template
- a static HTML mockup

The application should have:

- consistent visual language
- reusable components
- realistic interactions
- responsive behavior
- loading states
- error states
- empty states
- clean navigation
- realistic mock data

---

# TECH STACK

Use exactly:

```text
React 18
Vite
TypeScript
Tailwind CSS
React Router v6
TanStack Query
Axios
Zustand
React Hook Form
Zod
Embla Carousel or Swiper
lucide-react
Framer Motion
TanStack Table
react-hot-toast
```

Do not introduce additional dependencies unless necessary.

---

# CURRENT MODE

We are currently implementing:

```text
FRONTEND ONLY
```

The backend does not need to exist.

Use mock data and mock API functions.

However, architecture must remain compatible with:

```text
React
    ↓
REST API
    ↓
ASP.NET Core
    ↓
Database
```

Never call TMDB directly from the frontend.

---

# PRODUCT

The website supports:

```text
Guest
User
Admin
```

Guest:

- Home
- Movie detail
- Search
- Genre
- Trailer

User:

- My List
- History
- Profile

Admin:

- Dashboard
- Movie management
- Genre management
- User management

---

# REQUIRED ROUTES

```text
/
 /login
 /register
 /movie/:id
 /search?q=
 /genre/:id
 /watch/:id
 /my-list
 /history
 /profile
 /admin
 /admin/movies
 /admin/movies/new
 /admin/movies/:id
 /admin/genres
 /admin/users
 *
```

---

# DESIGN DIRECTION

Create a cinematic streaming experience inspired by Netflix.

Do not directly reproduce Netflix branding.

Create an original brand identity.

Visual characteristics:

- dark cinematic background
- large cinematic artwork
- strong contrast
- clear typography
- large hero section
- horizontal movie rows
- polished hover states
- smooth transitions
- minimal clutter
- modern spacing
- responsive layouts

The design should feel premium without becoming visually noisy.

---

# HOME PAGE

The home page should contain:

```text
Navbar
Hero Banner
Trending
Newly Added
Genre rows
Footer
```

Hero:

- backdrop image
- title
- description
- metadata
- primary action
- secondary action

Movie rows:

- section title
- horizontal carousel
- movie cards
- smooth scrolling
- responsive behavior

Movie cards:

Default:

```text
Poster
```

Hover:

```text
Poster
Title
Year
Rating
Genre
Play
My List
```

---

# MOVIE DETAIL

Movie detail should contain:

```text
Backdrop
Poster
Title
Description
Year
Duration
Genres
Cast
Rating
Watch Trailer
Add to My List
Similar Movies
```

Use strong visual hierarchy.

---

# SEARCH

Search should support:

```text
Search input
Suggestions
Results
Loading
Empty
Error
```

Route:

```text
/search?q=
```

---

# TRAILER

Only trailers are supported.

Use:

```text
trailerKey
```

and:

```text
https://www.youtube.com/embed/{trailerKey}
```

Do not create a fake movie streaming system.

---

# AUTHENTICATION

Create a realistic mock authentication flow.

Login:

```text
email
password
```

Register:

```text
email
password
confirm password
display name
```

Use:

```text
React Hook Form
Zod
Zustand
```

Mock the backend response.

The UI must behave as if a real API exists.

---

# PERSONALIZATION

My List:

```text
add
remove
empty state
```

History:

```text
recently watched
empty state
```

Profile:

```text
avatar
display name
email
```

---

# ADMIN

Build an admin dashboard that visually feels separate from the consumer streaming UI.

Required:

```text
Admin layout
Sidebar
Dashboard
Movie table
Search
Filter
Pagination
Add movie
Edit movie
Delete
Hide/show
TMDB import UI
Genre management
User management
```

The admin UI should use reusable table/form components.

---

# MOCK API ARCHITECTURE

Use:

```text
Component
    ↓
Hook
    ↓
API function
    ↓
Mock implementation
```

Example:

```text
MovieRow
    ↓
useMovies()
    ↓
moviesApi.getTrending()
    ↓
mockMovies
```

Do not import mock data directly into UI components.

---

# DATA MODELS

Create strongly typed models.

At minimum:

```text
Movie
Genre
CastMember
User
AuthResponse
PaginationResponse<T>
ApiError
```

Movie should support:

```text
id
title
description
year
duration
genres
cast
rating
posterPath
backdropPath
trailerKey
featured
```

Keep types compatible with the future API.

---

# UX QUALITY

Every async screen must support:

```text
loading
success
empty
error
```

Use skeleton loaders.

Do not use:

```text
Loading...
```

everywhere as the only loading experience.

---

# RESPONSIVE

The site must work on:

```text
Desktop
Tablet
Mobile
```

Do not simply scale desktop down.

Design mobile deliberately.

---

# PERFORMANCE

Use:

- lazy-loaded images
- sensible image dimensions
- TanStack Query caching
- code splitting when useful
- limited animation
- reusable components

---

# IMPLEMENTATION RULE

Do not implement the entire project in one giant operation.

Work in phases.

After every phase:

```text
run application
check TypeScript
check console
check routing
check responsive layout
fix issues
```

Keep the application runnable.

---

# CODING STYLE

Prefer:

```text
small components
clear names
strict typing
simple logic
reusable components
feature-based organization
```

Avoid:

```text
any
giant components
duplicate UI
unnecessary abstractions
magic numbers
hardcoded API logic in components
```

---

# WHEN YOU ENCOUNTER AMBIGUITY

If the ambiguity affects architecture or data contracts:

STOP and ask.

If it is a minor visual implementation detail:

choose a sensible solution consistent with the existing design system and continue.

Do not invent major product features.

---

# FIRST TASK

Before writing code:

1. Inspect the repository.
2. Read `AGENTS.md`.
3. Read `01-PRD.md`.
4. Read `02-Tech-Stack-Architecture.md`.
5. Inspect the existing source tree.
6. Determine whether a frontend already exists.
7. Do not overwrite existing working code without inspection.
8. Report the current state briefly.
9. Then begin Phase 0.

Do not generate unnecessary files before understanding the existing project.