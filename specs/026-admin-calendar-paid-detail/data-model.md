# Data Model: Admin Calendar Landing & Paid Report Detail

**Feature**: 026-admin-calendar-paid-detail  
**Date**: 2026-05-01  
**Source**: spec.md + research.md decisions

---

## Overview

This feature introduces **no new database tables and no schema changes**. All data is derived from the existing `bookings` table via the existing Supabase client query pattern. The changes are confined to the TypeScript type layer and the client-side service/hook layer.

---

## 1. PaidDetailRow *(new)*

**Purpose**: Represents a single individual paid booking for display in the paid detail page. This is a semantic alias of `NormalizedFinancialBooking` restricted to `paymentBucket === 'PAID'` and active booking statuses.

**Source interface**: `NormalizedFinancialBooking` (existing, `src/features/admin/financial-reports/types.ts`)

**Fields used for display**:

| Field | Type | Display Label | Notes |
|-------|------|---------------|-------|
| `bookingId` | `string` | — | Row key only; not displayed |
| `slotStart` | `string` (ISO 8601) | Date, Start Time | Formatted with date-fns |
| `slotEnd` | `string` (ISO 8601) | End Time | Formatted with date-fns |
| `playerName` | `string \| null` | Player Name | Shows "—" if null |
| `playerPhoneNumber` | `string \| null` | Contact | Shows "—" if null |
| `bookingStatus` | `'PENDING' \| 'CONFIRMED' \| 'UNAVAILABLE' \| 'CANCELLED' \| 'NO_SHOW'` | Confirmation Status | Rendered via `PaidDetailStatusBadge` |
| `paymentBucket` | `'PAID' \| 'PENDING'` | Payment Status | Always `'PAID'` in this view; rendered via `PaidDetailStatusBadge` |
| `amount` | `number` | Amount (LKR) | Formatted as `LKR X,XXX` |
| `durationHours` | `number` | Duration | Formatted as `X.XX hrs` |

**TypeScript definition** (to be added to `types.ts`):
```ts
// PaidDetailRow is a type alias — no runtime transformation needed
export type PaidDetailRow = NormalizedFinancialBooking
```

---

## 2. PaidDetailSummary *(new)*

**Purpose**: Aggregated totals header shown at the top of `PaidDetailPage` for the current date range filter.

**Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `totalAmount` | `number` | Sum of `amount` across all filtered PAID rows (LKR) |
| `totalHours` | `number` | Sum of `durationHours` across all filtered PAID rows |
| `totalBookings` | `number` | Count of individual PAID booking rows |

**TypeScript definition** (to be added to `types.ts`):
```ts
export interface PaidDetailSummary {
  totalAmount: number
  totalHours: number
  totalBookings: number
}
```

---

## 3. PaidDetailOutput *(new)*

**Purpose**: The return type of `buildPaidDetail()` in `financialReportService.ts`. Contains both the per-row list and the pre-computed summary.

**TypeScript definition** (to be added to `types.ts`):
```ts
export interface PaidDetailOutput {
  rows: PaidDetailRow[]
  summary: PaidDetailSummary
}
```

---

## 4. PaidDetailSearchParams *(new)*

**Purpose**: Validated shape of URL query parameters read by `PaidDetailPage` on mount. Used to initialise the page's local date range state.

**Fields**:

| Param | Type | Description |
|-------|------|-------------|
| `start` | `string` (`YYYY-MM-DD`) | Start date of the detail view date range |
| `end` | `string` (`YYYY-MM-DD`) | End date of the detail view date range |

**Zod schema** (to be added to `schemas.ts`):
```ts
export const paidDetailSearchParamsSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
```
- Both fields are optional; if absent or invalid, `PaidDetailPage` falls back to the current month (same default as `AdminFinancialReportsPage`).
- No `.refine` cross-field check here — `start > end` is handled inside the hook via the existing `reportDateRangeSchema` check.

---

## 5. AdminRouteIndex *(modified, not a new entity)*

**Purpose**: Documents the route-level change for the admin landing page.

**Before** (current state):
```
/admin (index)  →  AdminDashboardPage
/admin/calendar  →  AdminCalendarPage
```

**After**:
```
/admin (index)    →  AdminCalendarPage  (changed)
/admin/calendar   →  AdminCalendarPage  (unchanged — continues to work)
/admin/dashboard  →  AdminDashboardPage (new explicit route)
```

**Nav items change** (`AdminLayout.tsx`):

| Before | After |
|--------|-------|
| Dashboard (first, `end: true`) | Calendar (first, `end: true` on `/admin`) |
| Calendar | — (Calendar is now the root; nav link points to `/admin`) |
| Reports | Reports (unchanged) |
| Callback Requests | Callback Requests (unchanged) |
| Settings | Settings (unchanged) |
| Booking Agents (super-admin) | Booking Agents (unchanged) |

The "Dashboard" entry is **removed** from the nav items array. The existing Dashboard page remains accessible via `/admin/dashboard` for anyone with a bookmark.

---

## 6. PaidDetailPageState *(UI state, not persisted)*

**Purpose**: Local component state managed within `PaidDetailPage`.

| Field | Type | Initial Value | Description |
|-------|------|---------------|-------------|
| `startDate` | `string` (`YYYY-MM-DD`) | from URL param `start` or `startOfMonth(today)` | Controls the date range filter |
| `endDate` | `string` (`YYYY-MM-DD`) | from URL param `end` or `today` | Controls the date range filter |
| `currentPage` | `number` | `1` | Current pagination page |

State transitions:
- Changing either date input resets `currentPage` to `1`.
- Changing page updates `currentPage` only; data is client-side (no re-fetch needed when only page changes within an already-fetched range).

---

## Security and Integrity Notes

- No new tables or RLS policies are introduced.
- The new `/admin/reports/paid-detail` route is nested inside the existing `AdminProtectedRoute` guard — unauthorized users are redirected to `/admin/login` before the component mounts.
- Payment amounts are computed in `financialReportService.ts` (service layer), not in the page component.
- All cross-boundary data (URL params, Supabase response) is validated with Zod before use — consistent with Constitution Principle II and IV.
- `PaidDetailRow.amount` values are read-only display data; no mutation paths are introduced by this feature.
