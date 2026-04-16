# Feature Specification: Admin List View Booking Management

**Feature Branch**: `011-admin-list-view`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "Admin calendar data should also be represented in list view with a toggle to change the view, reserved slot should be shown proper way, especially more than one hour booking should show merged, consider 30, 1.30, 2.30 hours as well, provide the most user friendly way to represent the information, in list admin should be able to select a date, move next previous date as well. and should be able to manage booking by selecting a row icon or any friendly way."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Between Admin Calendar and List (Priority: P1)

As an admin managing court schedules, I want to switch between calendar and list views while keeping the same selected date so I can choose the most efficient layout for reviewing bookings.

**Why this priority**: Admins need quick context switching during daily operations. If list and calendar are not synchronized, managing bookings becomes slow and error-prone.

**Independent Test**: Open the admin booking page, switch from calendar to list and back, change date in either view, and confirm both views stay aligned to the same date.

**Acceptance Scenarios**:

1. **Given** the admin is on the booking screen, **When** they tap the view toggle, **Then** they can switch between calendar and list views without losing the selected date.
2. **Given** the admin is in list view, **When** they select a date using the date selector, **Then** list rows update to that date.
3. **Given** the admin is in list view, **When** they use previous-day or next-day controls, **Then** the selected date changes by exactly one day and the rows refresh.
4. **Given** the admin changes date in list view, **When** they return to calendar view, **Then** the calendar is positioned on that same date.

---

### User Story 2 - View Merged Reserved Bookings Clearly (Priority: P1)

As an admin, I want reserved bookings to appear as merged continuous rows across their full duration so I can quickly understand slot occupancy, including 30-minute and mixed-hour lengths.

**Why this priority**: Accurate visual duration is critical for avoiding double booking and for making fast schedule decisions.

**Independent Test**: Load a day containing bookings of 30, 60, 90, and 150 minutes and verify each booking appears as one merged reserved row with accurate start and end times.

**Acceptance Scenarios**:

1. **Given** a reserved booking lasting 30 minutes, **When** the list is rendered, **Then** one reserved row appears with the correct 30-minute time range.
2. **Given** a reserved booking lasting 90 minutes, **When** the list is rendered, **Then** it appears as one merged row rather than split hourly rows.
3. **Given** a reserved booking lasting 150 minutes, **When** the list is rendered, **Then** one merged row shows the full continuous interval.
4. **Given** multiple adjacent bookings belong to different reservations, **When** the list is rendered, **Then** they remain separate rows and are not merged across reservation boundaries.

---

### User Story 3 - Manage Bookings Directly From List Rows (Priority: P2)

As an admin, I want a friendly row-level action entry point so I can open booking management actions directly from list view without switching screens.

**Why this priority**: It reduces steps for common administrative workflows while preserving a compact list layout.

**Independent Test**: In list view, activate a row action entry point (icon/button), choose a management action, and confirm the selected booking is opened for management.

**Acceptance Scenarios**:

1. **Given** a row represents an existing booking, **When** the admin activates the row action control, **Then** available management actions are shown for that booking.
2. **Given** a row represents an available slot, **When** the admin activates the row action control, **Then** actions relevant to creating or blocking a booking are shown.
3. **Given** the admin completes or cancels an action, **When** control returns to the list, **Then** the row data reflects the latest booking state.

### Edge Cases

- When no bookings exist for a selected date, the list still shows the full schedule window as available rows.
- When bookings start or end on half-hour boundaries, the displayed duration and boundaries remain accurate.
- When a booking overlaps midnight, the list only shows the portion that falls on the selected date.
- When an admin does not have permission for a management action, the action is hidden or disabled with clear feedback.
- When booking data refreshes while the admin is interacting with a row action, the selected booking context remains stable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The admin booking interface MUST provide both calendar and list display modes with a visible toggle.
- **FR-002**: The system MUST keep a single selected date state shared across admin calendar and admin list views.
- **FR-003**: In list mode, admins MUST be able to choose a date directly and navigate one day backward or forward with dedicated controls.
- **FR-004**: List rows MUST represent booking occupancy accurately for durations including 30, 60, 90, and 150 minutes.
- **FR-005**: A single reservation spanning multiple contiguous time segments MUST be displayed as one merged reserved row with clear start and end times.
- **FR-006**: Reservations MUST NOT be merged across different booking records, statuses, or non-contiguous intervals.
- **FR-007**: Each list row MUST expose an admin-friendly action entry point for booking management tasks relevant to that row type.
- **FR-008**: After a booking management action is completed, the list MUST refresh and show updated booking state for the affected date.
- **FR-009**: The list MUST clearly distinguish at least available, reserved, pending, and unavailable states through consistent visual labels.
- **FR-010**: The list presentation MUST remain readable and usable on mobile and desktop admin screens.

### Key Entities *(include if feature involves data)*

- **Admin Selected Date**: The active date used by both admin views to ensure synchronized navigation and filtering.
- **Booking Interval Row**: A list row representing either an available interval or a booked interval, including start time, end time, duration, state, and source booking identifier.
- **Merged Reservation Block**: A derived representation of a single reservation that spans multiple contiguous time slices and is shown as one row.
- **Row Action Set**: The list of management actions available for a row based on row type, booking state, and admin permissions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In usability testing, at least 95% of admins can switch view mode and select a target date within 2 interactions.
- **SC-002**: In a validation dataset containing 30-, 60-, 90-, and 150-minute bookings, 100% of bookings are displayed with correct merged boundaries and durations.
- **SC-003**: At least 90% of admins can open a booking management action from list view in under 10 seconds.
- **SC-004**: Date synchronization mismatch between list and calendar views is 0% across test sessions.
- **SC-005**: On supported mobile and desktop viewports, 95% of participants rate the list representation of booking status as clear and actionable.

## Assumptions

- Existing admin authentication and authorization rules remain unchanged and are reused for row-level actions.
- Existing booking statuses and booking records are the source of truth for both calendar and list representations.
- Booking management actions already exist in current admin workflows and can be launched from a row entry point.
- The schedule window and business hours follow current court settings unless changed by separate configuration features.
