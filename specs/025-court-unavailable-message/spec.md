# Feature Specification: Court Unavailable Announcement

**Feature Branch**: `[028-pre-specify-branch]`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "025, provide an option to change player calendar view with a message about completely court unavailable until further notice. admin should be able to configure this, message or calendar. and message should be formatted as well"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player Closure View (Priority: P1)

As a player, I want to see a clear full-court-unavailable message instead of the booking calendar when the court is closed until further notice, so I immediately understand that booking is not currently possible.

**Why this priority**: This is the core user-facing behavior and prevents confusion and failed booking attempts during full closure periods.

**Independent Test**: Activate closure message mode and verify players see only the closure notice and cannot access calendar booking interactions.

**Acceptance Scenarios**:

1. **Given** player display mode is set to closure message, **When** a player opens the booking page, **Then** the closure message is shown and the calendar is not shown.
2. **Given** closure mode is active, **When** a player refreshes or revisits the booking page, **Then** the same closure message remains visible.
3. **Given** closure mode is active, **When** a player tries to find bookable time slots, **Then** the interface clearly indicates court unavailable status until further notice.

---

### User Story 2 - Admin Mode Selection (Priority: P1)

As an admin, I want to choose whether players see the normal calendar or a closure message, so I can quickly switch communication mode based on real-time operational status.

**Why this priority**: Admin control over player view is required to activate and deactivate closure communication without engineering intervention.

**Independent Test**: In admin settings, switch mode from calendar to closure message and back, then verify player-facing output changes accordingly after each save.

**Acceptance Scenarios**:

1. **Given** an admin is on availability display settings, **When** they choose calendar mode and save, **Then** players see the normal booking calendar.
2. **Given** an admin is on availability display settings, **When** they choose closure message mode and save, **Then** players see the closure message instead of the calendar.
3. **Given** an admin changes mode several times, **When** each change is saved, **Then** the most recent mode is the one consistently shown to players.

---

### User Story 3 - Admin Formatted Message Management (Priority: P2)

As an admin, I want to author and update a formatted closure message, so I can provide readable details such as notice text, updates, and instructions.

**Why this priority**: Message clarity reduces uncertainty and support requests during closure periods.

**Independent Test**: Save message content with supported formatting and verify players see the same formatted structure in closure mode.

**Acceptance Scenarios**:

1. **Given** closure mode is enabled, **When** an admin updates and saves message content, **Then** players see the updated message.
2. **Given** the message includes supported formatting, **When** players view it, **Then** formatting is rendered clearly and consistently.
3. **Given** closure mode is selected, **When** an admin attempts to save with empty message content, **Then** the system prevents activation and asks for valid content.

### Edge Cases

- Admin enables closure mode but message content is missing or only whitespace.
- Message content is very long and must remain readable without obscuring core notice text.
- Two admins update mode or message in close succession; players must see only the latest saved state.
- System experiences a transient loading issue while fetching mode configuration; players should not see conflicting calendar and closure views together.
- Admin switches from closure message back to calendar after a long outage; stale closure text must not remain visible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow admins to choose one active player display mode: `calendar` or `closure_message`.
- **FR-002**: The system MUST show the normal player calendar when mode is `calendar`.
- **FR-003**: The system MUST hide player calendar booking interactions and show the closure notice when mode is `closure_message`.
- **FR-004**: The system MUST allow admins to create and update closure notice content.
- **FR-005**: The system MUST support formatted closure notice presentation so the message can include readable structure such as headings, emphasis, and lists.
- **FR-006**: The system MUST require non-empty valid closure message content before allowing closure mode to be saved.
- **FR-007**: The system MUST apply the latest saved mode and message consistently across all player booking entry points.
- **FR-008**: The system MUST persist mode and closure message settings until an admin changes them.
- **FR-009**: The system MUST provide clear admin feedback when mode or message updates are saved.
- **FR-010**: The system MUST provide a safe readable fallback if formatted message rendering fails, rather than showing a broken player page.

### Key Entities *(include if feature involves data)*

- **Player Display Configuration**: The active configuration that determines whether players see calendar mode or closure message mode.
- **Closure Announcement Message**: Admin-authored notice shown to players during full-court-unavailable periods.
- **Message Formatting Rules**: Allowed formatting structure used to present closure announcements consistently and safely.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In validation, 100% of player sessions show closure message mode within 10 seconds after admin saves closure mode.
- **SC-002**: In validation, 100% of admin mode switches result in the correct player-facing mode with no mixed view states.
- **SC-003**: At least 95% of sampled players correctly identify full-court-unavailable status after viewing the closure message once.
- **SC-004**: Support requests caused by uncertainty about full closure status decrease by at least 50% in the first release cycle.
- **SC-005**: 100% of tested formatted closure messages remain readable and correctly structured on supported mobile and desktop player views.

## Assumptions

- The closure mode applies to all players and represents whole-court unavailability rather than per-court selective closure.
- Existing admin access controls already define who can update mode and closure message settings.
- Current booking entry points will consume the same display mode decision so users do not see conflicting states.
- The formatting capability uses a limited, safe message structure and does not allow arbitrary executable content.
