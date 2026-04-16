# Feature Specification: Merge Booking Rows in Player Check Screen

**Feature Branch**: `013-merge-booking-rows`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "Player booking check screen not showing properly with more than one hour booking, it should be merged and show as one row. any 30 mins booking should generate next hours accurately"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Long Bookings as One Continuous Row (Priority: P1)

As a player checking court availability, I want a booking longer than 1 hour to appear as one continuous row showing its full time range so I can understand at a glance how long the court is reserved.

**Why this priority**: This is the core display defect. When a long booking is split into multiple rows, players misread availability and may think a reserved period has gaps.

**Independent Test**: Open the player booking check screen for a day containing a 90-minute booking and a 150-minute booking. Confirm each booking appears as exactly one row with its full start and end time.

**Acceptance Scenarios**:

1. **Given** a booking longer than 1 hour exists, **When** the player views the booking check screen, **Then** that booking is displayed as one row covering its full reserved period.
2. **Given** a 90-minute booking exists, **When** the player views the booking check screen, **Then** it is not split into separate hourly rows.
3. **Given** a 150-minute booking exists, **When** the player views the booking check screen, **Then** it is not split into separate rows and its full reserved time range is visible.

---

### User Story 2 - Show Accurate Availability Around 30-Minute Bookings (Priority: P1)

As a player checking availability, I want 30-minute bookings to adjust the following available time correctly so the schedule does not imply the court is open or reserved for the wrong period.

**Why this priority**: Short bookings expose boundary errors most clearly. If the next displayed time block is wrong after a 30-minute booking, players receive incorrect availability information.

**Independent Test**: Open the player booking check screen for a day containing a 30-minute booking. Confirm the booking is shown once and the next available time begins exactly when that booking ends.

**Acceptance Scenarios**:

1. **Given** a 30-minute booking exists from 8:00 AM to 8:30 AM, **When** the player views the booking check screen, **Then** the booking appears as one row and the next displayed available period begins at 8:30 AM.
2. **Given** a 30-minute booking exists between longer free periods, **When** the player views the booking check screen, **Then** no extra reserved time is shown before or after that booking.
3. **Given** multiple bookings of different lengths exist on the same day, **When** the player views the booking check screen, **Then** the displayed rows remain in chronological order with no missing or duplicated time.

### Edge Cases

- When two bookings touch back-to-back with no gap, they appear as separate booking rows with no available row between them.
- When a booking starts or ends on a 30-minute boundary, the next displayed row begins exactly at that boundary.
- When a day has only short bookings, all remaining open time is still shown in the correct chronological position.
- When a booking spans multiple hours and crosses midday or evening boundaries, it still appears as one row.
- When there are no bookings for the selected date, the booking check screen continues to show the normal fully available schedule.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The player booking check screen MUST display each booking as a single row covering its exact start and end time, regardless of duration.
- **FR-002**: A booking longer than 1 hour MUST NOT be split into multiple rows.
- **FR-003**: A 30-minute booking MUST be shown as one row covering exactly its reserved period.
- **FR-004**: After a 30-minute booking ends, the next displayed time period MUST begin exactly at the booking end time.
- **FR-005**: The displayed schedule MUST preserve chronological order with no duplicated, missing, or overlapping time segments.
- **FR-006**: Existing booking status cues for reserved or unavailable periods MUST remain visible after rows are merged.

### Key Entities *(include if feature involves data)*

- **Booking Display Row**: A visible row in the player booking check screen representing one reserved period from its exact start time to exact end time.
- **Available Display Row**: A visible row representing open time between bookings, beginning exactly when the previous booking ends.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In QA validation, 100% of bookings longer than 1 hour appear as exactly one row on the player booking check screen.
- **SC-002**: In QA validation, 100% of 30-minute bookings are followed by the next displayed time period beginning at the correct booking end time.
- **SC-003**: Across mixed-duration booking test cases, 0 duplicated or missing time intervals are observed in the displayed schedule.
- **SC-004**: Test users can correctly identify the full reserved duration of a booking longer than 1 hour within 3 seconds in at least 95% of observed sessions.

## Assumptions

- This request applies to the player-facing booking check screen, not the admin booking list.
- The screen already displays booking and available rows; this feature changes how those rows are grouped and ordered.
- Booking durations may include 30-minute increments, and those increments must remain accurately represented.
- No new filters, permissions, or persistent user preferences are required.