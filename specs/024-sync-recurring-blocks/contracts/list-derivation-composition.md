# Contract: List Derivation Composition Interface

**Feature**: 024-sync-recurring-blocks
**Type**: Internal TypeScript contract

## Purpose

Standardize composition API that integrates recurring blocks into list row derivation for both player and admin flows.

## Proposed Interface

```ts
export interface DerivationScheduleWindow {
  scheduleStart: Date
  scheduleEnd: Date
}

export interface RecurringRuleInput {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  label: string
}

export interface ComposedSegment {
  segmentStart: Date
  segmentEnd: Date
  status: 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE' | 'CANCELLED' | 'NO_SHOW'
  source: 'gap' | 'booking' | 'recurring'
  booking?: Booking
  actionable: boolean
}

export interface ComposeAvailabilityInput {
  date: Date
  bookings: Booking[]
  recurringRules: RecurringRuleInput[]
  window: DerivationScheduleWindow
}

export type ComposeAvailability = (input: ComposeAvailabilityInput) => ComposedSegment[]
```

## Behavioral Guarantees

1. Returned segments are sorted by `segmentStart` ascending.
2. Returned segments are non-overlapping and contiguous within practical window coverage.
3. Segments with `status === 'UNAVAILABLE'` have `actionable === false`.
4. Recurring rules only apply when `day_of_week` matches `date.getDay()`.
5. CANCELLED and NO_SHOW booking intervals yield `status: 'AVAILABLE'`, `source: 'gap'` — recurring blocks are not applied to these sub-intervals (D7).
6. AVAILABLE gap segments from `composeAvailabilitySegments` must be expanded to 60-minute slots by derive consumers before emitting list rows (D8, FR-009, FR-010).
7. Player derive consumers must clamp emitted slots to configured schedule start/end boundaries; no player row may render outside window (FR-013, D11).
8. Player derive consumers must truncate the final AVAILABLE slot at schedule end when a 60-minute expansion crosses boundary (FR-014, D11).

## Consumers

- Player list derivation (`src/features/players/calendar/deriveSlotRows.ts`) via direct composition call.
- Admin list derivation (`src/features/admin/calendar/deriveAdminListRows.ts`) via direct composition call.

## Implemented Invariants

1. Shared schedule window generation is centralized via `createScheduleWindow`.
2. Interval precedence is enforced in `composeAvailabilitySegments`: CONFIRMED/PENDING/UNAVAILABLE booking first, CANCELLED/NO_SHOW booking yields AVAILABLE (D7), recurring second, gap last.
3. Invalid recurring rules (`end <= start`) and out-of-window intervals are skipped by clamping logic.
4. Adjacent segments with identical status/source are merged to avoid duplicate visual rows.
5. Derive consumers (`deriveSlotRows`, `deriveAdminListRows`) apply `expandGapTo60MinSlots` post-processing; player flow additionally clamps/truncates boundary-crossing final rows per FR-013/FR-014.

## Compatibility Notes

- Existing row output shapes remain unchanged for `PlayerListView` and `AdminListView` consumers.
- This contract is additive and internal; no API or DB contract changes.
