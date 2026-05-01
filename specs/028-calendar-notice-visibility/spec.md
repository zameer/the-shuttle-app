# Feature Specification: Calendar Notice Visibility Control

**Feature Branch**: `030-create-feature-branch`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "making available both options with exisitng feature, 025-court-unavailable-message. As admin provide an option to make both important notice message and player calendar togather. so admin will be able to make, either player calendar or message to show and both at the same time."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Control Player View Mode (Priority: P1)

As an admin, I can choose what players see on the public booking screen by selecting calendar only, message only, or both together.

**Why this priority**: This is the core operational control needed to manage court communication and booking visibility.

**Independent Test**: Open admin settings for player view visibility, switch each mode, save, and verify the public player screen reflects the selected mode.

**Acceptance Scenarios**:

1. **Given** admin is on the visibility setting, **When** admin selects calendar-only mode and saves, **Then** players see the calendar and do not see the important notice block.
2. **Given** admin is on the visibility setting, **When** admin selects message-only mode and saves, **Then** players see the important notice block and do not see the calendar.
3. **Given** admin is on the visibility setting, **When** admin selects both mode and saves, **Then** players see both the important notice block and the calendar on the same screen.

---

### User Story 2 - Preserve Existing Notice Workflow (Priority: P1)

As an admin, I can continue using the existing court unavailable or important notice message workflow while applying the new visibility combinations.

**Why this priority**: The request explicitly extends existing feature 025 behavior and should not break existing notice operations.

**Independent Test**: Update the existing notice message content, change visibility mode, and verify message content still appears correctly wherever enabled.

**Acceptance Scenarios**:

1. **Given** a notice message already exists, **When** admin enables message-only or both mode, **Then** players see the latest saved notice message.
2. **Given** admin updates notice message content, **When** message display is enabled, **Then** the updated content appears without requiring additional configuration.
3. **Given** admin selects calendar-only mode, **When** players open the page, **Then** notice content is hidden but remains preserved for later use.

---

### User Story 3 - Prevent Invalid Visibility State (Priority: P2)

As an admin, I receive clear feedback if I attempt to save a visibility configuration that would show neither calendar nor message.

**Why this priority**: Prevents a blank or confusing player-facing screen.

**Independent Test**: Try to save with both calendar and message disabled and verify the system blocks save with clear guidance.

**Acceptance Scenarios**:

1. **Given** admin has disabled both calendar and message, **When** admin attempts to save, **Then** save is blocked and a clear validation message is shown.
2. **Given** admin receives the validation message, **When** admin enables at least one option and saves, **Then** the setting is accepted.

### Edge Cases

- What happens when admin switches rapidly between modes before saving? Only the final selected mode is persisted.
- What happens if the notice message is empty and message display is enabled? A user-friendly empty-message state is shown instead of broken layout.
- What happens if players load the page during a mode change save? They see either the old complete state or new complete state, not a mixed partial state.
- What happens if legacy settings exist from before this feature? Legacy values are mapped to the nearest equivalent valid mode.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an admin-visible configuration control for player screen visibility mode.
- **FR-002**: System MUST support at least three valid modes: calendar only, message only, and both together.
- **FR-003**: System MUST persist the selected mode and apply it to the player-facing screen.
- **FR-004**: In calendar-only mode, system MUST show calendar and hide important notice.
- **FR-005**: In message-only mode, system MUST show important notice and hide calendar.
- **FR-006**: In both mode, system MUST show important notice and calendar together on the player-facing screen.
- **FR-007**: System MUST preserve existing notice message content and editing behavior from feature 025.
- **FR-008**: System MUST block saving a state where both calendar and message are disabled.
- **FR-009**: System MUST provide a clear validation message when admin attempts to save an invalid disabled-both state.
- **FR-010**: Changes to visibility mode MUST take effect on subsequent player page loads without requiring manual cache clearing.
- **FR-011**: Existing valid configurations from prior versions MUST remain functional after this feature is introduced.

### Key Entities *(include if feature involves data)*

- **Player Visibility Mode**: Admin-configured display mode determining whether player calendar, important notice message, or both are shown.
- **Important Notice Content**: Existing player-facing message content managed by admin and reused from feature 025.
- **Player Calendar Visibility State**: Display flag determining whether booking calendar is visible on the player-facing page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin can complete a visibility mode change in under 30 seconds in usability validation.
- **SC-002**: In acceptance testing, each of the three valid modes renders the correct player-facing output in 100% of test runs.
- **SC-003**: Invalid disabled-both configuration attempts are blocked with clear feedback in 100% of tested scenarios.
- **SC-004**: Existing notice message content remains intact after mode changes in 100% of regression checks.

## Assumptions

- Existing feature 025 already stores and serves important notice content for the player-facing screen.
- Admin users managing visibility have existing authorized access to modify player-facing settings.
- Player-facing screen already supports rendering both message and calendar regions without a full page redesign.
- This feature does not add new payment, booking rules, or authentication behavior.
