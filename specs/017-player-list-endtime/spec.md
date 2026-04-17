# Feature Specification: Player List End-Time Enforcement

**Feature Branch**: `017-create-feature-branch`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "01. Player list should not show beyond end time, our end time is critical since court is in residential area"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stop Player List at Closing Time (Priority: P1)

As a player, I want the list view to stop at the configured court closing time so I do not see playable time beyond allowed hours.

**Why this priority**: This directly affects compliance with residential area operating constraints and reduces confusion about allowable booking hours.

**Independent Test**: Open player list view on a date where at least one booking extends beyond closing time and verify the list does not display any time after the configured closing boundary.

**Acceptance Scenarios**:

1. **Given** a configured daily closing time exists, **When** player list view renders for that date, **Then** no list row ends after the configured closing time.
2. **Given** a booking starts before closing time and ends after closing time, **When** player list view renders, **Then** the booking is visible only up to the closing boundary.
3. **Given** a booking starts at or after closing time, **When** player list view renders, **Then** that booking is not shown in player list rows.

---

### User Story 2 - Preserve Clear End-of-Day Visibility (Priority: P2)

As court staff monitoring public visibility, I want end-of-day list output to reflect the real operating cutoff so players only see compliant availability.

**Why this priority**: This supports operational control and avoids complaints caused by listings that imply late-night availability.

**Independent Test**: Compare player list output on two dates with different closing configurations and verify each day stops exactly at its configured end boundary.

**Acceptance Scenarios**:

1. **Given** closing time includes minutes (for example, half-hour close), **When** player list view renders, **Then** the last visible row boundary matches that configured end-time precision.
2. **Given** closing-time settings are unchanged, **When** player list is refreshed, **Then** the same end boundary is consistently applied across reloads for that date.

### Edge Cases

- Booking ends exactly at the configured closing time.
- Booking fully outside the visible window (starts and ends after closing).
- Closing-time value includes non-zero minutes.
- Closing-time setting is temporarily unavailable; player list must still render with a safe default boundary.
- Short partial gap immediately before closing time should remain visible if it is within allowed hours.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render player list rows only within the configured daily closing boundary.
- **FR-002**: The system MUST prevent any player list row from displaying time beyond the configured end time.
- **FR-003**: The system MUST display boundary-overlapping bookings only up to the configured closing time in player list view.
- **FR-004**: The system MUST exclude bookings from player list output when they start at or after the configured closing boundary.
- **FR-005**: The system MUST preserve existing visibility behavior for booking content that is fully inside the allowed daily window.
- **FR-006**: The system MUST keep this behavior limited to player list rendering and MUST NOT require new user permissions or role changes.
- **FR-007**: The system MUST continue rendering player list safely if closing-time settings cannot be loaded, using the existing default end boundary.

### Key Entities *(include if feature involves data)*

- **Player List Time Window**: The start/end display boundaries used to generate player list rows for a selected date.
- **Configured Closing Time**: The official daily end-of-operations boundary used to constrain what players can see.
- **Boundary-Overlapping Booking Segment**: A booking that crosses the closing boundary and must be shown only for the in-window portion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In QA, 100% of tested player list dates show no row content beyond the configured closing boundary.
- **SC-002**: In QA, 100% of tested boundary-overlapping bookings are truncated at closing time in player list view.
- **SC-003**: In regression QA, 0 new discrepancies are introduced for bookings fully inside the allowed window.
- **SC-004**: During post-release validation, user-reported incidents about player list showing post-closing times decrease to zero for the first two weeks.

## Assumptions

- The configured court closing time is the authoritative operational cutoff for public player-facing visibility.
- This feature applies to player list view scope only; other views are unchanged unless separately specified.
- Existing booking data remains the source of truth, and this feature changes only how player list output is bounded.
- Existing fallback behavior for schedule settings remains available when settings data cannot be read.
