# Feature Specification: Player Call Choice and Future-Only Dates

**Feature Branch**: `[022-call-choice-future-only]`  
**Created**: 2026-04-19  
**Status**: Draft  
**Input**: User description: "01. call option implemented in 021 requires both features, call now and callback request, so player will be able to choose one. 02. player calendar and list, showing data for past dates not required, show only current day and future"

## Clarifications

### Session 2026-04-19

- Q: How should Call Now and Request Callback be shown on the public page? → A: Use one floating FAB that opens a chooser containing both actions; when no agent is available, only Request Callback is active.
- Q: In which views is the FAB visible? → A: Both calendar and list views; fixed bottom-right, always visible while scrolling.
- Q: How should "Call Now" appear when no agent is available? → A: Greyed out and disabled but still visible in the chooser, with a short status label such as "No agent available".
- Q: For today's slots in list view, should past time slots within today be hidden? → A: Yes — show only slots at or after the current local time.
- Q: How should the chooser open when the FAB is tapped? → A: Expand inline above the FAB (speed-dial style) — two action buttons animate up above it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Choose Contact Method (Priority: P1)

As a player viewing court availability, I can choose either to call immediately or submit a callback request, so I can use the contact method that fits my situation.

**Why this priority**: This is direct player-facing booking support and removes friction caused by forcing only one contact path at a time.

**Independent Test**: Can be fully tested by opening the public availability page and confirming both actions are available from the same contact entry point and both complete successfully.

**Acceptance Scenarios**:

1. **Given** the player is on the public availability page, **When** they tap the floating contact FAB, **Then** a chooser opens with both "Call Now" and "Request Callback" actions.
2. **Given** the player selects "Call Now" and a callable number is available, **When** they confirm the action, **Then** the system initiates an immediate call attempt through the device call flow.
3. **Given** the player selects "Request Callback", **When** they submit required callback details, **Then** the request is accepted and a confirmation message is shown.
4. **Given** no agent is available, **When** the player opens the chooser, **Then** "Request Callback" remains active and "Call Now" is not active.

---

### User Story 2 - Show Only Current and Future Dates (Priority: P1)

As a player browsing calendar and list availability, I only see current-day and future dates, so I focus on bookable windows and avoid outdated slots.

**Why this priority**: Removing past dates simplifies navigation and aligns the public experience with booking intent.

**Independent Test**: Can be fully tested by opening both calendar and list views and validating no past dates or past slots are visible or navigable.

**Acceptance Scenarios**:

1. **Given** the player opens calendar view, **When** dates are rendered, **Then** no date before today appears.
2. **Given** the player opens list view, **When** entries are rendered, **Then** no slot before today appears.
3. **Given** the player uses date navigation controls, **When** attempting to move before today, **Then** the system prevents navigation to past dates.

---

### User Story 3 - Preserve Callback Access During Availability Changes (Priority: P2)

As a player, I can still submit a callback request even if immediate call availability changes, so I always have a reliable way to contact staff.

**Why this priority**: Availability can change quickly; maintaining callback access prevents dead ends.

**Independent Test**: Can be tested by simulating availability changes and confirming callback request remains accessible and submittable.

**Acceptance Scenarios**:

1. **Given** immediate call becomes unavailable while the player is on the page, **When** the contact area refreshes, **Then** callback request action remains available.
2. **Given** the player attempts to contact staff during fluctuating availability, **When** one method is unavailable, **Then** the alternate method remains usable.

### Edge Cases

- Date boundary behavior when local time crosses midnight while the page is open.
- Mixed timezone data where a slot timestamp appears future in storage but past in player local time.
- Immediate call route is temporarily unavailable while callback submission remains operational.
- Player opens the contact UI without network connectivity.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The public player contact entry MUST be a floating action button fixed at bottom-right, always visible while scrolling, present in both calendar and list views, that opens a chooser containing both contact choices: immediate call and callback request.
- **FR-002**: The system MUST allow players to choose either contact method from that chooser without requiring a page change.
- **FR-003**: The system MUST initiate an immediate call attempt when the player chooses the call action and a callable number is available.
- **FR-004**: The system MUST allow callback request submission from the same public contact area.
- **FR-005**: The system MUST show clear confirmation after successful callback request submission.
- **FR-006**: The public calendar view MUST exclude dates earlier than the current local date.
- **FR-007**: The public list view MUST exclude slots earlier than the current local date AND must exclude past time slots within today (only slots at or after the current local time are shown).
- **FR-008**: Date navigation controls MUST prevent movement to any date before the current local date.
- **FR-009**: If immediate call is unavailable, the callback request option MUST remain active in the chooser; the "Call Now" option MUST be shown but rendered as greyed-out and disabled with a short status label (e.g. "No agent available").
- **FR-010**: If immediate call becomes available again, both options MUST continue to be shown for player choice.
- **FR-011**: When the FAB is tapped, the chooser MUST expand inline above the FAB using a speed-dial animation, revealing the two action buttons above it without opening a modal or bottom sheet.

### Key Entities *(include if feature involves data)*

- **Player Contact Choice**: Represents the player’s selected action (call now or callback request) from the public contact area.
- **Display Date Window**: Represents the allowed public date range, bounded to current day forward.
- **Public Availability Entry**: Represents a visible slot/date item eligible for display under the date window rules.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of public sessions show both contact actions in the player contact area.
- **SC-002**: 95% of players can complete either contact action in under 60 seconds from opening the page.
- **SC-003**: 0 past dates are displayed in public calendar and list views during verification across supported devices.
- **SC-004**: 100% of attempts to navigate to pre-today dates are blocked in public date navigation.
- **SC-005**: In availability transition testing, callback request remains available in 100% of cases where immediate call is unavailable.

## Assumptions

- Existing callback request data capture and confirmation behaviors from feature 021 remain the baseline and are reused.
- "Current day" is interpreted using the player’s local device date.
- This feature applies to public player views only and does not change historical visibility rules in admin views.
- Existing call routing and callback assignment logic remain unchanged; this feature adjusts public choice and date visibility behavior.