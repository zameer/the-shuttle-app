# Data Model: Fix Paid Modal UI

## 1. PaidModalViewState

- Purpose: Governs paid-details modal visibility and paging interactions.
- Fields:
  - `open`: boolean
  - `currentPage`: integer, minimum 1
  - `pageSize`: integer, positive
  - `totalPages`: integer, minimum 1 when entries exist, otherwise a UI-safe empty state indicator
- State transitions:
  - Closed -> Open on paid details trigger
  - Open -> Closed via close icon, close action, or overlay/escape behavior
  - Open page N -> Open page N+1/N-1 within bounds

## 2. PaidEntryPageSlice

- Purpose: Represents currently visible paid entries in modal body.
- Fields:
  - `entries`: ordered array of paid breakdown entries
  - `startIndex`: integer, zero-based
  - `endIndex`: integer, inclusive display bound
  - `totalEntries`: integer
- Validation rules:
  - `startIndex` and `endIndex` must always map to the selected page bounds
  - Empty dataset maps to a stable empty-state display

## 3. PaginationControlState

- Purpose: Controls pagination action availability and display text.
- Fields:
  - `canGoPrevious`: boolean
  - `canGoNext`: boolean
  - `pageLabel`: string (for example current/total)
- Validation rules:
  - Previous is disabled on first page
  - Next is disabled on last page
  - Control visibility remains stable across one-page and multi-page datasets

## 4. ReportSectionOrder

- Purpose: Defines visual ordering of report sections.
- Fields:
  - `summarySectionPosition`
  - `outstandingPendingSectionPosition`
  - `revenueImpactSectionPosition`
  - `paidBreakdownSectionPosition`
- Rule:
  - `paidBreakdownSectionPosition` must be last among report content sections in this feature scope

## Security and Integrity Notes

- No new database entities, migrations, or RLS changes are introduced.
- Existing paid breakdown aggregation remains unchanged; this feature only adjusts presentation and section ordering.
- Admin-only access remains controlled by existing protected routing.