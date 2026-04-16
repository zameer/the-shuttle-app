# Implementation Plan: Header Quote Layout and All-Time Dashboard Metrics

**Branch**: `007-header-quote-dashboard-all` | **Date**: 2026-04-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-header-quote-dashboard-all/spec.md`

## Summary

Two self-contained changes: (1) replace the single-day `useDashboardMetrics` query with an
all-time aggregate hook that sums totals across every row in `dashboard_metrics`, and update
`AdminDashboardPage` to use it; (2) restructure the `PublicLayout` header so `QuoteArea`
appears beside (right of) the "THE SHUTTLE" title in the same row, not stacked below the
subtitle — using a flex layout that keeps the bell icon on the far right and degrades cleanly
on mobile.

## Technical Context

**Language/Version**: TypeScript 6.0.2
**Primary Dependencies**: React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, Supabase 2.103.0, date-fns 4.1.0
**Storage**: Supabase PostgreSQL — `dashboard_metrics` view (read-only aggregate query; no new tables or migrations)
**Testing**: `npm run lint` (ESLint); visual browser verification at 375 px, 768 px, 1280 px
**Target Platform**: Web browser — responsive desktop + mobile
**Project Type**: web-app
**Performance Goals**: Dashboard aggregate query must complete within normal React Query stale-time; no perceptible layout shift in header on load
**Constraints**: No new Supabase tables or migrations; no changes to RLS policies; `QuoteArea` and `BellNotification` component APIs unchanged
**Scale/Scope**: ~50 concurrent users; single-court club

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before beginning implementation:

- [x] **I. Spec-First**: `specs/007-header-quote-dashboard-all/spec.md` exists with two
  prioritized user stories and independent acceptance scenarios. All tasks trace to a story.
- [x] **II. Type Safety**: New `AllTimeMetrics` interface defined in hook file. Supabase response
  typed explicitly; no `any`. `QuoteArea` prop API unchanged — no new data boundary.
- [x] **III. Component Reusability**: `QuoteArea` component API is unchanged; only `PublicLayout`
  flex structure changes. Aggregate logic lives in a new hook (`useAllTimeMetrics`), not in the
  component. All styling via Tailwind.
- [x] **IV. Data Integrity & Security**: No new tables → no RLS impact. `dashboard_metrics` is
  a read-only view accessible to authenticated admin only (unchanged RLS). Admin route guard
  unchanged.
- [x] **V. Responsive Design**: Header flex layout (title + quote + bell) designed mobile-first;
  tested at ≥375 px, ≥768 px, ≥1280 px per contracts. Bell icon remains accessible on narrow
  screens.

## Project Structure

### Documentation (this feature)

```text
specs/007-header-quote-dashboard-all/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── AdminDashboardUI.ts    # All-time metrics hook + dashboard component contract
│   └── PublicHeaderUI.ts      # Quote beside-title layout contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── admin/
│   │   └── AdminDashboardPage.tsx         [MODIFY] use useAllTimeMetrics instead of useDashboardMetrics
│   ├── dashboard/
│   │   ├── useDashboardMetrics.ts         [UNCHANGED]
│   │   └── useAllTimeMetrics.ts           [NEW] aggregate hook — sums all rows in dashboard_metrics
│   └── players/
│       └── header/
│           └── QuoteArea.tsx              [MODIFY] adjust layout classes for side-by-side placement
└── layouts/
    └── PublicLayout.tsx                   [MODIFY] restructure header flex to place quote beside title
```

**Structure Decision**: Single-project layout. No backend, migration, or test directory changes.
