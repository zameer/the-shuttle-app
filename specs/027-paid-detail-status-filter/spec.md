# Feature Specification: Paid Detail Status Filter

**Feature Branch**: `029-setup-spec-invocation`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "026 paid-detail page only shows PAID records, but I should be able select status, PAID default, OUTSTANDING select option should also be there.

then should be able to see details of CONFIRMED, CANCELLED, NO SHOW records as well"

## Clarifications

### Session 2026-05-01

- Q: Where should admins switch between PAID and OUTSTANDING? -> A: On the Paid Detail page only, in the same filter section as Start Date and End Date.
- Q: How should CONFIRMED, CANCELLED, and NO_SHOW filters be applied? -> A: Add a second booking-status multi-select filter; default CONFIRMED, CANCELLED, and NO_SHOW all enabled.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Switch Payment Status Scope (Priority: P1)

As an admin reviewing bookings, I can choose whether the detail page shows paid bookings or outstanding bookings, with PAID selected by default.

**Why this priority**: Without this control, admins cannot inspect unpaid risk from the same detail workflow and must rely on separate sections or manual tracing.

**Independent Test**: Open Paid Detail, confirm PAID is selected by default, switch to OUTSTANDING, and verify the table updates to show only outstanding records.

**Acceptance Scenarios**:

1. **Given** the admin opens the detail page, **When** no additional action is taken, **Then** the selected status scope is PAID by default and the switch is visible in the page's filter section with the date controls.
2. **Given** the page is loaded, **When** the admin switches the status scope to OUTSTANDING, **Then** the displayed rows update to only outstanding records in the selected date range.
3. **Given** the admin switches between PAID and OUTSTANDING, **When** each selection is applied, **Then** the page refreshes data and summary values for that selection without requiring navigation away from the page.

---

### User Story 2 - Review Booking Outcomes for Outstanding Records (Priority: P1)

As an admin tracking unpaid bookings, I can view row-level booking outcomes (such as CONFIRMED, CANCELLED, and NO SHOW) while viewing OUTSTANDING records.

**Why this priority**: Outstanding follow-up decisions depend on both payment state and booking outcome; unpaid confirmed sessions and unpaid cancellation/no-show sessions need different actions.

**Independent Test**: Select OUTSTANDING, verify booking-status multi-select defaults to CONFIRMED+CANCELLED+NO_SHOW, then change selections and confirm rows update to only the selected booking statuses.

**Acceptance Scenarios**:

1. **Given** OUTSTANDING is selected, **When** the page loads, **Then** the booking-status multi-select is visible with CONFIRMED, CANCELLED, and NO_SHOW selected by default.
2. **Given** OUTSTANDING is selected, **When** no matching records exist for the date range, **Then** the page shows an empty-state message instead of stale or unrelated rows.
3. **Given** OUTSTANDING is selected and mixed booking outcomes exist, **When** the admin changes booking-status selections, **Then** the table shows only rows matching the selected booking statuses.
4. **Given** OUTSTANDING is selected and matching records exist, **When** the admin scans the list, **Then** each row clearly shows booking status and payment status as separate data points.

### Edge Cases

- What happens when the selected date range contains PAID records but no OUTSTANDING records (or vice versa)? The table and summary should show zero-state results for the current selection only.
- What happens when the admin changes the status scope while on a later pagination page? Pagination resets to the first page for the newly selected scope.
- What happens when the selected range includes only cancelled/no-show outstanding records? Those rows remain visible and are not excluded from OUTSTANDING results.
- How does the system handle an invalid date range entered by the admin? The page should prevent misleading results and show a clear validation message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The detail page MUST provide a status scope selector with at least `PAID` and `OUTSTANDING` options in the Paid Detail page filter section alongside Start Date and End Date.
- **FR-002**: The default selected status scope MUST be `PAID` when the page is first opened.
- **FR-003**: When `PAID` is selected, the page MUST display only records that are treated as paid.
- **FR-004**: When `OUTSTANDING` is selected, the page MUST display only records that are not treated as paid.
- **FR-005**: The selected date range MUST continue to constrain records for both status scope options.
- **FR-006**: The page summary metrics MUST update to reflect only records in the current status scope and date range.
- **FR-007**: Under `OUTSTANDING`, the table MUST preserve row-level booking status values including `CONFIRMED`, `CANCELLED`, and `NO_SHOW` when present in matching records.
- **FR-008**: The table MUST continue to show booking status and payment status as separate columns for each row.
- **FR-009**: Changing status scope MUST refresh the result set without requiring page navigation.
- **FR-010**: Changing status scope MUST reset pagination to the first page.
- **FR-011**: If no records match the selected status scope and date range, the page MUST show a clear empty-state message.
- **FR-012**: Existing navigation behavior (open detail view and return to reports) MUST remain available.
- **FR-013**: When `OUTSTANDING` is selected, the page MUST provide a booking-status multi-select control including at least `CONFIRMED`, `CANCELLED`, and `NO_SHOW`.
- **FR-014**: The booking-status multi-select under `OUTSTANDING` MUST default to all three options selected (`CONFIRMED`, `CANCELLED`, and `NO_SHOW`).
- **FR-015**: Under `OUTSTANDING`, the table result set MUST satisfy both the selected date range and the selected booking-status filter values.

### Key Entities *(include if feature involves data)*

- **Status Scope Filter**: Represents the admin-selected grouping for the detail page (`PAID` or `OUTSTANDING`).
- **Detail Booking Record**: Represents one booking row shown in the detail table with date/time, player details, booking status, payment status, and amount.
- **Filtered Summary**: Represents aggregate totals (amount, hours, count) calculated only from records matching the active date range and status scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of first-time visits to the detail page start with `PAID` selected by default.
- **SC-002**: In admin UAT, switching between `PAID` and `OUTSTANDING` updates the table and summary correctly in at least 95% of sampled date ranges on first attempt.
- **SC-003**: For test datasets containing outstanding `CONFIRMED`, `CANCELLED`, and `NO_SHOW` rows, those rows are visible under `OUTSTANDING` in 100% of verification runs.
- **SC-004**: When no rows match the current filter, the empty-state message is shown in 100% of tested scenarios and no out-of-scope rows appear.

## Assumptions

- `OUTSTANDING` means any booking record not classified as paid.
- The existing date-range controls remain the primary time filter for the detail page.
- The detail page continues to support row-level operational review rather than grouped rollups only.
- Existing access control and admin navigation behavior remain unchanged for this enhancement.
