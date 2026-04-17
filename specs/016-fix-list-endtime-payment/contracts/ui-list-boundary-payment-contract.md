# UI Contract: List Boundary and Admin Payment Status

Feature: 016 - Fix list end boundary and payment status visibility

## 1. Surfaces

Primary:
- src/features/players/calendar/deriveSlotRows.ts
- src/features/admin/calendar/deriveAdminListRows.ts
- src/features/admin/AdminListView.tsx

Supporting:
- src/features/booking/paymentStatus.ts
- src/components/shared/calendar/CalendarSlot.tsx (reference parity pattern)

## 2. List Boundary Contract

- List derivation MUST keep schedule window constants for available rows.
- Booking rows overlapping end boundary MUST remain visible and not be truncated incorrectly.
- Player and admin list derivation MUST apply equivalent boundary behavior.

## 3. List vs Calendar Consistency Contract

- For boundary-overlapping bookings, list and calendar MUST represent booking presence consistently for the same date context.
- Boundary fix MUST NOT alter behavior for non-overlapping in-window bookings.

## 4. Admin Payment Status Contract

- Admin list MUST render payment status for booking rows.
- Payment status MUST be derived via existing payment-status normalization/label helpers.
- Available rows MUST NOT render payment status indicators.

## 5. Accessibility/Readability Contract

- Payment indicator in admin list rows MUST be visually distinguishable for PAID vs PENDING states.
- Row content density MUST remain readable on mobile and desktop breakpoints.

## 6. Failure/Unknown-State Contract

- Unknown or missing payment state MUST fall back to an explicit neutral indicator rather than blank output.
- If payment status utility receives unrecognized input, UI MUST still render stable output using fallback semantics.
