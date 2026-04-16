# Feature Specification: Admin List Hourly Available Slot Display

**Feature Branch**: `012-set-list-default`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "Admin list Available slot 30 mins break down not required, hourly showing is sufficient but reserved show from to time in one single row"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Available Slots as Hourly Blocks (Priority: P1)

As an admin reviewing the day's schedule in list view, I want available time slots to display as 1-hour blocks so I can scan the day's open availability without wading through excessive rows.

**Why this priority**: This directly addresses the clutter caused by 30-minute granularity. Halving the number of available-slot rows makes the list significantly easier to read, particularly on mobile screens.

**Independent Test**: Open the admin booking page, switch to list view for a day with no bookings. Confirm exactly 16 rows are shown (06:00–22:00 in 1-hour increments), not 32.

**Acceptance Scenarios**:

1. **Given** the admin is in list view on a day with no bookings, **When** the list renders, **Then** available slots are displayed as 1-hour blocks from 06:00 to 22:00.
2. **Given** the admin is in list view on a day where a booking ends at a non-hour boundary, **When** the list renders, **Then** available slots before and after the booking fill to the nearest hour boundary without leaving gaps.
3. **Given** the admin is in list view, **When** scrolling the day schedule, **Then** the number of visible available-slot rows is no more than 16 for a day with zero bookings.

---

### User Story 2 - Reserved Bookings Stay as a Single Merged Row (Priority: P1)

As an admin, I want each reserved or pending booking to appear as one row showing its exact start-to-end time, regardless of how many hours it spans, so the booking is easy to identify and act on.

**Why this priority**: A 90-minute or 2.5-hour booking that splits into multiple rows is confusing and makes it harder to find the action button. Single-row representation is essential for usability.

**Independent Test**: Create bookings of 30 min, 1 hour, 1.5 hours, and 2.5 hours. Open list view. Confirm each booking occupies exactly one row showing its full time range (e.g., "10:00 AM – 12:30 PM").

**Acceptance Scenarios**:

1. **Given** a 30-minute booking exists, **When** the admin views the list, **Then** it appears as exactly one row showing its start and end time.
2. **Given** a 90-minute booking exists, **When** the admin views the list, **Then** it appears as exactly one row showing its full start-to-end time range.
3. **Given** a 150-minute booking exists, **When** the admin views the list, **Then** it appears as exactly one row — not split across hourly boundaries.
4. **Given** a booking has CONFIRMED, PENDING, or UNAVAILABLE status, **When** the admin views the list, **Then** it always appears as one row regardless of its duration.

---

### Edge Cases

- When a booking starts at a non-hour time (e.g., 08:30), available slots before it fill up to that exact start time; they may be shorter than 1 hour.
- When a booking ends at a non-hour time (e.g., 09:45), the next available slot starts at that exact end time; the first available slot after the booking may be shorter than 1 hour.
- When two bookings are scheduled back-to-back with no gap, no available row appears between them.
- When the day has no bookings at all, the list shows 16 rows of 1-hour available slots (06:00–22:00).
- When the day is fully booked end-to-end, no available-slot rows appear.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Available time slots in the admin list view MUST be displayed as 1-hour (60-minute) blocks.
- **FR-002**: Each booked interval (CONFIRMED, PENDING, or UNAVAILABLE) MUST appear as exactly one row showing its exact start time and end time.
- **FR-003**: A booked row MUST NOT be split at hour boundaries regardless of the booking's duration.
- **FR-004**: Available 1-hour slots MUST fill gaps between bookings; if a gap is shorter than 1 hour, it MUST still appear as one available row covering the partial period.
- **FR-005**: The schedule window MUST remain 06:00 to 22:00 — this boundary is unchanged.
- **FR-006**: Each available-slot row MUST remain individually actionable so the admin can tap it to create a new booking starting at that slot.

### Key Entities *(include if feature involves data)*

- **Available Slot Row**: A row in the admin list view representing unbooked time. Under this feature, each spans 1 hour (or the remaining gap if shorter than 1 hour).
- **Booking Row**: A row representing one booking record, always spanning its exact start-to-end time as a single row.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a day with zero bookings, the admin list view shows exactly 16 available-slot rows (one per hour, 06:00–22:00).
- **SC-002**: A booking of any duration (30 min, 60 min, 90 min, 150 min) occupies exactly 1 row in the admin list view in 100% of test cases.
- **SC-003**: Available slots adjacent to non-hour-boundary bookings fill without gaps; no unrepresented time exists between 06:00 and 22:00.
- **SC-004**: The total number of rows displayed per day is ≤ 16 + number of bookings for that day.

## Assumptions

- The admin list view from feature 011 is the target; no changes to calendar view or public list view.
- The schedule window (06:00–22:00) is fixed and unchanged.
- The minimum bookable unit in the system may be 30 minutes; this feature only changes the display granularity of available slots, not the scheduling rules.
- Existing booking row behavior (status colors, player name badge, action buttons) is unchanged; only the slot step for available rows changes.
- No database schema changes are needed — this is a display-layer change only.
