# the-shuttle-ksc Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-16

## Active Technologies
- TypeScript 6.0.2 with React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, react-hook-form 7.72.1, date-fns 4.1.0, lucide-react 1.8 (003-ui-improvements)
- Supabase PostgreSQL with RLS policies (bookings, players tables) (003-ui-improvements)
- TypeScript 6.0 + React 19.2 + Vite 8, Tailwind CSS 3.4, shadcn/ui, date-fns, lucide-react (004-responsive-calendar)
- N/A (no schema/storage changes; display/layout feature) (004-responsive-calendar)
- TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8, React Query 5.99.0 (main)
- N/A — static in-memory data arrays for quotes, announcements, and sponsors (MVP scope) (main)
- TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, Supabase 2.103.0, date-fns 4.1.0 (007-header-quote-dashboard-all)
- Supabase PostgreSQL — `dashboard_metrics` view (read-only aggregate query; no new tables or migrations) (007-header-quote-dashboard-all)

- TypeScript 6.0.2 with React 19.2.4 + Tailwind CSS 3.4.17, React Query 5.99.0, react-hook-form 7.72.1, shadcn/ui, Supabase 2.103.0 (003-ui-improvements)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 6.0.2 with React 19.2.4: Follow standard conventions

## Recent Changes
- 007-header-quote-dashboard-all: Added TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, Supabase 2.103.0, date-fns 4.1.0
- main: Added TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8, React Query 5.99.0
- 004-responsive-calendar: Added TypeScript 6.0 + React 19.2 + Vite 8, Tailwind CSS 3.4, shadcn/ui, date-fns, lucide-react


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
