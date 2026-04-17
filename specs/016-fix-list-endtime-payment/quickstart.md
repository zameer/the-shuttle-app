# Quickstart: List End-Time and Admin Payment Status

Feature: 016 - Fix list end boundary and payment status visibility  
Branch: 016-setup-feature-branch

## Goal

Resolve three list-view issues:
- remove 30-minute end-boundary shortfall perception in list views;
- ensure bookings beyond nominal end remain correctly visible in list parity with calendar;
- show payment status on admin booking list rows.

## Planned File Touch Points

Primary:
- src/features/players/calendar/deriveSlotRows.ts
- src/features/admin/calendar/deriveAdminListRows.ts
- src/features/admin/AdminListView.tsx

Supporting:
- src/features/booking/paymentStatus.ts
- src/components/shared/calendar/CalendarSlot.tsx

## Implementation Outline

1. Correct booking end-boundary handling in both list derivation functions.
2. Keep existing schedule window constants for available rows.
3. Add payment status indicator rendering to admin booking rows.
4. Reuse existing payment status normalization and label helpers.
5. Verify list/calendar parity for boundary-overlapping bookings.

## Manual Validation Steps

### US1: End-time window alignment

1. Open player and admin list view for the same date.
2. Compare final visible boundary behavior.
3. Confirm no 30-minute shortfall in row derivation output.

### US2: Boundary-overlap booking parity

1. Use a booking whose end time crosses the nominal end boundary.
2. Open list view and calendar view for the same date.
3. Confirm booking remains visible in list and matches calendar presence.

### US3: Admin payment status visibility

1. Open admin list view on a date with mixed payment states.
2. Confirm booking rows show payment status indicators.
3. Confirm available rows do not show payment labels.
4. Confirm unknown/missing payment states render a fallback indicator.

## Quality Gate

Run before completion:
- npm run lint

Suggested focused check:
- npx eslint src/features/players/calendar/deriveSlotRows.ts src/features/admin/calendar/deriveAdminListRows.ts src/features/admin/AdminListView.tsx

## Expected Outcome

- List and calendar remain consistent near end boundary.
- Booking visibility is preserved for boundary-overlapping entries.
- Admins can scan payment states directly from list rows.
