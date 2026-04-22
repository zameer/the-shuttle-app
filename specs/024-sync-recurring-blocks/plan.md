# Implementation Plan: Sync Recurring Blocks

**Branch**: `[024-setup-specify-invocation]` | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/024-sync-recurring-blocks/spec.md`

## Summary

Restore and harden recurring-block parity between calendar and list views for both roles, while preserving legacy list behavior and adding strict player-window boundaries. The technical approach keeps a shared availability composition utility, then applies role-aware list-slot post-processing: recurring rows remain non-actionable, CANCELLED/NO_SHOW intervals resolve to AVAILABLE, and player list rows are clamped to schedule start/end with final-slot truncation at end boundary.

## Technical Context

**Language/Version**: TypeScript 6.0.2, React 19.2.4  
**Primary Dependencies**: Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, Supabase JS 2.103.0, date-fns 4.1.0, lucide-react 1.8  
**Storage**: Supabase PostgreSQL (existing `bookings`, `court_settings`, `recurring_unavailable_blocks`)  
**Testing**: `npm run lint`, targeted ESLint on touched files, `npx tsc --noEmit`, manual parity checks in player/admin list + calendar  
**Target Platform**: Modern desktop/mobile browsers for player/admin SPA views  
**Project Type**: Single-project React web app (SPA)  
**Performance Goals**: Preserve current list derivation responsiveness; no visible regressions in list render speed across 14-day navigation windows  
**Constraints**: No schema changes, strict TypeScript, preserve existing list row shapes, player list slots must never render outside schedule bounds  
**Scale/Scope**: Availability composition and list-derivation paths in `src/features/calendar/availability/`, `src/features/players/calendar/`, and `src/features/admin/calendar/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/024-sync-recurring-blocks/spec.md` exists with prioritized stories, edge cases, and clarification log including FR-013/FR-014.
- [x] **II. Type Safety**: No `any` introduced; composition and row contracts remain explicit TypeScript interfaces/unions.
- [x] **III. Component Reusability**: Business logic stays in derivation utilities/hooks, not list UI components.
- [x] **IV. Data Integrity & Security**: Existing Supabase RLS model preserved; no client-side security relaxation and no schema migration.
- [x] **V. Responsive Design**: Calendar/list parity remains across player/admin mobile and desktop layouts; no responsive contract regression introduced.

### Post-Design Constitution Re-Check

- [x] **I. Spec-First**: Research and contracts map directly to FR-001 through FR-014.
- [x] **II. Type Safety**: Data model and contracts define typed precedence and boundary-clamping behavior.
- [x] **III. Component Reusability**: Slot-boundary handling is defined as derivation behavior, preserving UI separation.
- [x] **IV. Data Integrity & Security**: Changes are display-layer only, with unchanged auth/RLS boundaries.
- [x] **V. Responsive Design**: Quickstart includes parity checks for both roles and boundary behavior on player list views.

## Project Structure

### Documentation (this feature)

```text
specs/024-sync-recurring-blocks/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- list-derivation-composition.md
|   `-- recurring-block-list-parity.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- features/
|   |-- calendar/
|   |   `-- availability/
|   |       |-- composeAvailabilitySegments.ts
|   |       |-- scheduleWindow.ts
|   |       `-- types.ts
|   |-- players/
|   |   |-- PublicCalendarPage.tsx
|   |   `-- calendar/
|   |       `-- deriveSlotRows.ts
|   `-- admin/
|       |-- AdminCalendarPage.tsx
|       `-- calendar/
|           `-- deriveAdminListRows.ts
`-- components/
    `-- shared/
```

**Structure Decision**: Keep the current single-project SPA structure and centralize parity logic in shared availability utilities, while allowing role-specific post-processing in each list derivation function.

## Phase 0 Research Deliverables

- `research.md` updated with boundary-clamping and truncation decisions for strict player list behavior.
- Precedence model reaffirmed: blocking booking statuses, CANCELLED/NO_SHOW override, recurring fill, then gap.
- Regression safety rules captured for empty `recurringRules` and non-actionable recurring rows.

## Phase 1 Design Deliverables

- `data-model.md` updated with player-boundary-clamped slot semantics and final-slot truncation rule.
- Contracts updated:
  - `contracts/list-derivation-composition.md`
  - `contracts/recurring-block-list-parity.md`
- `quickstart.md` updated with explicit validation for FR-013/FR-014 boundary behavior.

## Phase 2 Implementation Preview (for /speckit.tasks)

1. Add/adjust role-aware gap expansion helper behavior in player list derivation to enforce start/end boundaries and truncation.
2. Confirm admin list derivation remains parity-safe without introducing player-only boundary side effects.
3. Validate CANCELLED/NO_SHOW precedence still holds with clamped/truncated player slots.
4. Re-run lint/type-check and manual parity checks for edge windows.

## Current Touched-File Scope

- `src/features/calendar/availability/composeAvailabilitySegments.ts`
- `src/features/calendar/availability/scheduleWindow.ts`
- `src/features/calendar/availability/types.ts`
- `src/features/calendar/availability/index.ts`
- `src/features/players/PublicCalendarPage.tsx`
- `src/features/players/calendar/PlayerListView.tsx`
- `src/features/players/calendar/deriveSlotRows.ts`
- `src/features/admin/AdminCalendarPage.tsx`
- `src/features/admin/AdminListView.tsx`
- `src/features/admin/calendar/deriveAdminListRows.ts`

## Implementation Status (2026-04-22)

- Shared composition and recurring wiring are implemented in both player and admin flows.
- Player list boundary enforcement and end-boundary truncation (FR-013, FR-014) are implemented in `deriveSlotRows.ts`.

## Complexity Tracking

No constitution violations or exception requests identified.
