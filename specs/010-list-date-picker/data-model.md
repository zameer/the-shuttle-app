# Data Model: Player List View Date Picker

## Overview

This feature introduces UI-level state and component models only. No new database tables or migrations are required.

## Entity: SelectedDate

- **Description**: The calendar date controlling which day's slot rows are displayed in list view. Shared with the calendar view's `currentDate` state — a single source of truth.
- **Type**: `Date` (JavaScript `Date` object, time components irrelevant — only the calendar date matters)
- **Owner**: `PublicCalendarPage` (lifted state, passed to both `ListDateNav` and `PlayerListView`)
- **Lifecycle**:
  - Initialized to `new Date()` (today) on page load — satisfies FR-002
  - Updated by `ListDateNav` via `onChange` callback (date picker selection or prev/next buttons)
  - Preserved when player switches between list and calendar display modes — satisfies FR-005
  - Used to compute `startDate` / `endDate` query bounds when `displayMode === 'list'`

### Validation Rules

- Date is always a valid `Date` object; if `input[type=date]` produces an invalid string, fallback to `new Date()` (today)
- No business-level restrictions on date range (past or future dates are allowed per spec assumptions)

---

## Entity: ListDateQueryRange

- **Description**: The derived date-range passed to `usePublicBookings` when the player is in list mode.
- **Type**: Computed — not stored; derived in the existing `useMemo` inside `PublicCalendarPage`
- **Derivation**:
  - `displayMode === 'list'` → `{ startDate: startOfDay(currentDate), endDate: endOfDay(currentDate) }`
  - `displayMode === 'calendar'` → existing week/month logic (unchanged)

### Why this matters

Previously, the query always spanned a full week or month. In list mode the slot rows represent a single day, so over-fetching wastes bandwidth on mobile — the primary target platform.

---

## Entity: ListDateNavProps (Component Interface)

- **Description**: Controlled props for the date navigation bar component.

### Type

```ts
interface ListDateNavProps {
  value: Date
  onChange: (date: Date) => void
}
```

### Behaviour

- `value` drives the formatted label display (FR-007) and the `input[type=date]` value attribute.
- `onChange` is called with `addDays(value, -1)` (prev) or `addDays(value, 1)` (next) or a parsed date from the picker input.

---

## State Transitions

### SelectedDate transitions

1. Page load → initialized to `new Date()` (today)
2. Player selects date in picker → `onChange(parsedDate)` updates `currentDate`
3. Player taps previous day → `onChange(addDays(currentDate, -1))`
4. Player taps next day → `onChange(addDays(currentDate, 1))`
5. Player switches to calendar mode → `currentDate` unchanged; calendar renders with same date
6. Player switches back to list mode → `currentDate` unchanged; list renders same date
