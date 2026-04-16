# Data Model: Header Quote Layout and All-Time Dashboard Metrics

**Feature**: 007-header-quote-dashboard-all
**Phase**: 1 — Design

---

## Overview

No new database tables or migrations. The two changes are:

1. **New hook** — `useAllTimeMetrics` queries `dashboard_metrics` without a date filter and
   reduces all rows to a single `AllTimeMetrics` object.
2. **Layout change** — `PublicLayout` header restructured; `QuoteArea` classes adjusted.
   No new data entities.

---

## New Type: `AllTimeMetrics`

Lives in `src/features/dashboard/useAllTimeMetrics.ts` (co-located with the hook).

```typescript
export interface AllTimeMetrics {
  /** Sum of total_bookings across all booking days */
  total_bookings: number
  /** Sum of expected_revenue across all booking days (LKR) */
  expected_revenue: number
  /** Sum of collected_revenue across all booking days (LKR) */
  collected_revenue: number
  /** Sum of pending_revenue across all booking days (LKR) */
  pending_revenue: number
}
```

**Derivation**: Computed client-side by summing the corresponding fields from every
`DailyMetrics` row returned by `dashboard_metrics` (no `.eq()` filter, no `.single()`).

**Validation rules**:
- All four fields default to `0` when no rows exist (empty result set).
- No Zod schema needed — data flows only from Supabase to display; no user input involved.

---

## Removed / Changed Entities

### `AdminDashboardPage` — query hook swap

| Before | After |
|--------|-------|
| `useDashboardMetrics(dateStr)` → `DailyMetrics \| null` | `useAllTimeMetrics()` → `AllTimeMetrics` |
| `const dateStr = format(new Date(), 'yyyy-MM-dd')` | Removed — no date needed |
| `format` import from date-fns | Removed (if no longer used) |

The metric card JSX is identical — same four field names.

---

## Database Changes

**None.** `dashboard_metrics` is queried differently (no `.eq('booking_date', ...)` filter)
but the schema, view definition, and RLS policies are untouched.

---

## Layout Change (No Data Entity Impact)

### `PublicLayout` header structure

| Before | After |
|--------|-------|
| `<div class="flex items-start justify-between gap-3">` | Same outer container |
| `<div class="flex-1 text-center">` wrapping title + subtitle + QuoteArea | Three-zone row: `<div class="shrink-0">` (title), `<div class="flex-1 min-w-0">` (quote), `<div class="shrink-0 self-start pt-1">` (bell) |
| QuoteArea rendered inside centred title block | QuoteArea rendered in middle zone |

### `QuoteArea` class delta

| Before | After |
|--------|-------|
| `<div className="mt-2 text-center px-2">` | `<div className="px-2 text-left">` |
| `text-center` on text | `text-left` |

Component API (`QuoteAreaProps`) **unchanged**.
