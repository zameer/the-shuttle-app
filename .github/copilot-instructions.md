# the-shuttle-ksc Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-17

## Active Technologies
- TypeScript 6.0.2 with React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, react-hook-form 7.72.1, date-fns 4.1.0, lucide-react 1.8 (003-ui-improvements)
- Supabase PostgreSQL with RLS policies (bookings, players tables) (003-ui-improvements)
- TypeScript 6.0 + React 19.2 + Vite 8, Tailwind CSS 3.4, shadcn/ui, date-fns, lucide-react (004-responsive-calendar)
- N/A (no schema/storage changes; display/layout feature) (004-responsive-calendar)
- TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8, React Query 5.99.0 (main)
- N/A — static in-memory data arrays for quotes, announcements, and sponsors (MVP scope) (main)
- TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, Supabase 2.103.0, date-fns 4.1.0 (007-header-quote-dashboard-all)
- Supabase PostgreSQL — `dashboard_metrics` view (read-only aggregate query; no new tables or migrations) (007-header-quote-dashboard-all)
- TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, Supabase 2.103.0, lucide-react 1.8, react-markdown (NEW — to be installed) (008-player-rules-modal)
- Supabase PostgreSQL — new `court_rules` table; new migration required (008-player-rules-modal)
- TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, date-fns 4.1.0, lucide-react 1.8 (009-mobile-calendar-toggle)
- Supabase PostgreSQL (existing read-only booking/rules data; no schema change) (009-mobile-calendar-toggle)
- TypeScript 6.0.2 + React 19.2.4 + Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, lucide-react 1.8, date-fns 4.1.0 (009-mobile-calendar-toggle)
- N/A — existing Supabase read-only booking data; no schema change (009-mobile-calendar-toggle)
- TypeScript 6.0.2 + React 19.2.4 + Tailwind CSS 3.4.17, shadcn/ui, date-fns 4.1.0, lucide-react 1.8 (010-list-date-picker)
- TypeScript 6.0.2 + React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, date-fns 4.1.0, lucide-react 1.8 (012-set-list-default)
- Supabase PostgreSQL — no schema change; existing `bookings` table + `useBookings(startDate, endDate, true)` hook (012-set-list-default)
- TypeScript 6.0.2 + date-fns 4.1.0 (`addMinutes`, `parseISO`, `setHours`, …) (012-set-list-default)
- N/A — display-layer change only; no DB access (012-set-list-default)
- TypeScript 6.0.2 + React 19.2.4, date-fns 4.1.0 (`parseISO`, `setHours`, `setMinutes`, `addMinutes`), Tailwind CSS 3.4.17 (013-merge-booking-rows)
- N/A — client-side display derivation only; existing booking query reused (013-merge-booking-rows)
- Supabase PostgreSQL with RLS (existing `bookings` and `court_settings` tables; (014-admin-booking-calendar-fixes)
- TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, date-fns 4.1.0, lucide-react 1.8, shadcn/ui primitives already present (015-init-speckit-feature)
- Supabase PostgreSQL with RLS (no schema changes for this feature) (015-init-speckit-feature)

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
- 015-init-speckit-feature: Added TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, date-fns 4.1.0, lucide-react 1.8, shadcn/ui primitives already present
- 014-admin-booking-calendar-fixes: Added TypeScript 6.0.2 + React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui,
- 013-merge-booking-rows: Added TypeScript 6.0.2 + React 19.2.4, date-fns 4.1.0 (`parseISO`, `setHours`, `setMinutes`, `addMinutes`), Tailwind CSS 3.4.17


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
