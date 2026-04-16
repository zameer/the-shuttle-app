# Feature Specification: Mobile-Friendly Calendar View Toggle

**Feature Branch**: `009-mobile-calendar-toggle`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "Player calendar is not friendly in mobile, so plan is to provide a simple list view option as well, so a toggle will help players to change the views. remove View Full Rules link from RULES banner. make list view default selected."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch to List View on Mobile (Priority: P1)

As a player using a small screen, I open the booking page and immediately see a simple list view of availability — and I can switch to the calendar view if I prefer it.

**Why this priority**: Mobile usability directly affects booking completion. If players cannot comfortably browse availability on mobile, they are likely to abandon the flow. Defaulting to list view ensures the most mobile-friendly experience is presented without requiring any extra interaction.

**Independent Test**: Open the player page on a mobile viewport without changing any settings. Confirm list view is the initial state and presents timeslots in a readable vertical layout. Confirm switching to calendar view works and switching back returns to list.

**Acceptance Scenarios**:

1. **Given** a player opens the booking page for the first time, **When** the page loads, **Then** list view is active by default without any user action.
2. **Given** a player is on the booking page, **When** they use the view toggle, **Then** they can switch between list and calendar views.
3. **Given** the player is in list view, **When** the list renders, **Then** timeslots are displayed in a vertical, easy-to-scan format.
4. **Given** no timeslots are available for the selected date, **When** list view is active, **Then** an empty-state message is shown without layout breakage.

---

### User Story 2 - Keep Core Booking Flow Consistent Across Views (Priority: P2)

As a player, I can perform the same booking actions from either calendar view or list view, so changing view does not remove or alter core booking behavior.

**Why this priority**: Players should choose a reading format without functional trade-offs. Consistent behavior reduces confusion and booking mistakes.

**Independent Test**: Switch to each view and attempt the same booking action. Confirm interaction outcomes are equivalent in both views.

**Acceptance Scenarios**:

1. **Given** the player is in list view, **When** they select an available slot, **Then** the same booking flow starts as in calendar view.
2. **Given** slot status indicators are shown in calendar view, **When** list view is active, **Then** equivalent status meaning is visible in list rows.
3. **Given** the player switches views multiple times, **When** data is already loaded, **Then** the selected date context remains unchanged.

---

### User Story 3 - Simplify Rules Banner Actions (Priority: P2)

As a player, I see a cleaner rules banner without a separate "View Full Rules" link, and I still have clear ways to access full rules using existing entry points.

**Why this priority**: The banner currently has redundant actions and visual noise. Removing the extra link simplifies scanning while preserving access to details.

**Independent Test**: Open the player page and verify the rules banner no longer includes the "View Full Rules" link. Confirm players can still open full rules from the header rules button and rule chips.

**Acceptance Scenarios**:

1. **Given** the rules banner is visible, **When** the player scans banner actions, **Then** no "View Full Rules" link is displayed.
2. **Given** the rules banner is visible, **When** the player taps a rule chip, **Then** full rules details can still be opened.
3. **Given** the player uses the header rules button, **When** they tap it, **Then** the full rules modal opens as before.

### Edge Cases

- When the player rotates device orientation, the current view selection remains stable and usable.
- When there are many time slots in a day, list view remains scrollable and readable without overlapping elements.
- When there are very few slots, list view does not leave confusing blank gaps.
- If rules are not configured, banner and header rules entry points follow existing empty-state behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The player booking interface MUST provide a view toggle that lets users switch between calendar view and list view.
- **FR-002**: List view MUST be the default display mode when the player first opens the booking page.
- **FR-003**: On mobile-size viewports, list view MUST present daily slot information in a vertically readable format optimized for touch scanning.
- **FR-004**: Switching views MUST preserve the player's current date context.
- **FR-005**: Core booking actions available in calendar view MUST remain available in list view.
- **FR-006**: Slot status meaning shown in calendar view MUST be represented consistently in list view.
- **FR-007**: The rules banner MUST NOT display a "View Full Rules" link.
- **FR-008**: Players MUST still be able to open full rules details from the existing header rules button.
- **FR-009**: Players MUST still be able to open full rules details from rule chips in the banner.
- **FR-010**: If list view has no slots for the selected date, the interface MUST show a clear empty state.
- **FR-011**: The view toggle and list rows MUST be keyboard and touch accessible.

### Key Entities *(include if feature involves data)*

- **View Mode Preference**: The currently selected presentation mode for the player schedule, with values `calendar` or `list`.
- **Slot Row Representation**: A list-view representation of a booking slot containing start time, end time, availability status, and selectable action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When the player opens the booking page, list view is active without any additional interaction required.
- **SC-002**: On a mobile viewport, players can switch between calendar and list views in one tap.
- **SC-003**: At least 90% of test users can identify an available slot in list view within 10 seconds during usability checks.
- **SC-004**: Booking initiation success rate from list view is equal to calendar view in the same test set.
- **SC-005**: The rules banner shows zero occurrences of the "View Full Rules" link after rollout.
- **SC-006**: The two remaining rules entry points (header button and rule chips) both open full rules successfully in validation tests.

## Assumptions

- List view is the default display mode on page load; the player can switch to calendar view at any time using the toggle.
- The existing calendar view remains available and unchanged as one of the two selectable views.
- The new list view is added only to the player-facing booking experience.
- Existing slot data and status definitions are reused for list view without changing business rules.
- Full rules modal behavior remains unchanged; only banner action visibility is adjusted.
- The current rules chip interaction continues to be the banner-level entry to rule details.
