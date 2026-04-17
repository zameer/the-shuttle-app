# Feature Specification: List End-Time and Payment Visibility

**Feature Branch**: `016-setup-feature-branch`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "01. Player and Admin Calendar list view end showing 30 mins short 02. List view Booking beyond end time shows only upto endtime, but calendar view showing correct. 03. Admin list view, show payment status as well"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Align List End-Time Window (Priority: P1)

As a player or admin, I want list view to use the full expected end-time window so displayed slots and entries are not cut short.

**Why this priority**: Time-window truncation causes incorrect operational visibility for both staff and players.

**Independent Test**: Open list view for a date with late-day entries and verify the last visible slot/entry matches the expected end-time boundary used by calendar view.

**Acceptance Scenarios**:

1. **Given** list view is opened for any date, **When** the daily time window is rendered, **Then** the ending boundary matches the intended schedule end and is not shortened by 30 minutes.
2. **Given** admin and player list views are opened on the same date, **When** the time window is compared, **Then** both views show the same end-time boundary.

---

### User Story 2 - Show Late-Ending Bookings Correctly in List View (Priority: P1)

As a player or admin, I want bookings that extend beyond the nominal end boundary to remain correctly visible in list view so booking records are accurate and consistent with calendar view.

**Why this priority**: Inconsistency between list and calendar creates trust issues and can hide valid booking occupancy.

**Independent Test**: Create or view a booking that overlaps the end boundary and confirm list view still shows the booking correctly, matching calendar behavior.

**Acceptance Scenarios**:

1. **Given** a booking starts before the end boundary and ends after it, **When** list view is rendered, **Then** the booking remains visible as a booking entry rather than being clipped away.
2. **Given** calendar and list are viewed for the same date, **When** an overlapping end-boundary booking exists, **Then** both views represent that booking consistently.

---

### User Story 3 - Display Payment Status in Admin List View (Priority: P2)

As an admin, I want payment status shown directly in admin list rows so I can quickly track pending and paid bookings without opening each booking detail.

**Why this priority**: It reduces extra clicks and improves financial follow-up efficiency in day-to-day operations.

**Independent Test**: Open admin list view on a date with multiple bookings and verify each booking row shows a clear payment status value.

**Acceptance Scenarios**:

1. **Given** admin list view shows booking rows, **When** a booking has payment information, **Then** payment status is visible within the row.
2. **Given** bookings have mixed payment states, **When** admin scans the list, **Then** statuses are clearly distinguishable and accurate per booking.
3. **Given** an entry is an available/non-booking slot, **When** it is shown, **Then** payment status is not shown for that non-booking row.

### Edge Cases

- Bookings that end exactly at the schedule boundary should remain fully visible and not be treated as overflow.
- Bookings that cross midnight should follow the same date-context rules already used by the current calendar/list system.
- Very short terminal gaps near end-of-day should not incorrectly hide valid bookings.
- If payment status is missing or unknown, admin list should still render the row with a clear fallback payment indicator.
- Mixed statuses (booking status and payment status) must remain readable without ambiguity in dense list views.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render player and admin list views with the full intended daily end-time boundary and MUST NOT shorten it by 30 minutes.
- **FR-002**: The system MUST apply the same effective daily end-time window rules across player list view and admin list view.
- **FR-003**: The system MUST keep bookings visible in list view when a booking overlaps the end boundary.
- **FR-004**: The system MUST ensure list view and calendar view represent overlapping end-boundary bookings consistently.
- **FR-005**: The admin list view MUST display payment status for booking rows.
- **FR-006**: Payment status display in admin list view MUST clearly distinguish at least pending and paid states.
- **FR-007**: Non-booking rows in list view MUST NOT display payment status labels.
- **FR-008**: Payment status shown in admin list rows MUST reflect the latest persisted booking payment state.
- **FR-009**: End-time boundary fixes MUST preserve existing visibility behavior for valid bookings that do not overlap the end boundary.
- **FR-010**: The feature MUST preserve existing role-based visibility (admin-only payment status details in admin list).

### Key Entities *(include if feature involves data)*

- **List View Time Window**: The daily start/end display boundary used to derive list rows for both player and admin views.
- **Boundary-Overlapping Booking**: A booking whose end time extends beyond the list view end boundary but still belongs to the shown date context.
- **Admin Booking Row**: A list row representing a real booking in admin view, including booking status and payment status metadata.
- **Payment Status Indicator**: The visible value shown to admin users for a booking row to indicate payment progression.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In QA, 100% of tested list views show the correct daily end boundary with no 30-minute truncation.
- **SC-002**: In QA, 100% of tested bookings overlapping the end boundary are visible in list view and match calendar view representation.
- **SC-003**: In QA, 100% of admin booking rows display a payment status indicator when payment state exists.
- **SC-004**: In QA, admins can identify pending vs paid states from list view without opening booking details in at least 95% of sampled bookings.
- **SC-005**: In regression QA, no new discrepancies are found between player/admin list rendering for non-overlapping bookings.

## Assumptions

- Existing booking and payment state data remains the source of truth; this feature adjusts display consistency and visibility.
- Calendar view behavior is considered correct baseline for end-boundary handling.
- Payment status values already exist for bookings and can be surfaced in admin list rows.
- No new user roles are introduced; visibility remains aligned to existing admin/player access patterns.
- Date-context behavior near boundaries follows current product rules unless explicitly changed in future features.
