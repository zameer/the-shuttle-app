# Implementation Plan: Sync Recurring Blocks

**Branch**: `[024-setup-specify-invocation]` | **Date**: 2026-04-22 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/024-sync-recurring-blocks/spec.md`

## Summary

Implement overlap-safe list derivation parity for recurring blocks across player and admin flows. Existing shared composition remains the canonical source of truth; derive consumers now expand gap segments without crossing blocking booking boundaries and merge short 30-minute truncation remainders into the previous AVAILABLE row. This closes the visible overlap defect while preserving clarified behavior for CANCELLED/NO_SHOW precedence and schedule boundary clamping.

## Technical Context

**Language/Version**: TypeScript 6.0.2, React 19.2.4  
**Primary Dependencies**: Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, Supabase JS 2.103.0, date-fns 4.1.0, lucide-react 1.8  
**Storage**: Supabase PostgreSQL (existing `bookings`, `court_settings`, `recurring_unavailable_blocks`)  
**Testing**: `npm run lint`, targeted `eslint` on touched files, `npx tsc --noEmit`, manual list/calendar parity walkthrough  
**Target Platform**: Modern mobile and desktop browsers  
**Project Type**: Single-project React SPA  
**Performance Goals**: No perceptible regressions in list-row generation during date navigation  
**Constraints**: No schema changes, strict TypeScript, preserve existing row-shape contracts for list components  
**Scale/Scope**: `src/features/calendar/availability/`, `src/features/players/calendar/`, `src/features/admin/calendar/`, and 024 feature docs/contracts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/024-sync-recurring-blocks/spec.md` exists with prioritized stories and clarified FR-015 overlap behavior.
- [x] **II. Type Safety**: Plan introduces no `any`; existing typed derivation interfaces are preserved.
- [x] **III. Component Reusability**: Business logic remains in derivation utilities; list UI components remain presentation-focused.
- [x] **IV. Data Integrity & Security**: No DB/RLS changes; existing authenticated data access patterns remain unchanged.
- [x] **V. Responsive Design**: No visual redesign; behavior remains consistent across supported breakpoints.

### Post-Design Constitution Re-Check

- [x] **I. Spec-First**: Research/data-model/contracts/quickstart map to FR-001 through FR-015.
- [x] **II. Type Safety**: Slot merge rules are represented as explicit typed segment transformations.
- [x] **III. Component Reusability**: Player/admin derive functions share consistent post-processing intent.
- [x] **IV. Data Integrity & Security**: Availability derivation remains client-display logic only.
- [x] **V. Responsive Design**: No responsive regressions introduced by derivation-only changes.

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
|   |       |-- types.ts
|   |       `-- index.ts
|   |-- players/
|   |   |-- PublicCalendarPage.tsx
|   |   `-- calendar/
|   |       |-- PlayerListView.tsx
|   |       `-- deriveSlotRows.ts
|   `-- admin/
|       |-- AdminCalendarPage.tsx
|       |-- AdminListView.tsx
|       `-- calendar/
|           `-- deriveAdminListRows.ts
```

**Structure Decision**: Keep the existing single-project structure and implement overlap-merge behavior in derive-level post-processing while preserving shared composition contracts.

## Phase 0 Research Deliverables

- Capture explicit overlap-prevention decision and merge rule rationale (FR-015).
- Confirm precedence interactions with existing D7-D11 decisions.

## Phase 1 Design Deliverables

- Update `data-model.md` validation rules for overlap-free merged rows.
- Update contracts:
  - `contracts/list-derivation-composition.md`
  - `contracts/recurring-block-list-parity.md`
- Extend `quickstart.md` regression checklist and validation log for FR-015 scenarios.

## Current Touched-File Scope

- `src/features/players/calendar/deriveSlotRows.ts`
- `src/features/admin/calendar/deriveAdminListRows.ts`
- `src/features/calendar/availability/index.ts`
- `src/features/players/PublicCalendarPage.tsx`
- `src/features/players/calendar/PlayerListView.tsx`
- `src/features/admin/AdminCalendarPage.tsx`
- `src/features/admin/AdminListView.tsx`
- `specs/024-sync-recurring-blocks/research.md`
- `specs/024-sync-recurring-blocks/data-model.md`
- `specs/024-sync-recurring-blocks/contracts/list-derivation-composition.md`
- `specs/024-sync-recurring-blocks/contracts/recurring-block-list-parity.md`
- `specs/024-sync-recurring-blocks/quickstart.md`
- `specs/024-sync-recurring-blocks/tasks.md`

## Complexity Tracking

No constitution violations or exception requests identified.
