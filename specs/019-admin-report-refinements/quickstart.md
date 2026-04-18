# Quickstart: Admin Report Refinements

## Goal

Validate that feature 019 refines the existing admin report and booking experience without regressing summary accuracy, outstanding pending workflows, or admin calendar/list synchronization.

## Prerequisites

- Admin-authenticated session
- Seed or test data containing:
  - paid bookings across more than one page of paid detail
  - pending bookings with slot details
  - no-show and cancelled bookings
- Existing admin booking screen accessible from navigation

## Scenario 1: Main report no longer shows pending breakdown

1. Open the admin financial report page.
2. Select a date range containing paid and pending bookings.
3. Verify summary cards still show paid and pending hours and amounts.
4. Verify the outstanding pending-by-player section remains visible with slot details.
5. Verify there is no standalone pending breakdown section on the page.

Expected result:

- Summary values render normally.
- Outstanding pending remains actionable.
- Pending breakdown is absent from the main report page.

## Scenario 2: Paid breakdown opens in modal with pagination

1. From the report page, trigger the paid detail view.
2. Verify the detail opens in a modal.
3. Confirm the first page shows a subset of paid entries.
4. Move to the next page and verify the visible entries change.
5. Review all pages and confirm the combined paid entries reconcile to the paid summary totals.

Expected result:

- Paid detail is isolated to a modal.
- Pagination works without a full-page navigation.
- Paid totals remain reconciliation-safe.

## Scenario 3: Empty-state behavior for paid detail and outstanding pending

1. Select a date range with no paid entries.
2. Verify the report communicates the paid empty state clearly.
3. Select a date range with no pending balances.
4. Verify the outstanding pending section communicates an explicit empty or zero state.

Expected result:

- Empty states are explicit and stable.
- The page does not crash or show ambiguous blanks.

## Scenario 4: Admin booking opens in list view by default

1. Navigate to the admin booking page from a fresh visit or refresh.
2. Verify list view is shown first.
3. Change the selected date in list view.
4. Switch to calendar view.
5. Verify calendar mode reflects the same selected date.

Expected result:

- List view is the initial layout.
- View switching remains available.
- Selected date stays aligned across modes.

## Validation Notes

- Run `npm run lint` after implementation.
- Record any deviation between paid-detail totals and summary totals as a blocker.
- Record any case where the admin booking page starts in calendar view as a blocker.

## Current QA Status

- 2026-04-18: Automated implementation validation completed for touched 019 files with focused ESLint and diagnostics.
- 2026-04-18: Full `npm run lint` still fails due pre-existing unrelated repository errors outside feature 019.
- 2026-04-18: Manual browser QA for Scenarios 1-4 remains blocked in this environment because the admin routes require a valid authenticated admin session and the current session does not provide browser-content inspection or credentials to complete sign-in.