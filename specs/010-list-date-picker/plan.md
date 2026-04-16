# Implementation Plan: Player List View Date Picker

**Branch**: `010-list-date-picker` | **Date**: 2026-04-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-list-date-picker/spec.md`

## Summary

Add a date navigation bar to the player list view so players can select any date (or step through
dates one day at a time) and see that day's slot availability — without leaving list mode or
switching to the full calendar. The implementation reuses the existing `currentDate` state in
`PublicCalendarPage` (feature 009) and adjusts the booking query to fetch a single-day range when
in list mode. No new dependencies or database changes are required.

## Technical Context

**Language/Version**: TypeScript 6.0.2 + React 19.2.4  
**Primary Dependencies**: Tailwind CSS 3.4.17, shadcn/ui, date-fns 4.1.0, lucide-react 1.8  
**Storage**: N/A — existing Supabase read-only booking data; no schema change  
**Testing**: `npm test` (unit/integration), `npm run lint` (ESLint)  
**Target Platform**: Web SPA (mobile ≥375 px primary, desktop ≥1280 px)  
**Project Type**: Web application (public player-facing view)  
**Performance Goals**: Date change → list re-render within 300 ms (SC-002); single-day query reduces over-fetch vs. full-week query  
**Constraints**: No new npm dependencies; no third-party date picker widget; `currentDate` state lifted in `PublicCalendarPage` (feature 009 prerequisite)  
**Scale/Scope**: 1 new component, 1 modified file

## Constitution Check

- [x] **I. Spec-First**: `specs/010-list-date-picker/spec.md` exists with 2 prioritized user stories and 7 FRs. All implementation tasks derive from spec stories.
- [x] **II. Type Safety**: No `any` types. `ListDateNavProps` strictly typed; date parsing guards against invalid input. No cross-boundary data — pure UI state.
- [x] **III. Component Reusability**: `ListDateNav` placed under `src/features/players/calendar/`. No business logic in the component — only date arithmetic. shadcn/ui `Button` used for arrow controls.
- [x] **IV. Data Integrity & Security**: No new tables, no RLS changes. Booking query uses existing read-only public access pattern. No admin-route exposure.
- [x] **V. Responsive Design**: Date nav bar designed for ≥375 px with `min-w-0` / `flex-wrap` safety. Keyboard focus rings on all interactive elements. SC-005 explicitly verifies 375 px fit.

## Project Structure

### Documentation (this feature)

```text
specs/010-list-date-picker/
├── plan.md              # This file
├── research.md          # Phase 0 — 5 decisions
├── data-model.md        # Phase 1 — SelectedDate, ListDateQueryRange, ListDateNavProps
├── quickstart.md        # Phase 1 — manual verification steps
├── contracts/
│   └── ListDateNavContract.ts
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (repository root)

```text
src/
├── features/
│   └── players/
│       ├── PublicCalendarPage.tsx       # MODIFY — single-day query range in list mode; render ListDateNav
│       └── calendar/
│           ├── deriveSlotRows.ts        # READ-ONLY (no changes)
│           └── ListDateNav.tsx          # NEW — date picker + prev/next arrows controlled component
```

**Structure Decision**: Single SPA project. One new component in `src/features/players/calendar/`; one modification to `PublicCalendarPage.tsx`. No shared component changes.

## Complexity Tracking

No constitution violations.
