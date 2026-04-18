# Feature Specification: Admin Report Refinements

**Feature Branch**: `019-admin-report-refinements`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "Admin report, implemented in 018. 01. Pending breakdown not required, remove 02. Keep outstanding pending by player 03. PAID breakdown, open in a modal and implement pagination as well 04. Admin calendar make list view default"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Simplified Admin Report Review (Priority: P1)

As an admin, I want the financial report to keep the summary totals and the outstanding pending-by-player section while removing the separate pending breakdown so I can focus on balances that still require action.

**Why this priority**: This removes redundant report detail without losing the information admins need for collections follow-up and period review.

**Independent Test**: Open the report for a date range and confirm the report still shows PAID and PENDING summary totals, keeps the outstanding pending-by-player section, and no longer shows a standalone pending breakdown section.

**Acceptance Scenarios**:

1. **Given** an admin opens the financial report for a selected date range, **When** the report loads, **Then** PAID and PENDING summary totals are shown for that range.
2. **Given** the report contains pending balances, **When** the admin reviews the report, **Then** the outstanding pending-by-player section remains available with slot details.
3. **Given** the report page is rendered, **When** the admin scans the detailed sections, **Then** no separate pending breakdown section is shown.
4. **Given** there are no pending balances in the selected date range, **When** the outstanding pending section is displayed, **Then** it shows an explicit zero or empty state.

---

### User Story 2 - Review Paid Entries Without Crowding the Main Report (Priority: P1)

As an admin, I want the paid breakdown to open in a dedicated modal with pagination so I can inspect collected entries without overwhelming the main report page.

**Why this priority**: Paid detail is still useful for audit and verification, but it should not dominate the default report view.

**Independent Test**: Open the paid breakdown from the report, verify the detail appears in a modal, and verify page navigation allows access to every paid entry for date ranges with more than one page of data.

**Acceptance Scenarios**:

1. **Given** the selected date range contains paid entries, **When** the admin opens the paid breakdown, **Then** the paid records are shown in a modal instead of inline on the report page.
2. **Given** the paid breakdown spans multiple pages, **When** the admin changes pages, **Then** the modal updates to show the corresponding subset of paid entries.
3. **Given** the admin reviews all pages of the paid breakdown, **When** the visible entries are considered together, **Then** they reconcile with the paid totals in the summary section.
4. **Given** the selected date range has no paid entries, **When** the admin attempts to review paid details, **Then** the report provides a clear zero or empty-state response.

---

### User Story 3 - Open Admin Booking on List View by Default (Priority: P2)

As an admin, I want the booking screen to open in list view by default so I can begin from the more actionable schedule layout without changing views first.

**Why this priority**: The list view is the preferred operational view for daily booking management, so making it the default reduces repetitive switching.

**Independent Test**: Open the admin booking screen from a fresh navigation and verify the list view is shown first while calendar view remains available through the existing view switch control.

**Acceptance Scenarios**:

1. **Given** the admin navigates to the booking management screen, **When** the page loads, **Then** list view is shown by default.
2. **Given** the admin starts in the default list view, **When** they switch to calendar view, **Then** the selected date remains aligned between both views.
3. **Given** the admin returns to the booking screen in a new visit, **When** the page loads again, **Then** list view is used as the default starting layout.

### Edge Cases

- A selected date range has no paid entries; the paid-detail entry point still gives a clear empty-state result.
- A selected date range has enough paid entries to span multiple pages; the final page may contain fewer items than earlier pages.
- A selected date range has pending balances but no standalone pending breakdown; the outstanding pending-by-player section still exposes who requires follow-up.
- The admin opens the booking screen directly from navigation or by refreshing the page; list view remains the default initial layout.
- The admin switches from the default list view to calendar view after changing date; both views continue to reference the same selected date.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST retain the existing admin financial report date-range workflow and summary totals for PAID and PENDING values.
- **FR-002**: The system MUST remove the standalone pending breakdown section from the admin financial report.
- **FR-003**: The system MUST retain the outstanding pending-by-player section, including slot details needed for payment follow-up.
- **FR-004**: The system MUST present paid breakdown details only through an explicit open action that displays them separately from the main report page.
- **FR-005**: The paid breakdown view MUST support pagination when the number of paid entries exceeds a single page.
- **FR-006**: The full set of paid breakdown entries across all pages MUST reconcile to the paid totals shown in the report summary.
- **FR-007**: The system MUST continue to support date-range reporting without requiring player selection.
- **FR-008**: The existing no-show and cancellation financial impact section MUST remain available within the admin financial report.
- **FR-009**: The admin booking interface MUST open in list view by default.
- **FR-010**: The admin booking interface MUST continue to allow switching between list and calendar views after initial load.
- **FR-011**: When the admin switches between list and calendar views, the selected date and displayed schedule context MUST remain aligned.
- **FR-012**: The report MUST provide explicit zero or empty states when no paid records or no pending balances exist for the selected date range.
- **FR-013**: Access to the refined report and booking-management views MUST remain limited to admin-authorized users.

### Key Entities *(include if feature involves data)*

- **Report Date Range**: The start and end dates used to scope all report outputs.
- **Payment Summary Totals**: The top-level PAID and PENDING hours and amounts shown for the selected range.
- **Paid Breakdown Entry**: A paid booking record shown in the paid-detail view, including player-identifying information and contribution to paid totals.
- **Outstanding Pending Player Record**: A player-level pending balance record with the slot details needed for collections follow-up.
- **Revenue Impact Summary**: The no-show and cancellation totals shown for the selected range.
- **Admin Booking View State**: The initial and current view mode used when the admin opens and navigates the booking screen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In QA, 100% of sampled report runs show no standalone pending breakdown while still showing summary totals and the outstanding pending-by-player section.
- **SC-002**: In QA, 100% of sampled multi-page paid datasets allow admins to access every paid entry through modal page navigation.
- **SC-003**: In QA, paid breakdown totals reconcile to the paid summary total for 100% of sampled date ranges.
- **SC-004**: In QA, 100% of sampled entries to the admin booking screen open in list view on initial load.
- **SC-005**: In UAT, at least 95% of admins can review paid details for a selected date range without losing context from the main report page.
- **SC-006**: In QA, 100% of sampled date ranges with pending balances still expose player-level outstanding follow-up information.

## Assumptions

- The financial report introduced in feature 018 remains the baseline experience unless explicitly changed by this refinement.
- Only the standalone pending breakdown is removed; summary totals, outstanding pending by player, and revenue impact remain in scope.
- Pagination size can follow existing admin interface conventions.
- Defaulting the admin booking screen to list view changes the starting layout only; admins can still switch views afterward.
- Existing admin authorization rules continue to govern access to both the report and booking-management screens.