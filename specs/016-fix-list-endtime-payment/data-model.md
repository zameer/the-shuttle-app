# Data Model: List End-Time and Payment Visibility

Feature: 016 - Fix list end boundary and payment status visibility  
Branch: 016-setup-feature-branch  
Date: 2026-04-17

## 1. Scope

This feature introduces no database schema changes. It updates client-side derivation and row presentation behavior.

## 2. Entities

### 2.1 ListViewTimeWindow

Represents the visible daily list derivation window.

Fields:
- scheduleStart: Date (existing default 06:00)
- scheduleEnd: Date (existing default 22:00)
- slotStepMinutes: number (existing 60)

Rules:
- Window constants remain unchanged for available-row generation.
- Booking visibility must not be incorrectly truncated due to clamping.

### 2.2 BoundaryOverlappingBooking

Represents bookings with end time beyond scheduleEnd while still relevant to date context.

Fields:
- bookingStart: Date
- bookingEnd: Date
- effectiveDisplayStart: Date
- effectiveDisplayEnd: Date

Rules:
- Booking must remain visible in list output when overlapping boundary.
- Effective display end should preserve real booking end for booking rows.

### 2.3 AdminBookingListRow

Represents an admin list row output from derivation.

Fields:
- type: 'booking' | 'available'
- slotStart: Date
- slotEnd: Date
- durationMinutes: number
- status: BookingStatusWithAvailable
- booking: Booking | undefined
- playerName: string | null | undefined
- paymentStatusIndicator: NormalizedPaymentStatus | undefined

Rules:
- Payment indicator applies only to booking rows.
- Available rows must not display payment status.

### 2.4 PaymentStatusIndicator

Represents normalized payment status shown in admin booking rows.

Values:
- PAID
- PENDING
- UNPAID
- UNKNOWN

Rules:
- Derived via existing normalizePaymentStatus utility.
- Label/variant must follow existing payment status helper functions.

## 3. Relationships

- deriveSlotRows(date, bookings) consumes Booking[] and outputs player-facing SlotRowRepresentation[].
- deriveAdminListRows(date, bookings) consumes Booking[] and outputs AdminListRow[].
- AdminListView consumes AdminListRow[] and renders payment status only when row.type === 'booking'.

## 4. State/Transition Notes

- No new persisted state.
- Existing query invalidation and booking updates remain unchanged.
- Behavior change is deterministic in derivation + render mapping.

## 5. Validation Constraints

- End-boundary booking parity: list and calendar must both represent overlapping bookings.
- End boundary non-regression: regular in-window bookings remain unchanged.
- Payment visibility: admin list booking rows always show payment indicator with fallback for unknown.

## 6. Integrity/Security Notes

- No RLS/auth changes.
- Admin-only payment status visibility remains in admin list surface.
- No new data write path introduced.
