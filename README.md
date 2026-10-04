# Streamly Frontend

Streamly is a standalone React frontend for browsing movies, watching YouTube trailers, and demonstrating personalized streaming flows. It can run entirely with local mocks or connect selected domains to the separate ASP.NET Core backend.

## Stack

React 18, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query/Table, Axios, Zustand, React Hook Form, Zod, Embla Carousel, Framer Motion, and react-hot-toast.

## Local setup

Use Node **24.14.0** (see `.nvmrc`).

```bash
npm install
cp .env.example .env
npm run dev
```

The dev origin is `http://localhost:5173`. Keep `localhost` rather than `127.0.0.1` because backend CORS origins are exact.

| Script | Purpose |
|---|---|
| `npm run dev` | Start Vite on strict port 5173 |
| `npm run build` | Type-check and create the production bundle |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run preview` | Preview the production bundle |

## Environment

| Variable | Meaning |
|---|---|
| `VITE_API_URL` | Backend host only, with no `/api` and no trailing slash; Axios appends `/api` |
| `VITE_USE_MOCK` | `true` uses mock movies and genres |
| `VITE_USE_MOCK_AUTH` | `true` uses mock login, register, and current-user behavior |
| `VITE_USE_MOCK_USER_DATA` | `true` uses mock My List, History, and Profile data |

| Mode | `VITE_USE_MOCK` | `VITE_USE_MOCK_AUTH` | `VITE_USE_MOCK_USER_DATA` |
|---|---:|---:|---:|
| A — full mock | `true` | `true` | `true` |
| B — real movies + genres | `false` | `true` | `true` |
| C — real movies, genres + auth | `false` | `false` | `true` |

Each component talks to a feature hook, which talks to an API module. The API module chooses mock or Axios behavior from the domain flag, so UI code does not know the source. Personalized real endpoints remain disabled until their backend contract is available.

## Deployment

`vercel.json` rewrites SPA routes to `index.html`. Set all four environment variables in Vercel. An HTTPS deployment can call only an HTTPS backend; if no public backend exists, deploy with all three mock flags set to `true`. Add the final Vercel origin to the backend CORS allowlist.

## Structure

```text
src/
├── api/          # API boundary and mock/real dispatch
├── components/   # Shared UI and layouts
├── features/     # Feature hooks, schemas, and feature components
├── hooks/        # Shared React hooks
├── lib/          # Utilities, flags, query keys
├── mocks/        # Isolated mock data, persistence, latency, and domain APIs
├── pages/        # Route pages
├── routes/       # Router and guards
├── store/        # Zustand auth session
└── types/        # Contract-aligned models
```

See the [documentation index](docs/README.md) for the contract, handoff notes, proposals, test IDs, and phase reports.
