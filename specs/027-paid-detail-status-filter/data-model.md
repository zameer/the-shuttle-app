# Data Model: Paid Detail Manual Load Flow

## Overview

No database schema changes are required. This feature introduces client-side state modeling for draft filters versus applied filters to control when detail data is fetched.

## Entities

### 1. DetailStatusScope

- Type: union
- Values: `PAID` | `OUTSTANDING`
- Purpose: Selects result scope in filter controls
- Default draft value: `PAID`

### 2. OutstandingBookingStatus

- Type: union
- Values: `CONFIRMED` | `CANCELLED` | `NO_SHOW`
- Purpose: Additional filtering when scope is OUTSTANDING
- Default draft set: all values selected

### 3. PaidDetailDraftFilters (new)

Editable filters that do not trigger fetch immediately.

Fields:
- `startDate: string`
- `endDate: string`
- `scope: DetailStatusScope`
- `outstandingStatuses: OutstandingBookingStatus[]`

### 4. PaidDetailAppliedFilters (new)

Snapshot of filters used for the most recent load action.

Fields:
- `startDate: string`
- `endDate: string`
- `scope: DetailStatusScope`
- `outstandingStatuses: OutstandingBookingStatus[]`

Behavior:
- Set only when Load Details is clicked.
- Drives query key and fetch parameters.

### 5. PaidDetailLoadState (new)

Represents whether a load action has occurred.

Fields:
- `hasLoadedOnce: boolean`

Behavior:
- `false` on initial page render.
- Becomes `true` after first successful load trigger.

### 6. PaidDetailOutput (existing)

Returned from service for applied filters:
- `rows: PaidDetailRow[]`
- `summary: PaidDetailSummary`

## Validation Schemas

- `paidDetailFilterInputSchema`: validates applied filters used by data-fetch hook.
- `outstandingBookingStatusesSchema`: enforces at least one selected outstanding status.

## State Transitions

1. Initial page open:
- Draft filters initialized.
- Applied filters unset or set to initial snapshot with query disabled.
- `hasLoadedOnce = false`.

2. Edit filters:
- Draft filters update.
- Result table and summary remain unchanged.

3. Click Load Details:
- Applied filters = draft filters snapshot.
- `hasLoadedOnce = true`.
- Query executes using applied filters.
- Pagination resets to page 1.

4. Pagination changes:
- Affects only current view of already loaded rows.
- No refetch until next load action.
