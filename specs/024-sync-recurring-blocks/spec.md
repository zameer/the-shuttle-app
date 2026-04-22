# Feature Specification: Sync Recurring Blocks

**Feature Branch**: `[024-setup-specify-invocation]`  
**Created**: 2026-04-22  
**Status**: Draft  
**Input**: User description: "recurring unavailable blocks showing in calendar but not in list view, both player and admin"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player View Consistency (Priority: P1)

As a player, I want recurring unavailable blocks to appear in both calendar and list views, so I can trust availability regardless of which view I use.

**Why this priority**: Players use both views to decide when to book. Missing blocks in one view can lead to false availability expectations and failed booking attempts.

**Independent Test**: Create a recurring unavailable block and verify it appears on the same dates and times in both player calendar and player list views.

**Acceptance Scenarios**:

1. **Given** a recurring unavailable block exists for a date in range, **When** a player opens calendar view, **Then** that block is shown as unavailable.
2. **Given** the same recurring unavailable block exists, **When** the player switches to list view for the same date, **Then** the same time range is shown as unavailable.
3. **Given** multiple recurring unavailable blocks exist across dates, **When** the player navigates between dates, **Then** each date reflects matching unavailable slots in both views.

---

### User Story 2 - Admin View Consistency (Priority: P1)

As an admin, I want recurring unavailable blocks to appear in both calendar and list views, so I can verify operational blocks without switching view modes to cross-check.

**Why this priority**: Admin scheduling decisions depend on accurate visibility. A mismatch can cause staff confusion and incorrect availability updates.

**Independent Test**: In admin pages, verify the same recurring unavailable block appears in both calendar and list view for identical date ranges.

**Acceptance Scenarios**:

1. **Given** an admin has configured recurring unavailable blocks, **When** they view the schedule in calendar mode, **Then** blocked slots are visible as unavailable.
2. **Given** the same configured blocks, **When** the admin switches to list mode, **Then** the same blocked slots are visible with matching time ranges.
3. **Given** an admin updates or removes a recurring block, **When** either view reloads, **Then** both views reflect the same updated block state.

---

### User Story 3 - Cross-View Data Parity (Priority: P2)

As a user of either role, I want list and calendar to use the same recurring-unavailable interpretation, so one view never contradicts the other.

**Why this priority**: Consistent interpretation prevents regressions and reduces support cases about mismatched availability.

**Independent Test**: For a selected period, compare unavailable ranges rendered in calendar and list and confirm there are no date/time discrepancies.

**Acceptance Scenarios**:

1. **Given** a date range with recurring unavailable rules, **When** rendered in both views, **Then** unavailable time slots match exactly by date and time boundaries.
2. **Given** a recurrence that spans week boundaries, **When** users move across weeks, **Then** list and calendar continue to show matching blocked ranges.

### Edge Cases

- Recurring blocks that begin before midnight and end after midnight should be represented correctly on affected dates in both views.
- A partial available gap adjacent to a recurring block boundary (e.g., 07:30–08:00 where 08:00 is a block start) must display as a full 60-minute slot (07:30–08:30), not a truncated 30-minute slot.
- Recurring blocks with start or end times at view boundary edges should not disappear in list view.
- Overlapping recurring unavailable blocks should not produce contradictory availability states between views.
- A recurring block that covers the same window as a CANCELLED or NO_SHOW booking must be suppressed; the slot shows AVAILABLE, not UNAVAILABLE.
- Date-range navigation should not omit recurring blocks at the first or last visible day in list view.
- Timezone/date-shift boundaries should not cause a block to appear in one view and not the other.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display recurring unavailable blocks in player calendar view.
- **FR-002**: The system MUST display the same recurring unavailable blocks in player list view for the same dates.
- **FR-003**: The system MUST display recurring unavailable blocks in admin calendar view.
- **FR-004**: The system MUST display the same recurring unavailable blocks in admin list view for the same dates.
- **FR-005**: The system MUST ensure list and calendar views represent unavailable ranges with matching date and time boundaries.
- **FR-006**: The system MUST update both views consistently after recurring block creation, update, or removal.
- **FR-007**: The system MUST preserve unavailable status when recurring blocks overlap with CONFIRMED or PENDING bookings; however, CANCELLED or NO_SHOW bookings MUST restore the slot to AVAILABLE even when a recurring block covers the same window.
- **FR-008**: The system MUST avoid role-based discrepancies where one role sees recurring blocks in one view but not the other.
- **FR-009**: The system MUST preserve 60-minute granularity for AVAILABLE slots in list view; recurring-block injection must not collapse available gaps into variable-length segments, except where strict player-view schedule window boundaries require clamping (see FR-014).
- **FR-010**: When an available gap starts at a non-hour boundary (e.g., 07:30) due to an adjacent recurring block, the system MUST render it as a full 60-minute AVAILABLE slot from that start time (e.g., 07:30–08:30), not truncated to the gap's natural end, except where strict player-view schedule window boundaries apply (see FR-013 and FR-014).
- **FR-011**: Recurring-block rows rendered in list view MUST have `actionable: false` for all roles; they present no booking or editing interaction target.
- **FR-012**: When `recurringRules` is an empty array, the derivation output MUST be byte-for-byte equivalent in structure to the pre-024 derivation — same number of rows, same 60-minute slot boundaries, same status values.
- **FR-013**: In player list view, derived time slots MUST remain fully within configured schedule start and end times; no displayed slot may start before daily start time or end after daily end time.
- **FR-014**: In player list view, if the final derived AVAILABLE slot would extend past configured daily end time, the slot MUST be truncated to end exactly at daily end time (for example, 21:30–22:00).

### Key Entities *(include if feature involves data)*

- **Recurring Unavailable Block**: A repeating time interval that marks a court as unavailable on matching dates.
- **View Availability Segment**: A rendered date-time availability state shown in list or calendar mode.
- **Schedule Context**: A date range and role context used to load and display availability.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For a verified sample of recurring blocks, 100% of blocked date-time ranges visible in calendar are also visible in list for the same role and date range.
- **SC-002**: For a verified sample of recurring blocks, 100% of blocked date-time ranges visible in player views match admin views for equivalent schedule periods.
- **SC-003**: During validation, no cross-view mismatches are found across at least 14 consecutive days of recurring block coverage.
- **SC-004**: Support reports related to recurring-block view mismatch drop to zero in the first release cycle after rollout.
- **SC-005**: For any date with no configured recurring blocks, the list view renders an output structurally identical to the pre-024 derivation (same slot count, same hour boundaries, same statuses) — verified by unit comparison against the original derivation logic.

## Assumptions

- Existing recurring block definitions and schedule data remain the source of truth; this feature aligns rendering behavior across views.
- No new user roles are introduced; scope covers current player and admin experiences only.
- Existing unavailable-state visual styling remains unchanged; this feature addresses consistency of visibility, not redesign.
- The fix applies to current list and calendar navigation patterns without introducing new interaction modes.

## Clarifications

### Session 2026-04-22

- Q: Should AVAILABLE slot granularity remain fixed at 60 minutes after recurring-block injection, or can segments be variable-length? → A: Preserve 60-minute AVAILABLE slot granularity; recurring-block segments are injected at their exact time boundaries, but the remaining available gaps must be re-expanded into contiguous 60-minute slots (not one large variable-length segment).
- Q: How should a partial available gap (less than 60 min) adjacent to a recurring block boundary be rendered in list view? → A: Render as a full 60-minute AVAILABLE slot starting at the gap's actual start time (e.g., gap starts at 07:30 → display 07:30–08:30), regardless of where the adjacent recurring block begins.
- Q: When a CANCELLED or NO_SHOW booking overlaps a recurring unavailable block, which wins? → A: The CANCELLED/NO_SHOW booking restores the slot to AVAILABLE — recurring blocks are suppressed for cancelled/no-show booking windows.
- Q: Should recurring-block rows in list view be actionable (interactive)? → A: `actionable: false` for all recurring-block rows in both player and admin list views — they are never interactive.
- Q: When `recurringRules` is empty, must `composeAvailabilitySegments` output be identical to the pre-024 derivation? → A: Yes — with an empty `recurringRules` array the list view must produce exactly the same 60-minute AVAILABLE slots and booking rows as the pre-024 code; any deviation is a regression.
- Q: Should strict start/end-time clamping apply to player view only or both roles? → A: Player view only; player list slots must stay fully within configured start and end time boundaries.
- Q: In player list view, when the final 60-minute slot would cross the configured end time, should it be truncated, omitted, or shifted? → A: Truncate the final player slot to the boundary (for example, 21:30–22:00).
