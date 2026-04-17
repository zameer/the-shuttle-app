# Implementation Plan: Player List End-Time Enforcement

**Branch**: `017-create-feature-branch` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/017-player-list-endtime/spec.md`

## Summary

Enforce a strict player-list close boundary so player-facing rows never display beyond configured court closing time (including minute precision). The issue stems from the current player list derivation where booking rows are not end-clamped (`effectiveEnd = bookingEnd`) after feature 016. The solution is to clamp booking row end-time to the configured close boundary in player list derivation while preserving fallback defaults and keeping admin-list behavior out of scope.

## Technical Context

**Language/Version**: TypeScript 6.0.2 with React 19.2.4  
**Primary Dependencies**: date-fns 4.1.0, React Query 5.99.0, Supabase 2.103.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8  
**Storage**: Supabase PostgreSQL (existing `court_settings` + `bookings` reads only; no schema changes)  
**Testing**: `npm run lint` (required), focused eslint on touched files + manual QA scenarios from spec  
**Target Platform**: Web (mobile/tablet/desktop)  
**Project Type**: React SPA  
**Performance Goals**: No additional network calls; preserve synchronous row derivation complexity proportional to day booking count  
**Constraints**: Player list only; no role/auth model changes; close boundary must respect minute precision; fallback rendering must remain safe when settings unavailable  
**Scale/Scope**: 2 core source files expected (`deriveSlotRows.ts`, `PlayerListView.tsx`), no DB migrations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/017-player-list-endtime/spec.md` exists with prioritized stories and acceptance scenarios.
- [x] **II. Type Safety**: No `any` planned; boundary parsing and derivation changes remain strongly typed in feature-owned modules.
- [x] **III. Component Reusability**: Business rule change stays in derivation layer; UI remains presentation-only in player list component.
- [x] **IV. Data Integrity & Security**: No write-path/schema/RLS changes; no expanded data exposure or role changes.
- [x] **V. Responsive Design**: No layout changes; existing player list responsive behavior remains intact across breakpoints.

### Constitution Exceptions

None.

## Project Structure

### Documentation (this feature)

```text
specs/017-player-list-endtime/
|- plan.md
|- research.md
|- data-model.md
|- quickstart.md
|- contracts/
|  \- player-list-endtime-contract.md
\- tasks.md          # created by /speckit.tasks
```

### Source Code (scope for this feature)

```text
src/
\- features/
	|- players/
	|  |- calendar/
	|  |  |- deriveSlotRows.ts   # enforce close-boundary clamping
	|  |  \- PlayerListView.tsx  # pass parsed close boundary input
	|  \- PublicCalendarPage.tsx  # verification-only consumer path
	\- admin/
		\- useCourtSettings.ts     # existing settings source (no behavior change)
```

## Complexity Tracking

No constitution violations. No exceptions required.

---

## Phase 0 Research Summary

All clarifications resolved in [research.md](./research.md).

| Topic | Decision |
|---|---|
| Player-list post-close visibility | Booking rows are clamped to configured close boundary |
| Time precision | Use minute-precision close boundary; avoid hour-only rounding artifacts |
| Scope boundary | Player list only; admin list and calendar behavior unchanged |
| Settings fallback | Keep current default close behavior when settings unavailable |
| Data model impact | No DB schema/API changes |

---

## Phase 1 Design

### Key Design Decisions

**D1 - Reintroduce player booking end clamp in derivation**  
In `deriveSlotRows`, booking rows use:

```ts
const effectiveEnd = bookingEnd > scheduleEnd ? scheduleEnd : bookingEnd
```

This ensures all player-list rows satisfy `slotEnd <= scheduleEnd`.

**D2 - Preserve minute-precision close boundary input**  
Player list caller must pass close-boundary information in a form that preserves minute precision from `court_settings.court_close_time`. Design and tasking will ensure half-hour closing values do not leak as post-close rows.

**D3 - Keep admin/list parity changes from 016 isolated**  
Feature 017 intentionally applies only to player list rendering. Admin list retains current behavior and is treated as non-goal.

**D4 - Keep resiliency fallback path unchanged**  
If court settings are unavailable, derivation falls back to existing default close boundary and still renders rows.

### Files Expected to Change

| File | User Story | Planned Change |
|---|---|---|
| `src/features/players/calendar/deriveSlotRows.ts` | US1, US2 | Clamp booking row end to close boundary and preserve valid overlap filtering |
| `src/features/players/calendar/PlayerListView.tsx` | US1, US2 | Pass close-boundary input derived from settings while keeping fallback behavior |

### Post-Design Constitution Check

- [x] **I. Spec-First**: Design maps directly to US1/US2 and FR-001..FR-007.
- [x] **II. Type Safety**: No untyped boundaries introduced; derived row contract remains typed.
- [x] **III. Component Reusability**: UI component does not absorb new business logic.
- [x] **IV. Data Integrity & Security**: No data-model or permission expansion.
- [x] **V. Responsive Design**: No responsive regression risk introduced by logic-only updates.

---

## Phase 2 Implementation Strategy (Preview)

Implementation tasks will be generated in `/speckit.tasks` and ordered by user story:

1. US1: Enforce close-boundary cutoff in player list derivation.
2. US2: Validate precision + fallback behavior from settings source.
3. Polish: lint + manual QA using quickstart scenarios.

---

## Artifacts

- [research.md](./research.md)
- [data-model.md](./data-model.md)
- [contracts/player-list-endtime-contract.md](./contracts/player-list-endtime-contract.md)
- [quickstart.md](./quickstart.md)

