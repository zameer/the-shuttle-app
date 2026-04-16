# Data Model: Mobile-Friendly Calendar List Toggle

## Overview

This feature introduces UI-level data models only. No new database tables or migrations are required.

## Entity: ViewModePreference

- Description: Current display preference for the player schedule presentation.
- Type: Union string literal
- Values:
  - `calendar`
  - `list`
- Owner: `PublicCalendarPage`
- Lifecycle:
  - Initialized on page load (**default `list`** — FR-002 mandates list as the initial state)
  - Updated by view toggle interactions
  - Preserved while user remains on page and switches date/granularity

### Validation Rules

- Must always be one of the allowed values.
- Invalid values must be impossible at compile time via TypeScript union.

## Entity: SlotRowRepresentation

- Description: Normalized row displayed in list mode for a given timeslot.
- Purpose: Keep list mode behavior equivalent to calendar status semantics.

### Proposed Type

```ts
interface SlotRowRepresentation {
  slotStart: Date
  slotEnd: Date
  status: 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'
  booking?: Booking
  actionable: boolean
}
```

### Derivation Rules

- Derived from existing booking collection already fetched for calendar.
- Time range uses same visible schedule window as current calendar (hourly rows).
- `actionable` is false for unavailable rows and true for selectable rows.

## Entity: RulesBannerActionSet

- Description: Available interactions inside rules banner.
- Change in this feature: remove dedicated `view_full_rules_link` action.
- Remaining actions:
  - `chip_open_rules_modal`

## State Transitions

## ViewModePreference transitions

1. `calendar` -> `list` when player activates list toggle.
2. `list` -> `calendar` when player activates calendar toggle.
3. Any transition preserves currently selected date context.

## SlotRowRepresentation transitions

1. Derived rows recompute when selected date/range changes.
2. Derived rows recompute when booking query data updates.
3. Status transitions follow existing booking state changes only (no new state machine).
