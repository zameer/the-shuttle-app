# Data Model: Paid Detail Status + Booking-Status Filters

## Overview

This feature introduces no database schema changes. New entities are TypeScript-level view/filter models derived from existing booking rows.

## Entities

### 1. DetailStatusScope

- Type: string union
- Values: `PAID` | `OUTSTANDING`
- Purpose: Primary scope selector on Paid Detail page
- Default: `PAID`

Proposed type:

```ts
export type DetailStatusScope = 'PAID' | 'OUTSTANDING'
```

### 2. OutstandingBookingStatus

- Type: string union
- Values (minimum required): `CONFIRMED` | `CANCELLED` | `NO_SHOW`
- Purpose: Multi-select values when scope is `OUTSTANDING`
- Default selected set: all values selected

Proposed type:

```ts
export type OutstandingBookingStatus = 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'
```

### 3. PaidDetailFilterState

Represents filter state used by `PaidDetailPage` and `usePaidDetail`.

Fields:

- `startDate: string` (YYYY-MM-DD)
- `endDate: string` (YYYY-MM-DD)
- `scope: DetailStatusScope`
- `outstandingStatuses: OutstandingBookingStatus[]`

Notes:

- `outstandingStatuses` applies only when `scope === 'OUTSTANDING'`.
- On initial load, `scope = 'PAID'` and `outstandingStatuses = ['CONFIRMED', 'CANCELLED', 'NO_SHOW']`.

### 4. PaidDetailRow (existing alias usage retained)

- Existing semantic alias of normalized financial booking row.
- Row inclusion logic changes by filter state:
  - Scope `PAID`: include paid rows.
  - Scope `OUTSTANDING`: include non-paid rows and only selected booking statuses.

### 5. PaidDetailSummary

Summary remains aggregate of current filtered rows:

- `totalAmount: number`
- `totalHours: number`
- `totalBookings: number`

## Validation Schemas

### Scope Schema

```ts
z.enum(['PAID', 'OUTSTANDING'])
```

### Outstanding Status List Schema

```ts
z.array(z.enum(['CONFIRMED', 'CANCELLED', 'NO_SHOW'])).min(1)
```

### Filter Input Schema

Composed schema containing date range, scope, and outstanding status list.

## State Transitions

1. Initial load:
- `scope = 'PAID'`
- `outstandingStatuses = ['CONFIRMED', 'CANCELLED', 'NO_SHOW']`
- `currentPage = 1`

2. Scope change:
- Update `scope`
- Keep date range unchanged
- Reset `currentPage = 1`

3. Outstanding status selection change:
- Update `outstandingStatuses`
- Reset `currentPage = 1`

4. Date change:
- Update date field(s)
- Reset `currentPage = 1`
