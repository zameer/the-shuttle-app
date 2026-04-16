# Feature Specification: Player List View Date Picker

**Feature Branch**: `010-list-date-picker`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "player list requires date picker, it is adding a high value"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pick a Date in List View (Priority: P1)

As a player using the list view, I want to select any date using a date picker so I can see slot availability for days other than today without switching to the calendar view.

**Why this priority**: The list view currently only shows slots for today, which means players who want to check a future date must switch to the full calendar — defeating the purpose of the simpler list experience. A date picker directly in list view is the highest-value addition, giving the list view full browsing capability without added visual complexity.

**Independent Test**: Open the player booking page in list view. A date picker (or date input) is visible. Select tomorrow's date. Confirm the slot list updates to show tomorrow's hourly availability. Select a date one week ahead. Confirm the list updates again. No page reload required.

**Acceptance Scenarios**:

1. **Given** the player is in list view, **When** the page loads, **Then** today's date is selected and today's slots are shown.
2. **Given** the player is in list view, **When** they select a future date via the picker, **Then** the slot list refreshes to show that date's availability.
3. **Given** the player selects a date with no bookings, **When** the list renders, **Then** all hourly slots are shown as available.
4. **Given** the player selects a past date, **When** the list renders, **Then** the slots are shown as-is without preventing the selection.
5. **Given** the player switches from list view to calendar view, **When** they look at the calendar, **Then** the calendar's selected/visible date reflects the date the player had selected in list view.

---

### User Story 2 - Navigate Dates with Previous / Next Arrows (Priority: P2)

As a player, I can step through dates one day at a time using previous and next arrow buttons, so I can quickly browse adjacent days without opening the date picker each time.

**Why this priority**: Tapping "next day" is a very common mobile interaction. Arrow navigation reduces friction compared to reopening the picker for every date change, making the list view more fluent for daily browsing.

**Independent Test**: With the list view open and today selected, tap the "next day" button. The date increments by one day and the slot list updates. Tap "previous day" — the date decrements by one day and the list updates. The date picker label tracks the change.

**Acceptance Scenarios**:

1. **Given** a date is selected, **When** the player taps the next-day button, **Then** the date advances by one day and the slot list updates.
2. **Given** a date is selected, **When** the player taps the previous-day button, **Then** the date moves back by one day and the slot list updates.
3. **Given** the player uses arrow navigation, **When** they switch to calendar view, **Then** the calendar reflects the date reached via arrow navigation.

---

### Edge Cases

- When the player selects a date far in the future where no bookings exist, all slots are displayed as available without an error state.
- When the player rapidly taps next/previous arrows, the list updates to the final selected date without showing stale data.
- When the player is on a very small screen (≥375 px), the date picker and arrow buttons fit within the viewport without horizontal overflow.
- If date parsing fails for any reason, the picker resets to today's date gracefully.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The list view MUST display a date picker control that allows the player to select any calendar date.
- **FR-002**: The date picker MUST default to today's date on page load.
- **FR-003**: When the player selects a date, the slot list MUST update to show hourly availability for the chosen date without a full page reload.
- **FR-004**: The list view MUST include a "previous day" and "next day" navigation control adjacent to the date picker.
- **FR-005**: The selected date in list view MUST remain in sync with the `currentDate` state shared with calendar view, so switching views preserves the date.
- **FR-006**: The date picker and navigation controls MUST be keyboard and touch accessible.
- **FR-007**: The date picker label MUST display the selected date in a human-readable format (e.g., "Wednesday, 16 April 2026").

### Key Entities

- **Selected Date**: The calendar date currently driving the list view's slot display. Shared with the calendar view's `currentDate` state to keep both views in sync.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can select any date in list view and see updated slot availability within one interaction (single tap or click).
- **SC-002**: The date display updates within 300 ms of a date selection on a standard mobile device.
- **SC-003**: Navigating to the next or previous day requires no more than one tap/click.
- **SC-004**: The selected date is preserved when switching between list and calendar views — zero data loss across view switches.
- **SC-005**: The date picker and navigation fit within a 375 px viewport without horizontal scroll.

## Assumptions

- The date picker is added only to the player-facing list view; the admin calendar is unaffected.
- The existing `currentDate` state in `PublicCalendarPage` (introduced in feature 009) is reused and passed down to both the list view and the calendar, so no new global state is required.
- The booking data query is already date-range aware; changing the selected date triggers a re-query via the existing `usePublicBookings` hook with updated date bounds.
- No restriction on which dates the player can select (past or future) — the display is informational only.
- The date picker UI component will use a native date input or a lightweight shadcn/ui-compatible picker; no third-party calendar widget will be introduced.

