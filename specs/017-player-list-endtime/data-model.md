# Data Model: Player List End-Time Enforcement

Feature: 017 - Player list end boundary compliance
Branch: 017-create-feature-branch
Date: 2026-04-17

## 1. Scope

No database schema changes. This feature adjusts client-side derivation and rendering boundaries for player list view.

## 2. Entities

### 2.1 PlayerListTimeWindow

Represents the daily display window used by player list derivation.

Fields:
- scheduleStart: Date (current default start of day window, 06:00)
- scheduleEnd: Date (configured close boundary, minute-precision)
- slotStepMinutes: number (existing 60)

Rules:
- All generated rows must satisfy row.slotEnd <= scheduleEnd.
- Available rows must not be emitted beyond scheduleEnd.

### 2.2 BoundaryOverlappingBookingSegment

Represents the in-window visible segment of a booking that crosses close boundary.

Fields:
- bookingStart: Date
- bookingEnd: Date
- effectiveStart: Date
- effectiveEnd: Date

Rules:
- effectiveStart = max(bookingStart, scheduleStart)
- effectiveEnd = min(bookingEnd, scheduleEnd)
- Segment is emitted only if effectiveEnd > effectiveStart.

### 2.3 PlayerListRow

Represents output row consumed by PlayerListView.

Fields:
- type: 'booking' | 'available'
- slotStart: Date
- slotEnd: Date
- durationMinutes: number
- status: 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE' | 'CANCELLED' | 'NO_SHOW'
- booking: Booking | undefined
- actionable: boolean

Rules:
- Booking rows starting at/after scheduleEnd are excluded.
- Duration is always positive and derived from slotStart/slotEnd.

## 3. Relationships

- PlayerListView derives settings boundary from court_settings and passes it into deriveSlotRows.
- deriveSlotRows emits PlayerListRow[] constrained by PlayerListTimeWindow.
- PublicCalendarPage and any player-list consumers inherit this bounded output via PlayerListView.

## 4. Validation Constraints

- Minute precision boundary must be respected (e.g., 22:30 is not rounded to 23:00 for row end).
- Rows must remain sorted chronologically.
- Past-date suppression for available rows remains unchanged.

## 5. Security and Integrity Notes

- No new data persistence.
- No auth/RLS changes.
- Compliance behavior is display-layer only and limited to player list scope.
