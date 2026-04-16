# Implementation Plan: Mobile-Friendly Calendar View Toggle

**Branch**: `009-mobile-calendar-toggle` | **Date**: 2026-04-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-mobile-list-toggle/spec.md`

## Summary

Add a list / calendar display-mode toggle to the player booking page, defaulting to list view on
every page load (FR-002). List rows reuse the existing booking query data and expose the same
slot-status semantics and booking flow as calendar view. The rules banner is simplified by
removing the standalone "View Full Rules" link (FR-007) while preserving chip-click and header
button entry points. No database changes are required — this is a pure UI/state feature.

## Technical Context

**Language/Version**: TypeScript 6.0.2 + React 19.2.4  
**Primary Dependencies**: Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, lucide-react 1.8, date-fns 4.1.0  
**Storage**: N/A — existing Supabase read-only booking data; no schema change  
**Testing**: `npm test` (unit/integration), `npm run lint` (ESLint)  
**Target Platform**: Web SPA (mobile ≥375 px primary, desktop ≥1280 px)  
**Project Type**: Web application (public player-facing view)  
**Performance Goals**: List view render ≤100 ms for a full day of slots (client-side derivation)  
**Constraints**: No new API calls; reuse existing booking query. No localStorage persistence for view preference.  
**Scale/Scope**: Single player calendar page; 2 new components, 3 modified files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/009-mobile-list-toggle/spec.md` exists with 3 prioritized user stories and 11 FRs. All implementation tasks derive from spec stories.
- [x] **II. Type Safety**: No `any` types introduced. `DisplayMode`, `SlotRowRepresentation`, and component props are all strictly typed (see contracts/). No cross-boundary data requires Zod (pure UI state).
- [x] **III. Component Reusability**: `PlayerListView` lives under `src/features/players/calendar/`. Display-mode toggle rendered inside `PublicCalendarPage`. No business logic in UI components.
- [x] **IV. Data Integrity & Security**: No new tables or RLS changes. Existing booking query used read-only. No admin-route exposure.
- [x] **V. Responsive Design**: List rows designed as full-width touch targets at ≥375 px. Toggle control accessible via keyboard. Breakpoints ≥375 px / ≥768 px / ≥1280 px addressed in contracts.

## Project Structure

### Documentation (this feature)

```text
specs/009-mobile-list-toggle/
├── plan.md              # This file
├── research.md          # Phase 0 — 7 decisions
├── data-model.md        # Phase 1 — ViewModePreference, SlotRowRepresentation, RulesBannerActionSet
├── quickstart.md        # Phase 1 — manual verification steps
├── contracts/           # Phase 1
│   ├── PlayerCalendarViewContract.ts
│   └── RulesBannerContract.ts
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (repository root)

```text
src/
├── features/
│   └── players/
│       ├── PublicCalendarPage.tsx       # MODIFY — add displayMode state (default 'list'), toggle UI, conditional render
│       ├── rules/
│       │   └── RulesBanner.tsx          # MODIFY — remove "View Full Rules" button
│       └── calendar/
│           └── PlayerListView.tsx       # NEW — list-mode slot rows component
└── components/
    └── shared/
        └── calendar/
            └── CalendarContainer.tsx    # READ-ONLY (no changes; toggle lives in PublicCalendarPage)
```

**Structure Decision**: Single SPA project. All new/modified files in `src/features/players/`; no new shared components needed.

## Complexity Tracking

No constitution violations.
