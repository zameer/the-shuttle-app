# Quickstart: Player List End-Time Enforcement

Feature: 017 - Player list should not show beyond end time
Branch: 017-create-feature-branch

## Goal

Ensure player list view strictly stops at configured court close time (including minute precision) to satisfy residential-area operating limits.

## Planned File Touch Points

Primary:
- src/features/players/calendar/deriveSlotRows.ts
- src/features/players/calendar/PlayerListView.tsx

Potential supporting checks:
- src/features/players/PublicCalendarPage.tsx (consumer behavior verification only)

## Manual Validation Steps

### US1: Hard stop at close boundary

1. Set court close time to a value with minutes (example: 22:30:00).
2. Open player list view for a date with late bookings.
3. Confirm no row label ends beyond 10:30 PM.

### US1: Boundary-overlapping booking clamp

1. Ensure a booking exists that runs across close boundary (example: 21:30-23:00).
2. Open player list view on that date.
3. Confirm visible booking row ends at configured close boundary.

### US1: Post-close booking exclusion

1. Ensure a booking starts at/after close boundary (example: 22:45-23:30, close 22:30).
2. Open player list view.
3. Confirm booking row is not shown.

### US2: Fallback safety

1. Simulate settings unavailability (or force query failure in dev).
2. Open player list view.
3. Confirm list still renders using default boundary without crash.

## Regression Checks

1. Verify in-window bookings remain unchanged.
2. Verify available rows still respect past-date suppression.
3. Verify admin list behavior remains unchanged (out of scope).

## Quality Gate

Run before completion:
- npm run lint

Suggested focused lint:
- npx eslint src/features/players/calendar/deriveSlotRows.ts src/features/players/calendar/PlayerListView.tsx
