# Feature Specification: Header Quote Layout and All-Time Dashboard Metrics

**Feature Branch**: `007-header-quote-dashboard-all`  
**Created**: 2026-04-16  
**Status**: Draft  
**Input**: User description: "display quote right to the header text. admin dashboard metrics for all booking days"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - All-Time Admin Dashboard Metrics (Priority: P1)

As an admin, I can view aggregated metrics totalling all booking days on the dashboard — not just
today — so I have a complete, always-accurate picture of overall court operations at a glance.

**Why this priority**: Showing only today's metrics hides the club's overall financial and
operational history. All-time totals are more actionable for business decisions and require no
date selection from the admin.

**Independent Test**: Open the admin dashboard and verify that the four metric cards (Total
Bookings, Expected Revenue, Revenue Collected, Pending) display cumulative totals across all
recorded booking days, not just today's figures.

**Acceptance Scenarios**:

1. **Given** the admin is on the dashboard, **When** the page loads, **Then** the metric cards
   show totals aggregated across all booking days (not just today).
2. **Given** multiple bookings exist across different calendar days, **When** the dashboard
   displays, **Then** all bookings are reflected in the metric totals regardless of date.
3. **Given** there are no bookings at all, **When** the dashboard displays, **Then** all metric
   values show zero with no error state.

---

### User Story 2 - Quote Displayed Beside Header Title (Priority: P2)

As a player, I see the motivational quote positioned to the right of the "THE SHUTTLE" title
text inside the header bar, so the header is more compact and the quote feels visually integrated
with the branding rather than stacked below it.

**Why this priority**: The stacked layout makes the header taller than necessary on mobile; a
side-by-side layout keeps the header slim and the quote visible without taking vertical space
away from the calendar content.

**Independent Test**: Open the player calendar page and verify the quote appears in the same
visual row as or immediately beside the "THE SHUTTLE" title, not below the subtitle line.

**Acceptance Scenarios**:

1. **Given** a player opens the calendar page, **When** the header loads, **Then** the
   motivational quote is displayed to the right of the "THE SHUTTLE" title text within the
   same header row.
2. **Given** the quote is displayed beside the title, **When** the viewport is mobile width
   (≥375 px), **Then** the quote remains readable and does not overlap the bell icon or title.
3. **Given** the quote is long, **When** displayed beside the title on a narrow screen,
   **Then** the quote text wraps or truncates gracefully without breaking the header layout.

### Edge Cases

- When the `QUOTES` array is empty, the header must still render correctly with the title
  and bell icon visible (no empty space gap where the quote would be).
- On very narrow screens the bell icon must remain accessible alongside the quote-and-title area.
- Dashboard metrics query must handle the case where the `dashboard_metrics` view or table
  returns no rows, displaying zeros without an error state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The admin dashboard MUST aggregate and display total metrics across all available
  booking days, replacing the current single-day view.
- **FR-002**: The aggregated metrics MUST include: total booking count, total expected revenue,
  total collected revenue, and total pending revenue across all days.
- **FR-003**: The dashboard MUST display zero values gracefully when no booking data exists.
- **FR-004**: The player calendar page header MUST display the motivational quote to the right
  of the "THE SHUTTLE" title text within the same header area, not below the subtitle.
- **FR-005**: The quote layout MUST remain readable and non-overlapping at mobile (≥375 px),
  tablet (≥768 px), and desktop (≥1280 px) breakpoints.
- **FR-006**: When no quote is available, the header MUST render without an empty gap.

### Key Entities *(include if feature involves data)*

- **All-Time Metrics**: Aggregated summary of total bookings, total expected revenue, total
  collected revenue, and total pending revenue across all booking dates.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin dashboard shows totals reflecting 100% of all booking-day records on every
  page load.
- **SC-002**: Dashboard renders correctly (zero values) when no bookings exist — no error state
  or blank cards.
- **SC-003**: At least 95% of tested viewport widths display the quote beside the header title
  without overlapping the bell icon or title text.
- **SC-004**: Header height on mobile is equal to or shorter than the previous implementation
  (stacked quote removed).

## Assumptions

- The existing `dashboard_metrics` database view or table can be queried without a date filter
  to return all rows; aggregation is performed client-side or via a new Supabase query.
- The `QUOTES` static array and its day-of-year rotation logic remain unchanged; only the
  placement within the header changes.
- The bell icon retains its existing position on the far right of the header row.
- No new database tables or migrations are required for the dashboard change — the existing
  `dashboard_metrics` view supports an unfiltered aggregate query.
