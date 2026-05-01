# Research: Admin Calendar Landing & Paid Report Detail

**Feature**: 026-admin-calendar-paid-detail  
**Date**: 2026-05-01  
**Status**: Complete — no unresolved items

---

## Decision 1: Admin Landing Page — Route Change Strategy

**Question**: How should `/admin` be changed to serve Calendar without breaking existing navigation and Dashboard access?

**Decision**: Change the index child route inside the `AdminLayout` from `AdminDashboardPage` to `AdminCalendarPage`. Move the Dashboard to a new explicit route at `/admin/dashboard`. Remove the "Dashboard" entry from `AdminLayout.tsx` nav items array. The Calendar `NavLink` entry already at `/admin/calendar` is updated to also match `/admin` (using `end: false` or relying on the index route behavior).

**Rationale**: The least-change approach. `AdminCalendarPage` is already at `/admin/calendar` — serving it at the index too means zero page component changes. React Router index routes handle the redirect naturally. No `<Navigate>` component is needed. The Dashboard component is not deleted, preserving its data utility if admins bookmark `/admin/dashboard`.

**Alternatives considered**:
- *Add a `<Navigate from="/admin" to="/admin/calendar" replace />` redirect*: Works but adds an extra navigation hop visible in browser history. Unnecessary when the index route can directly render the Calendar.
- *Delete Dashboard entirely*: Out of spec — the Dashboard provides all-time metrics that may still be useful. Spec only requires it not be the landing.

---

## Decision 2: Paid Detail View — Page vs Modal

**Question**: Should the paid detail view be a separate page or a full-screen modal?

**Decision**: **Separate page** at `/admin/reports/paid-detail`.

**Rationale**: A tabular view of individual bookings benefits from the full browser width. A separate page enables browser back navigation (native UX), bookmarking/deep linking for specific date ranges, and a larger viewport for the data table. The existing modal (`PaidBreakdownModal`) was appropriate for the grouped-by-player summary but is not ideal for a dense per-row table that could have 50–200 rows.

**Alternatives considered**:
- *Full-screen modal (Dialog)*: Works but overloads the Dialog primitive for a complex data page. Closing the modal via Escape key or backdrop click would discard the independently chosen date range without warning. Deep linking is not possible.
- *Sheet/drawer*: Similar limitations; width is constrained on mobile.

---

## Decision 3: Date Range Handoff — Parent Report → Detail Page

**Question**: How does the detail page know which date range to show on first load?

**Decision**: Pass the parent report's current `startDate` and `endDate` as URL query parameters when navigating: `/admin/reports/paid-detail?start=2026-05-01&end=2026-05-31`. The `PaidDetailPage` reads these params on mount to initialise its own local date range state. Once open, the page manages its range independently (changing dates in the detail view does not update the parent report).

**Rationale**: URL query params are the idiomatic React Router approach for passing state to a child route during navigation. They also enable direct deep linking. The detail page uses a Zod schema (`paidDetailSearchParamsSchema`) to validate the params on parse — invalid params fall back to current-month defaults gracefully.

**Alternatives considered**:
- *React context / global state*: Adds unnecessary complexity for a one-time read on mount.
- *localStorage*: Persists stale ranges across sessions, creating confusing UX.
- *Back button state (`state` object in `navigate()`)*: Not reflected in the URL; deep linking is lost.

---

## Decision 4: Data Source for Per-Booking Rows

**Question**: Does the paid detail page need a new Supabase query, a new RPC, or can it reuse the existing bookings query?

**Decision**: Reuse the existing Supabase query in `useFinancialReport` — same table (`bookings`), same columns, same date-range filter. Add a new `buildPaidDetail(rows: NormalizedFinancialBooking[])` function to `financialReportService.ts` that filters to `paymentBucket === 'PAID'` and `isActiveFinancialStatus(bookingStatus)`, then returns individual rows sorted by `slotStart` descending. A new `usePaidDetail` hook wraps this with its own React Query key.

**Rationale**: The `NormalizedFinancialBooking` type already contains every field required by the per-booking display rows (date, start/end time, player name, contact, booking status, payment bucket, amount). No new columns or joins are needed. Reusing the same query pattern means zero migration risk.

**Alternatives considered**:
- *New Supabase RPC*: Overkill for a client-side filter. Adds migration and RLS surface with no benefit given the data volume.
- *Extend `useFinancialReport` to return both aggregated and per-row data*: Couples two unrelated consumers to one hook; harder to test and evolve independently.

---

## Decision 5: Pagination Strategy

**Question**: Client-side pagination or server-side cursor?

**Decision**: **Client-side pagination** at 15 rows/page.

**Rationale**: Expected data volume per typical date range (e.g., 1 month) is ≤ 100 paid bookings. Client-side pagination (already used for the existing `PaidBreakdownModal` at 8 rows/page) is sufficient and avoids server round-trips on page change. 15 rows/page is chosen to fit a standard desktop viewport height (1280 px, ~900 px visible area) without requiring vertical scroll within the table body.

**Alternatives considered**:
- *Infinite scroll*: Harder to implement with correct keyboard nav; page numbers give admins a sense of total scope.
- *Server-side cursor pagination*: Appropriate for > 10,000 rows; overkill for this use case.

---

## Decision 6: Status Badge Design

**Question**: How should booking confirmation status and payment status be visually distinguished in the table?

**Decision**: New `PaidDetailStatusBadge` component wrapping shadcn/ui `Badge`. Two badge variants by type:
- **Booking status** (confirmation): `CONFIRMED` → blue filled; `PENDING` → gray outline; `UNAVAILABLE` → gray; `CANCELLED` / `NO_SHOW` → red (these should not appear in paid detail, but handled defensively).
- **Payment status**: `PAID` → green filled; anything else → yellow outline.

**Rationale**: Color + label combination satisfies WCAG 2.1 AA contrast; admins can scan status at a glance without relying on color alone (label always shown). Using shadcn/ui `Badge` with Tailwind class overrides is consistent with Principle III.

**Alternatives considered**:
- *Text only*: Passes accessibility but reduces scanning speed.
- *Icon only*: Fails accessibility (no screen reader text).

---

## Summary of All Resolved Items

| # | Topic | Decision |
|---|-------|----------|
| 1 | Admin landing route | Index child → `AdminCalendarPage`; Dashboard → `/admin/dashboard`; remove from nav |
| 2 | Paid detail: page vs modal | Separate page at `/admin/reports/paid-detail` |
| 3 | Date range handoff | URL query params `?start=&end=`; Zod validated; fallback to current month |
| 4 | Data source | Reuse existing bookings query + new `buildPaidDetail()` + `usePaidDetail` hook |
| 5 | Pagination | Client-side, 15 rows/page |
| 6 | Status badges | `PaidDetailStatusBadge` — shadcn/ui `Badge` with color+label by status type |

**No further research required. Proceeding to Phase 1 design.**
