# Implementation Plan: Merge Booking Rows in Player Check Screen

**Branch**: `013-merge-booking-rows` | **Date**: 2026-04-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/013-merge-booking-rows/spec.md`

## Summary

Fix the player-facing list view so bookings are derived as exact chronological rows instead of hourly overlap buckets. Long bookings must render as one continuous row from start to end, and 30-minute bookings must be followed by the next available row starting at the exact booking end time. The technical approach is to replace the current hourly derivation in `deriveSlotRows.ts` with a cursor-walk algorithm and update `PlayerListView.tsx` to consume the richer row contract while preserving the existing visual style.

## Technical Context

**Language/Version**: TypeScript 6.0.2  
**Primary Dependencies**: React 19.2.4, date-fns 4.1.0 (`parseISO`, `setHours`, `setMinutes`, `addMinutes`), Tailwind CSS 3.4.17  
**Storage**: N/A — client-side display derivation only; existing booking query reused  
**Testing**: `npm run lint`; manual verification via public list view quickstart steps  
**Target Platform**: React SPA (Vite 8.0) for mobile/tablet/desktop browser use  
**Project Type**: Web application  
**Performance Goals**: Pure synchronous derivation over one day window; negligible runtime overhead  
**Constraints**: Public player view must remain read-only and privacy-safe; no player/admin data leakage; schedule window stays 06:00–22:00  
**Scale/Scope**: Two source files changed (`deriveSlotRows.ts`, `PlayerListView.tsx`); no schema or API changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before beginning implementation:

- [x] **I. Spec-First**: `specs/013-merge-booking-rows/spec.md` exists with two prioritized user stories and acceptance scenarios covering long-booking merge and 30-minute boundary accuracy.
- [x] **II. Type Safety**: No `any` types introduced. `SlotRowRepresentation` is expanded into a stronger typed row contract with explicit row type and exact interval fields.
- [x] **III. Component Reusability**: Business logic remains in `src/features/players/calendar/deriveSlotRows.ts`; `PlayerListView.tsx` stays a rendering component consuming derived rows.
- [x] **IV. Data Integrity & Security**: No new DB access, tables, or RLS changes. Public booking query remains sanitized and read-only.
- [x] **V. Responsive Design**: Existing mobile-safe list layout is preserved; only row time semantics change, so the screen continues to degrade gracefully across breakpoints.

If any gate cannot be satisfied, document an exception under "Constitution Exceptions" in this
plan before proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/013-merge-booking-rows/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── PlayerSlotRowContract.ts
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
└── features/
    └── players/
        └── calendar/
            ├── deriveSlotRows.ts   # MODIFIED — replace hourly overlap mapping with cursor-walk derivation
            └── PlayerListView.tsx  # MODIFIED — render merged booking rows and exact gap times
```

**Structure Decision**: Existing web application structure under `src/features/players/calendar/` is retained. The feature is limited to the player list derivation and renderer.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|

## Implementation Detail

### `src/features/players/calendar/deriveSlotRows.ts` (MODIFIED)

- Expand the row contract to represent exact intervals rather than hour buckets.
- Replace the `for (hour = 6; hour < 22; hour++)` overlap scan with a cursor-walk algorithm modeled on the proven admin derivation approach, but scoped to the player view.
- Emit:
  - one booking row per booking record using exact `start_time → end_time`
  - hourly available rows where a full hour fits
  - partial available rows where a booking starts or ends on a 30-minute boundary
- Preserve schedule bounds at 06:00–22:00.

### `src/features/players/calendar/PlayerListView.tsx` (MODIFIED)

- Continue rendering a simple read-only list using the existing status color system.
- Consume the richer derived row model and keep time labels based on exact `slotStart` and `slotEnd`.
- Preserve the current public, read-only interaction model and accessibility affordances.

## Constitution Exceptions

None.
