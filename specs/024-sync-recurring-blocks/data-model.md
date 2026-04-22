# Data Model: 024 - Sync Recurring Blocks

**Source**: `research.md` | **Date**: 2026-04-22

---

## Overview

No database schema changes. The feature introduces client-side derivation entities to ensure recurring unavailable blocks are represented equally in list and calendar views for both player and admin contexts.

---

## Entities

### 1. Recurring Unavailable Block (Existing)

Represents weekly repeated unavailability configured in admin settings.

| Field | Type | Notes |
|------|------|------|
| `id` | `string` | Primary identifier |
| `day_of_week` | `number` | 0-6 (Sun-Sat) |
| `start_time` | `string` | `HH:mm[:ss]` |
| `end_time` | `string` | `HH:mm[:ss]` |
| `label` | `string` | Display label |

Source: `useRecurringBlocks()` (`src/features/admin/useCourtSettings.ts`).

---

### 2. Synthetic Unavailable Segment (New Derivation Entity)

A non-persisted segment created by expanding recurring blocks for a specific date.

| Field | Type | Notes |
|------|------|------|
| `source` | `'recurring'` | Distinguishes synthetic rows |
| `segmentStart` | `Date` | Clamped within schedule window |
| `segmentEnd` | `Date` | Clamped and `> segmentStart` |
| `status` | `'UNAVAILABLE'` | Always unavailable |
| `label` | `string` | From recurring block label |
| `dayOfWeek` | `number` | Matched against date |

Lifecycle:
- Created during list derivation for active date.
- Not persisted to DB.
- Recomputed on date/range/settings changes.

---

### 3. Composed Availability Segment (New Derivation Output)

Unified interval stream used by list-row derivation after combining bookings and recurring synthetic segments.

| Field | Type | Notes |
|------|------|------|
| `segmentStart` | `Date` | Inclusive start |
| `segmentEnd` | `Date` | Exclusive end |
| `status` | `BookingStatus` | Includes `UNAVAILABLE` |
| `booking` | `Booking \| undefined` | Present for persisted booking segments |
| `source` | `'booking' \| 'recurring' \| 'gap'` | For precedence/debugging |
| `actionable` | `boolean` | False for unavailable segments |

Rules:
- Segments sorted ascending by `segmentStart`.
- No overlapping output segments with conflicting statuses.
- Booking segments take precedence over recurring synthetic segments on overlap.

---

### 4. List Row Representation (Existing, Extended Semantics)

Current row models remain:
- `SlotRowRepresentation` (player)
- `AdminListRow` (admin)

Extended behavior:
- Must include recurring-derived unavailable rows.
- Must preserve row/action semantics (`actionable=false` for unavailable).

---

## Relationships

1. `RecurringUnavailableBlock` + target `Date` + schedule window -> 0..n `SyntheticUnavailableSegment`
2. `Booking[]` + `SyntheticUnavailableSegment[]` -> `ComposedAvailabilitySegment[]`
3. `ComposedAvailabilitySegment[]` -> role-specific list rows

---

## Validation Rules

- `day_of_week` match required for recurring expansion.
- Segment clamp to schedule window (`court_open_time` to `court_close_time`).
- Reject/skip invalid intervals (`end <= start`).
- Ensure output parity between admin and player list for identical input schedule context.
- Ensure list output parity with calendar recurring visibility for same date.
- CANCELLED/NO_SHOW bookings yield AVAILABLE; recurring blocks must not override them (D7).
- AVAILABLE rows in final derive output are `durationMinutes === 60`, except a boundary-truncated final player row allowed by FR-014.
- When `recurringRules = []`, derive output must be structurally identical to pre-024 derivation (D9, FR-012).
- Recurring-block rows must have `actionable: false` (D10, FR-011).
- Player list rows must be clamped to configured schedule boundaries (FR-013, D11).
- If player final AVAILABLE slot crosses `scheduleEnd`, truncate row end to `scheduleEnd` (FR-014, D11).
- Derived list rows must never overlap; each row start must be `>=` previous row end (FR-015, D12).
- If overlap prevention leaves a short trailing AVAILABLE remainder, merge it into the previous contiguous AVAILABLE row (FR-015, D12).

---

## State Transitions

1. Admin creates/updates/deletes recurring block.
2. `recurring-blocks` query invalidates and refetches.
3. Calendar and list recompute availability composition.
4. Both views show updated unavailable intervals consistently.
