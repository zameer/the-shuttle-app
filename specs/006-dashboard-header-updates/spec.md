# Feature Specification: Admin Filter and Player Header Updates

**Feature Branch**: `006-before-specify-hook`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "01. Remove dashboard date filter 02. Header should include 2 more areas. a place to show a quote and bell icon for notification and announcements 03. a place showing sponsors"

## User Scenarios & Testing *(mandatory)*

For player-facing items in this specification, "header" refers to the page header where the "Shuttle" text is displayed.

### User Story 1 - Remove Admin Dashboard Date Filter (Priority: P1)

As an admin user, I can access the admin dashboard without a date filter control so the page is simpler and I am not misled into expecting date-scoped behavior.

**Why this priority**: Removing a no-longer-needed control prevents confusion and immediately improves usability for dashboard management tasks.

**Independent Test**: Open the admin dashboard and verify there is no date filter control and no date-filter action required to use the page.

**Acceptance Scenarios**:

1. **Given** an admin user is on the admin dashboard, **When** the header is displayed, **Then** no date filter input or date filter label is shown.
2. **Given** an admin user reloads the admin dashboard, **When** the page initializes, **Then** dashboard content appears without requiring any date filter selection.

---

### User Story 2 - See Quote and Notifications Area (Priority: P2)

As a player, I can see a quote area and a bell icon area in the page header where the "Shuttle" text appears so I can quickly view a motivational message and access notifications/announcements.

**Why this priority**: This adds informational value and communication visibility directly in the most prominent calendar header area.

**Independent Test**: Open the calendar page as a player and verify both areas appear in the page header where the "Shuttle" text appears and remain understandable on desktop and mobile screen sizes.

**Acceptance Scenarios**:

1. **Given** a player is on the calendar page, **When** the page header with the "Shuttle" text loads, **Then** a quote area is visible with readable text.
2. **Given** a player is on the calendar page, **When** the page header with the "Shuttle" text loads, **Then** a bell icon area is visible and clearly indicates that notifications/announcements are available.
3. **Given** there are no current announcements, **When** the page header with the "Shuttle" text loads, **Then** the bell area shows a neutral empty state and does not break layout.

---

### User Story 3 - See Sponsors Area (Priority: P3)

As a player, I can see a dedicated sponsors area just below the page header where the "Shuttle" text appears, using a familiar sponsor showcase pattern commonly used in other applications, so sponsor visibility is consistently maintained without crowding primary header actions.

**Why this priority**: Sponsor visibility is important but does not block core calendar usage.

**Independent Test**: Open the calendar page as a player and verify a clearly separated sponsors section is present immediately below the page header where the "Shuttle" text appears, follows a familiar and easy-to-scan sponsor showcase pattern, displays sponsor information, and falls back gracefully when sponsor data is unavailable.

**Acceptance Scenarios**:

1. **Given** sponsor information exists, **When** the calendar page is shown, **Then** the sponsors section directly below the header displays sponsor content in a clear, consistent, and easy-to-scan layout.
2. **Given** sponsor information is missing, **When** the calendar page is shown, **Then** the sponsors area directly below the header displays a fallback state without leaving empty broken space.

### Edge Cases

- Very long quote text must be truncated or wrapped in a way that keeps header sections readable.
- A large number of pending announcements must not overlap other header areas.
- On narrow screens, quote and notifications in the header plus sponsors below the header must remain readable without overlap.
- If notification and sponsor data load slowly or fail, the header must still render with stable placeholders.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The admin dashboard header MUST remove the date filter control entirely.
- **FR-002**: The admin dashboard MUST remain usable without any date filter dependency during initial load.
- **FR-003**: The player calendar page header where the "Shuttle" text appears MUST include a dedicated quote display area.
- **FR-004**: The quote area MUST display readable text and support empty/fallback messaging when quote content is unavailable.
- **FR-005**: The player calendar page header where the "Shuttle" text appears MUST include a bell icon area representing notifications and announcements.
- **FR-006**: The bell icon area MUST communicate whether announcements are present.
- **FR-007**: The bell icon area MUST provide an accessible way to review announcement content.
- **FR-008**: The player calendar page MUST include a dedicated sponsors area directly below the page header where the "Shuttle" text appears.
- **FR-009**: The sponsors area MUST display sponsor content when available and a fallback state when not available.
- **FR-011**: The sponsors area below the page header MUST follow a widely used sponsor showcase approach, including a clearly labeled section, consistent sponsor item presentation, and predictable visual hierarchy.
- **FR-010**: Header content and the sponsors area below the header MUST remain readable and non-overlapping across supported desktop and mobile viewport sizes.

### Key Entities *(include if feature involves data)*

- **Header Quote**: A short text message shown in the player calendar page header where the "Shuttle" text appears, including content and display state (available or fallback).
- **Announcement Notification**: A page-header-visible summary of announcement availability in the header where the "Shuttle" text appears, including presence status and announcement preview details.
- **Sponsor Highlight**: Sponsor display information for the area below the player calendar page header where the "Shuttle" text appears, including visible content and fallback state when unavailable.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of admin dashboard sessions show no date filter element in the header after release.
- **SC-002**: At least 95% of users can identify the quote and notification areas within 10 seconds of opening the player calendar page.
- **SC-003**: At least 95% of tested viewport sizes display quote, notification, and sponsor areas without visual overlap or unreadable content.
- **SC-004**: At least 90% of users can locate sponsor information in the area below the header on their first attempt.

## Assumptions

- The scope includes admin dashboard date filter removal and player calendar header/near-header content updates, without redesign of unrelated sections.
- Notification and sponsor content sources already exist or will be provided by existing business processes.
- The same player-facing layout requirements apply to both desktop and mobile calendar experiences, following familiar sponsor section patterns users commonly see in modern applications.
- Existing access controls for admin and player users remain unchanged.
