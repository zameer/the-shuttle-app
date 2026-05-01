# Feature Specification: Admin Calendar Landing & Paid Report Detail

**Feature Branch**: `026-admin-calendar-paid-detail`  
**Created**: 2026-05-01  
**Status**: Draft  
**Input**: User description: "01. admin landing Dashboard not required and load Calendar instead. 02. admin/reports PAID breakdown, I should be able to check detail breakdown of booking, confirmed and payment status. load in a seperate model or page. if page is seperate provide a way to navigate back. you can think and add sufficient information. prefer a date range picker"

---

## Clarifications

### Session 2026-05-01

- Q: What UI control should the paid detail page's date range picker use? → A: Two separate `<input type="date">` fields (same style as the parent Financial Reports page; no compound calendar popover)
- Q: Should quick preset date range shortcuts (e.g., "This month", "Last 30 days") be included alongside the date inputs? → A: No — date inputs only, matching the parent Reports page exactly

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Calendar as Admin Landing Page (Priority: P1)

As an admin, I want the Calendar to be the first screen I see after logging in so I can immediately view and manage today's bookings without an extra navigation step.

**Why this priority**: The Dashboard (all-time metrics summary) provides limited operational value compared to the Calendar, which is the primary daily tool for managing bookings. Removing the dashboard as the landing page reduces friction and makes the admin workflow faster.

**Independent Test**: Log in as admin (or navigate to `/admin`) and confirm the Calendar page is displayed. Confirm the Dashboard is either removed from navigation or demoted so the Calendar serves as the true entry point. All existing calendar functionality remains unchanged.

**Acceptance Scenarios**:

1. **Given** an admin successfully authenticates, **When** they are redirected to the admin area, **Then** the Calendar page is shown immediately without an intermediate dashboard step.
2. **Given** an admin navigates directly to `/admin`, **When** the route resolves, **Then** the Calendar page content is displayed (not the all-time metrics dashboard).
3. **Given** the admin is already on any admin page, **When** they click the top-level admin brand/logo or the "home" nav entry, **Then** the Calendar page is shown.
4. **Given** the admin navigation bar exists, **When** the admin reviews the nav items, **Then** "Calendar" is listed as the primary/first navigation destination and the "Dashboard" entry is either removed or moved to a secondary position.
5. **Given** the existing calendar features (list/calendar toggle, date navigation, booking management), **When** the Calendar loads as the landing page, **Then** all existing calendar interactions remain fully functional.

---

### User Story 2 — Detailed Paid Booking Breakdown with Date Range Filter (Priority: P1)

As an admin, I want to view a full line-by-line breakdown of every paid booking within a selected date range — including booking date, time slot, player name, confirmation status, and payment status — so I can audit collections and verify individual payments without guessing.

**Why this priority**: The current paid breakdown groups entries by player with aggregated totals. Admins need per-booking visibility to reconcile individual payments, resolve disputes, and confirm which specific slots were paid.

**Independent Test**: Open the paid detail breakdown from the Reports page for a date range that contains paid bookings. Confirm each individual booking is shown as a separate row with its date, time, player name, confirmation status, and payment status. Confirm the date range selector controls which bookings appear. Confirm navigation back to the Reports page is available.

**Acceptance Scenarios**:

1. **Given** the admin is on the Financial Reports page, **When** they open the paid detail breakdown, **Then** a dedicated view (separate page or large modal) opens showing all paid bookings for the current report date range.
2. **Given** the paid detail view is open, **When** the admin reviews the entries, **Then** each row shows: booking date, start and end time, court identifier (if applicable), player name, player contact, booking confirmation status, and payment status.
3. **Given** the paid detail view has its own date range picker, **When** the admin changes the start or end date, **Then** the list of displayed bookings updates to reflect only paid bookings within the new range.
4. **Given** the paid detail view is a separate page, **When** the admin wants to return to the Reports page, **Then** a clearly labeled back link or button navigates them back without losing the previously selected report date range.
5. **Given** the selected date range produces more entries than fit on one screen, **When** the admin scrolls or pages, **Then** all paid entries within the range remain accessible.
6. **Given** the selected date range has no paid bookings, **When** the detail view loads, **Then** an explicit empty-state message is shown (e.g., "No paid bookings for this period").
7. **Given** a booking row shows a specific payment status, **When** the admin scans the list, **Then** the payment status label (e.g., Paid, Confirmed, Pending) is visually distinct so it can be identified at a glance.
8. **Given** the paid detail view shows a summary header, **When** the view loads, **Then** the total paid amount and total paid hours for the filtered range are displayed at the top for quick reference.

---

### Edge Cases

- The date range start date is after the end date: the system should prevent or correct this gracefully and not show data.
- The paid detail view is opened for a date range that spans a very long period (e.g., full year): all entries must remain accessible via pagination or scrolling without performance degradation.
- An admin navigates directly to the paid detail page URL without coming from the Reports page: the back button still works (navigates to Reports page).
- The admin opens the paid detail view, changes the date range, then navigates back: the Reports page retains its original date range (the detail view's date range is independent).
- A booking has a confirmation status but no payment record (or vice versa): both fields are shown independently; missing data displays a clear placeholder (e.g., "—").
- The admin Dashboard page still exists in the codebase and is accessible via direct URL; it is just no longer the landing page.

---

## Requirements *(mandatory)*

### Functional Requirements

**Landing Page Change**

- **FR-001**: The admin area root path (`/admin`) MUST resolve to the Calendar page instead of the Dashboard page.
- **FR-002**: The Calendar MUST remain accessible at its existing `/admin/calendar` path in addition to being the landing destination.
- **FR-003**: The admin navigation MUST reflect the Calendar as the primary destination; the Dashboard entry MUST be removed from the main navigation or clearly demoted so it no longer appears as the default landing item.
- **FR-004**: All existing Calendar page functionality (list/calendar view toggle, date navigation, booking creation, booking editing, booking cancellation) MUST continue to work without modification.
- **FR-005**: Any existing deep links or bookmarks to `/admin/calendar` MUST continue to work.

**Paid Breakdown Detail View**

- **FR-006**: The Financial Reports page MUST provide an entry point (button or link) to open the paid booking detail view.
- **FR-007**: The paid booking detail view MUST open as a separate dedicated page at a sub-path of `/admin/reports` (e.g., `/admin/reports/paid-detail`) OR as a full-screen modal; the implementation choice MUST include a clear and functional back/close action that returns the admin to the Reports page.
- **FR-008**: The paid booking detail view MUST include its own date range filter using two separate date inputs (start date + end date, rendered as `<input type="date">` fields consistent with the parent Financial Reports page) so the admin can independently filter the displayed bookings without affecting the parent report's date range. No preset shortcuts are included.
- **FR-009**: The paid detail view MUST display one row per individual paid booking, not grouped by player.
- **FR-010**: Each paid booking row MUST include: booking date, booking start time, booking end time, player full name, player contact number, booking confirmation status, and payment status.
- **FR-011**: The paid detail view MUST display a summary header showing the total paid amount (LKR) and total paid hours for the current date range filter.
- **FR-012**: The paid detail view MUST handle pagination or scrolling to ensure all entries in the selected date range are accessible without truncation.
- **FR-013**: Payment status and confirmation status MUST be visually distinguishable using labels, badges, or color coding to allow rapid scanning.
- **FR-014**: When the selected date range contains no paid bookings, the view MUST display an explicit empty-state message.
- **FR-015**: The paid detail view date range MUST default to the same date range used on the parent Reports page at the time the detail view is opened, so the context is immediately consistent.
- **FR-016**: The paid detail view MUST be accessible only to authenticated admin users; unauthorized access MUST redirect to the login page.

### Key Entities

- **Paid Booking Detail Row**: A single individual booking record with status `paid`. Attributes: booking ID, booking date, start time, end time, player name, player contact, confirmation status, payment status, booking amount (LKR).
- **Date Range Filter**: A pair of start and end dates used to scope the paid detail query. Independent from the parent report's date range once the detail view opens.
- **Summary Header**: Aggregated totals for the current date range — total paid amount and total paid hours — shown at the top of the paid detail view.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can reach the Calendar immediately after login with zero additional navigation steps (0 clicks past the initial redirect).
- **SC-002**: The paid booking detail view renders all individual paid entries for a given date range, with each booking's date, time, player, confirmation status, and payment status visible without scrolling horizontally on a standard desktop screen.
- **SC-003**: Changing the date range in the paid detail view updates the displayed entries within 2 seconds under normal network conditions.
- **SC-004**: An admin can navigate from the paid detail view back to the Reports page in a single action (one click on a back button/link).
- **SC-005**: The paid detail summary header totals reconcile with the paid totals shown in the parent Financial Reports summary for the same date range.
- **SC-006**: Admins report reduced time spent per payment audit session compared to the previous grouped-by-player modal (qualitative baseline to be measured after rollout).
- **SC-007**: No existing admin functionality (booking management, calendar navigation, report generation) is broken or degraded by the landing page change.

---

## Assumptions

- The existing `AdminDashboardPage` (all-time metrics) is NOT deleted — it remains accessible via direct URL (`/admin/dashboard` or similar) but is no longer the index route. The spec does not require its deletion, only its demotion from the default landing.
- The paid booking detail data is sourced from the same `bookings` table already used by the financial report; no new Supabase tables or schema changes are required.
- Each booking row already carries a payment status field (e.g., `paid`, `pending`) and a confirmation status field that can be read directly from existing data.
- The existing date range filter on the Financial Reports page (start/end date inputs) sets the initial date range passed to the paid detail view; the detail view holds its own independent copy of the range.
- Pagination for the paid detail view follows the same page-size convention already used in `PaidBreakdownModal` (8 entries per page) unless the implementation uses scrolling instead.
- The paid detail view is a **separate page** (preferred over a modal) to allow deeper linking, a wider layout for tabular data, and a natural back-navigation pattern — but a large scrollable modal is acceptable if the page approach introduces routing complexity.
- Admin authentication and authorization continue to be enforced by the existing `AdminProtectedRoute` guard; no new auth logic is required.
- Currency is LKR throughout; no multi-currency support is in scope.
- Mobile responsiveness for the paid detail table is a stretch goal; desktop-first layout is the primary target for this feature.
- The date range filter on the paid detail page uses two separate `<input type="date">` fields (matching the parent Reports page); no compound calendar picker or preset shortcuts are in scope.
