# the-shuttle-ksc Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-01

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
- Supabase PostgreSQL with RLS (no schema changes required) (016-setup-feature-branch)
- TypeScript 6.0.2 with React 19.2.4 + date-fns 4.1.0, React Query 5.99.0, Supabase 2.103.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8 (016-setup-feature-branch)
- Supabase PostgreSQL — read-only; no schema changes. `bookings` and `court_settings` tables are the data sources. (016-setup-feature-branch)
- Supabase PostgreSQL (existing `court_settings` + `bookings` reads only; no schema changes) (017-create-feature-branch)
- TypeScript 6.0.2 with React 19.2.4 + React Query 5.99.0, Supabase 2.103.0, date-fns 4.1.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8, zod 4.x (018-enforce-player-endtime)
- Supabase PostgreSQL with RLS (`bookings`, `players`, `admin_users` + existing `dashboard_metrics` view) (018-enforce-player-endtime)
- TypeScript 6.0.2 with React 19.2.4 + React Query 5.99.0, Supabase 2.103.0, date-fns 4.1.0, Tailwind CSS 3.4.17, shadcn/ui dialog/button primitives, lucide-react 1.8, zod 4.x (019-admin-report-refinements)
- Supabase PostgreSQL with RLS using existing `bookings`, `players`, and `admin_users` access patterns; no schema changes (019-admin-report-refinements)
- TypeScript 6.0.2 with React 19.2.4 + React Query 5.99.0, Tailwind CSS 3.4.17, shadcn/ui dialog/button primitives, lucide-react 1.8 (020-fix-paid-modal-ui)
- Supabase PostgreSQL with existing RLS model (no schema changes) (020-fix-paid-modal-ui)
- TypeScript 6.0.2 + React 19.2.4, React Query 5.99.0, react-hook-form 7.72.1, Zod 4.x, Supabase 2.103.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8, date-fns 4.1.0 (021-route-callback-requests)
- Supabase PostgreSQL with RLS — 2 new tables (`booking_agents`, `callback_requests`); 4 new RPC functions; `admin_users` extended with `is_super_admin` column (021-route-callback-requests)
- TypeScript 6.0.2 + React 19.2.4, Tailwind CSS 3.4.17, lucide-react 1.8, date-fns 4.1.0, React Query 5.99.0, shadcn/ui (021-route-callback-requests)
- N/A — no schema changes; existing `bookings` and `court_settings` reads only (021-route-callback-requests)
- TypeScript 6.0.2 + React 19.2.4, Tailwind CSS 3.4.17, shadcn/ui, react-hook-form 7.72.1, Zod 4.x, lucide-react 1.8, date-fns 4.1.0 (023-new-speckit-spec)
- Supabase PostgreSQL (existing RLS, no schema changes) + browser `localStorage` for draft/preference persistence (023-new-speckit-spec)
- TypeScript 6.0.2, React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, react-hook-form 7.72.1, Zod 4.x, Supabase JS 2.103.0, date-fns 4.1.0, lucide-react 1.8, vite-plugin-pwa 1.2.x (023-new-speckit-spec)
- Supabase PostgreSQL (existing RPC/table), browser localStorage, Workbox BackgroundSync queue (023-new-speckit-spec)
- TypeScript 6.0.2 + React 19.2.4, Vite 8.0, React Query 5.99.0, Tailwind CSS 3.4.17, date-fns 4.1.0, shadcn/ui primitives (024-setup-specify-invocation)
- Supabase PostgreSQL (existing `bookings`, `court_settings`, `recurring_unavailable_blocks`) (024-setup-specify-invocation)
- TypeScript 6.0.2 + React 19.2.4, React Query 5.99.0, date-fns 4.1.0, Supabase 2.103.0 (024-setup-specify-invocation)
- Supabase PostgreSQL -- read-only; existing `bookings`, `court_settings`, (024-setup-specify-invocation)
- TypeScript 6.0.2, React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, Supabase JS 2.103.0, date-fns 4.1.0, lucide-react 1.8 (024-setup-specify-invocation)
- TypeScript 6.0.2, React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, Supabase JS 2.103.0, react-hook-form 7.72.1, Zod 4.x, react-markdown 10.1.0 (028-pre-specify-branch)
- Supabase PostgreSQL (`court_settings` table extension; no new table required) (028-pre-specify-branch)
- TypeScript 6.0.2 + React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, react-router-dom 7.x, date-fns 4.1.0, lucide-react 1.8, Zod 4.x, Supabase JS 2.103.0 (026-admin-dashboard-report-breakdown)
- Supabase PostgreSQL with RLS � read-only; existing `bookings` table (same column set as `useFinancialReport`); no new tables or migrations (026-admin-dashboard-report-breakdown)
- TypeScript 6.0.2 + React 19.2.4, React Router 7.x, React Query 5.99.0, Zod 4.x, date-fns 4.1.0, shadcn/ui, Tailwind CSS 3.4.17 (029-setup-spec-invocation)
- Supabase PostgreSQL (existing `bookings` table, read-only for this feature) (029-setup-spec-invocation)

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
- 029-setup-spec-invocation: Added TypeScript 6.0.2 + React 19.2.4, React Router 7.x, React Query 5.99.0, Zod 4.x, date-fns 4.1.0, shadcn/ui, Tailwind CSS 3.4.17
- 026-admin-dashboard-report-breakdown: Added TypeScript 6.0.2 + React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, react-router-dom 7.x, date-fns 4.1.0, lucide-react 1.8, Zod 4.x, Supabase JS 2.103.0
- 028-pre-specify-branch: Added TypeScript 6.0.2, React 19.2.4 + Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, Supabase JS 2.103.0, react-hook-form 7.72.1, Zod 4.x, react-markdown 10.1.0


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
