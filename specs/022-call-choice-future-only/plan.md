# Implementation Plan: 022 — Player Call Choice and Future-Only Dates

**Branch**: `021-route-callback-requests` | **Date**: 2026-04-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/022-call-choice-future-only/spec.md`

## Summary

Replace the single-state `CallFAB` with a speed-dial chooser FAB that exposes both "Call Now" and "Request Callback" from a single persistent button present in both calendar and list views. "Call Now" is greyed-out/disabled with a status label when no agent is available; "Request Callback" is always active. Separately, restrict public calendar and list views to the current day and future — list view additionally filters out past time slots within today.

No new dependencies. No schema changes. Pure frontend display layer changes across four existing files.

## Technical Context

**Language/Version**: TypeScript 6.0.2  
**Primary Dependencies**: React 19.2.4, Tailwind CSS 3.4.17, lucide-react 1.8, date-fns 4.1.0, React Query 5.99.0, shadcn/ui  
**Storage**: N/A — no schema changes; existing `bookings` and `court_settings` reads only  
**Testing**: `npm test` (unit), `npm run lint` (ESLint)  
**Target Platform**: Web (mobile-first; ≥375 px)  
**Project Type**: Web application (SPA — public player views)  
**Performance Goals**: No new async calls; FAB state is local React state (zero latency)  
**Constraints**: No framer-motion; animation via Tailwind CSS transitions only. No new npm packages.  
**Scale/Scope**: 2 modified components (CallFAB.tsx, PublicCalendarPage.tsx) + 2 supporting component updates (ListDateNav.tsx, CalendarContainer.tsx)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/022-call-choice-future-only/spec.md` exists with prioritized user stories and acceptance scenarios. All tasks will derive from spec user stories.
- [x] **II. Type Safety**: No `any` types introduced. All component props are explicitly typed. `useNextAvailableAgent` result type unchanged. No new Zod schemas needed (no new boundary data).
- [x] **III. Component Reusability**: `CallFAB` is a feature component under `src/features/players/call/`. `ListDateNav` and `CalendarContainer` are shared/feature components. No business logic in UI layer; date math stays in the page component.
- [x] **IV. Data Integrity & Security**: No new tables or RLS changes. No payment/price logic touched. Public page remains read-only.
- [x] **V. Responsive Design**: FAB is `fixed bottom-6 right-6` — correct on all breakpoints. Speed-dial buttons stack vertically above FAB, safe at ≥375 px.

All gates pass. No exceptions required.

## Project Structure

### Documentation (this feature)

```text
specs/022-call-choice-future-only/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── CallFABChooser.ts  # Phase 1 output
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (modified files only)

```text
src/
└── features/
    └── players/
        ├── PublicCalendarPage.tsx     # MODIFY: clamp currentDate to today; enforce minDate on nav
        ├── call/
        │   └── CallFAB.tsx            # MODIFY: replace 3-state with speed-dial chooser
        └── calendar/
            ├── ListDateNav.tsx        # MODIFY: add minDate prop; enforce min on input + disable prev
            └── PlayerListView.tsx     # MODIFY: filter out past time slots within today
src/
└── components/
    └── shared/
        └── calendar/
            └── CalendarContainer.tsx  # MODIFY: add minDate prop; prevent prev into past
```

**Structure Decision**: Single-project web SPA. All changes are in `src/features/players/` and `src/components/shared/calendar/`. No new files created.

## Complexity Tracking

No constitution violations. No complexity tracking entry required.
