# Quickstart: Fix Paid Modal UI

## Goal

Verify that paid-details modal UX issues are resolved and PAID breakdown is rendered last on the report page.

## Prerequisites

- Authenticated admin session
- Dataset with:
  - enough paid entries to span multiple pages
  - a date range with zero paid entries
- Access to admin financial reports screen

## Scenario 1: First paid record is visible on open

1. Open admin financial reports.
2. Select a date range with paid entries.
3. Open paid details modal.

Expected:

- First record is fully visible immediately.
- No clipping at top boundary.

## Scenario 2: Close icon is visible and functional

1. Open paid details modal.
2. Verify close icon is visible in modal chrome.
3. Click close icon.

Expected:

- Modal closes immediately.

## Scenario 3: Pagination area is correctly visible

1. Open modal with multi-page paid data.
2. Verify previous/next controls and page indicator are visible.
3. Navigate across pages including first and last pages.

Expected:

- Pagination remains visible and aligned.
- Boundary disable states are correct.
- Controls are not clipped or overlapped.

## Scenario 4: Empty-state stability

1. Select date range with zero paid entries.
2. Open paid details.

Expected:

- Empty state text is fully visible.
- Close icon and modal actions remain visible.

## Scenario 5: PAID breakdown section appears last

1. Load report page with any data.
2. Scan section order from top to bottom.
3. Change date range and recheck order.

Expected:

- PAID breakdown section is always rendered last.

## Validation Notes

- Run `npm run lint` after implementation.
- If full repository lint fails due pre-existing unrelated issues, run focused lint on touched 020 files and record both results.

## Current QA Status

- 2026-04-18: Focused diagnostics and focused ESLint pass for touched 020 files.
- 2026-04-18: Full `npm run lint` still reports pre-existing unrelated repository errors outside feature 020 scope.
- 2026-04-18: Manual UI walkthrough for Scenarios 1-5 is pending in an authenticated admin session.