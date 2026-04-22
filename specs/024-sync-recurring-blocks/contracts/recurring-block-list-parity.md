# Contract: Recurring Block List Parity

**Feature**: 024-sync-recurring-blocks
**Type**: UI/Data Derivation Contract (internal)

## Purpose

Define required parity behavior for recurring unavailable block rendering between:
- Player calendar vs player list
- Admin calendar vs admin list

## Inputs

- `date`: active day for list derivation
- `bookings`: booking records from existing booking query
- `recurringBlocks`: recurring rules from `useRecurringBlocks()`
- `scheduleWindow`: open/close boundaries from court settings

## Output Contract

List derivation output MUST include unavailable segments representing recurring blocks that apply to the active date.

```ts
interface RecurringParityRow {
  slotStart: Date
  slotEnd: Date
  status: 'UNAVAILABLE'
  source: 'recurring' | 'booking'
  actionable: false
}
```

## Invariants

1. For any recurring block visible in calendar on date D, a corresponding unavailable interval must exist in list output on date D.
2. List output must not contain overlapping contradictory statuses for same interval.
3. Booking-derived unavailable and recurring-derived unavailable must share same user-visible status label (`Unavailable`).
4. Day-of-week matching uses local date context and recurring `day_of_week` (0-6).

## Precedence Rules

1. CONFIRMED, PENDING, UNAVAILABLE booking intervals are authoritative when overlapping recurring synthetic intervals.
2. CANCELLED or NO_SHOW booking intervals restore the slot to AVAILABLE; recurring blocks are suppressed for those sub-intervals (FR-007 / D7).
3. Synthetic recurring intervals fill only uncovered schedule intervals (no active blocking booking).
4. Gap rows (`AVAILABLE`) may not overlap any CONFIRMED/PENDING/UNAVAILABLE interval.
5. All AVAILABLE list rows must have `durationMinutes === 60`, except the final player boundary-clamped row which may be shorter due to FR-014.
6. Player list rows must remain fully inside configured schedule window boundaries (FR-013).

## Error Handling

- Invalid recurring rule (`end <= start`) MUST be skipped.
- Out-of-window intervals MUST be clamped or skipped.
- Null/empty recurring list MUST still return valid booking/gap rows.

## Acceptance Notes (Implemented)

- Player flow now injects recurring rules into list derivation from `PublicCalendarPage`.
- Admin flow now injects recurring rules into list derivation from `AdminCalendarPage`.
- Both list derivations consume a shared composition path to prevent cross-role drift.
- Boundary handling now uses the same schedule-window helper for both roles.

## Non-goals

- No schema changes.
- No visual redesign.
- No new role-specific business rules.
