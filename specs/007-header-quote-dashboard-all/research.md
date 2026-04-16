# Research: Header Quote Layout and All-Time Dashboard Metrics

**Feature**: 007-header-quote-dashboard-all
**Phase**: 0 — Unknowns resolved before design

---

## Decision 1: How to Aggregate All-Time Dashboard Metrics

**Question**: The `dashboard_metrics` view is currently queried with `.eq('booking_date', dateString).single()`.
How should all-time totals be retrieved? Options: (a) fetch all rows and reduce client-side,
(b) use a Supabase aggregate query (`.select('sum(...)').single()`), (c) call an RPC function.

**Decision**: Fetch all rows with `.select('*')` (no date filter) and reduce client-side using
`Array.reduce`. This gives four sums: `total_bookings`, `expected_revenue`, `collected_revenue`,
`pending_revenue`.

**Rationale**:
- The `dashboard_metrics` view already computes per-day aggregates; summing them client-side
  adds no security risk and requires no schema changes.
- Supabase `sum()` aggregate via `.select('sum(column)')` requires PostgREST aggregate
  support which varies by version. Client-side reduce is simpler and works with any PostgREST
  version.
- An RPC function would require a new migration — violates the "no new migrations" constraint.
- The number of rows is bounded by the club's booking history (≤365 rows/year for a single
  court). Client-side reduce is negligible work.

**Alternatives considered**:
- *PostgREST aggregate*: Requires `?columns=sum(...)` PostgREST syntax; version-dependent; more
  fragile than a typed client-side reduce.
- *RPC/stored procedure*: Requires a new migration — ruled out by feature constraints.

---

## Decision 2: New Hook vs. Modifying the Existing Hook

**Question**: Should `useDashboardMetrics` be modified to support an "all-time" mode via an
optional parameter, or should a new `useAllTimeMetrics` hook be created?

**Decision**: Create a new hook `useAllTimeMetrics` in `src/features/dashboard/useAllTimeMetrics.ts`.
The existing `useDashboardMetrics` hook remains unchanged.

**Rationale**:
- Constitution Principle II (Type Safety) and III (Component Reusability) favour single-
  responsibility hooks. Adding an optional mode flag to `useDashboardMetrics` mixes two
  query shapes behind one interface.
- The returned type differs: `useDashboardMetrics` returns `DailyMetrics | null`; the new hook
  returns `AllTimeMetrics` (no `booking_date`, no `unavailable_blocks`).
- Keeping the old hook intact avoids any risk of breaking the admin calendar or other consumers.

**Alternatives considered**:
- *Modify existing hook with flag*: Pollutes the interface and return type; risks breaking
  other callers.

---

## Decision 3: Quote Beside Title — Flex Structure

**Question**: How should the header flex layout change so the quote appears to the right of
the title, not stacked below it?

**Decision**: Change the `PublicLayout` header's inner flex container from a vertical title
block (left) + bell (right) to a three-zone row:

```
[title block (left, shrink-0)] [quote (flex-1, centre, italic)] [bell (right, shrink-0)]
```

- Title block: `shrink-0`; contains `<h1>` + subtitle `<p>`.
- Quote zone: `flex-1 min-w-0`; left-aligned italic text, `line-clamp-2` on mobile.
- Bell: `shrink-0 self-start pt-1`.

On narrow screens all three items stay on one row; the quote truncates with ellipsis before
the bell is pushed out. The bell is always reachable.

**Rationale**: Three-zone row preserves the bell at a fixed touch target on the right. The
`min-w-0` on the quote zone allows it to compress without overflowing. No breakpoint switch
needed — the same structure works from 375 px upward with truncation.

**Alternatives considered**:
- *Wrap to second line on mobile*: Quote would appear below title on small screens — contradicts
  US2 which requires it "beside" the title. Rejected.
- *Hidden on mobile*: Violates the responsive requirement and SC-003.
- *Absolute positioning*: Fragile; different font sizes break alignment. Rejected.

---

## Decision 4: QuoteArea Component Changes

**Question**: Does `QuoteArea` need its layout classes changed, or only the parent layout?

**Decision**: `QuoteArea` needs minor class adjustments. Currently it wraps in a centred
`<div className="mt-2 text-center px-2">`. In the new side-by-side context it should be
left-aligned and have no top margin (the outer flex alignment handles vertical centring).
New wrapper: `<div className="px-2 text-left">`. `line-clamp-2` stays for mobile safety.

**Rationale**: The component is already composable — only its default alignment needs to match
its new usage context. Changing the wrapper classes is a minimal diff.

**Alternatives considered**:
- *Pass alignment as a prop*: Over-engineering for a single-use component. Rejected.

---

## Decision 5: `AllTimeMetrics` Return Shape

**Question**: What type does `useAllTimeMetrics` return?

**Decision**:

```typescript
export interface AllTimeMetrics {
  total_bookings: number
  expected_revenue: number
  collected_revenue: number
  pending_revenue: number
}
```

No `booking_date` or `unavailable_blocks` — those are per-day fields irrelevant to the
all-time aggregate.

**Rationale**: Typed return keeps `AdminDashboardPage` changes minimal (four field names
are identical to `DailyMetrics`) so template JSX barely changes.

---

## Resolved Unknowns Summary

| Unknown | Resolution |
|---------|------------|
| How to query all-time totals | Fetch all rows, reduce client-side |
| New hook or modify existing | New `useAllTimeMetrics` hook; existing unchanged |
| Header flex layout structure | Three-zone row: title (shrink-0) + quote (flex-1) + bell (shrink-0) |
| QuoteArea class changes | Left-align, remove top margin; parent flex handles vertical placement |
| AllTimeMetrics type shape | 4 fields: total_bookings, expected/collected/pending revenue |
