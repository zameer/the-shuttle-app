# Quickstart: Admin Calendar Landing & Paid Report Detail

**Feature**: 026-admin-calendar-paid-detail  
**Branch**: `026-admin-calendar-paid-detail`  
**Date**: 2026-05-01

This guide walks a developer through implementing the two user stories in this feature using the contracts and data-model as reference.

---

## Prerequisites

- Working dev server: `npm run dev`
- Lint passes: `npm run lint`
- Supabase env vars configured (no schema changes — existing `.env.local` is sufficient)
- Feature branch `026-admin-calendar-paid-detail` is checked out

---

## User Story 1 — Calendar as Admin Landing Page

**Estimated effort**: 15–30 min (2 file changes)

### Step 1 — Update `src/App.tsx`

Locate the admin `children` array inside the `AdminProtectedRoute` block. Make two changes:

**Change the index route**:
```diff
- { index: true, element: <AdminDashboardPage /> }
+ { index: true, element: <AdminCalendarPage /> }
+ { path: 'dashboard', element: <AdminDashboardPage /> }
```

Add the import for `PaidDetailPage` while you have the file open (needed for US2).

Reference: [contracts/AppRouter.ts](./contracts/AppRouter.ts)

### Step 2 — Update `src/layouts/AdminLayout.tsx`

Replace the `navItems` array. Remove the Dashboard entry, change the first item label to "Calendar" pointing to `/admin`, and add the `CalendarDays` icon import:

```diff
- import { Settings, Menu, X, BarChart3, PhoneCall, PhoneIncoming } from 'lucide-react'
+ import { Settings, Menu, X, BarChart3, PhoneCall, PhoneIncoming, CalendarDays } from 'lucide-react'
```

```diff
  const navItems = [
-   { to: "/admin",          label: "Dashboard",          end: true },
-   { to: "/admin/calendar", label: "Calendar",            end: false },
+   { to: "/admin",          label: "Calendar", icon: CalendarDays, end: true },
    { to: "/admin/reports",  label: "Reports",  icon: BarChart3,    end: false },
    ...
  ]
```

Reference: [contracts/AdminLayoutNav.ts](./contracts/AdminLayoutNav.ts)

### Step 3 — Verify US1

1. `npm run lint` — zero errors
2. Open `http://localhost:5173/admin` — Calendar page loads (not Dashboard)
3. Click the "Calendar" nav item — active state highlights correctly
4. Navigate to `http://localhost:5173/admin/dashboard` directly — Dashboard still loads

---

## User Story 2 — Paid Detail Page

**Estimated effort**: 2–3 hours (7 file changes)

Work through the steps in dependency order.

### Step 1 — Extend `types.ts`

Add three new types to `src/features/admin/financial-reports/types.ts`:

```ts
// Add after PaidBreakdownOutput

export type PaidDetailRow = NormalizedFinancialBooking

export interface PaidDetailSummary {
  totalAmount: number
  totalHours: number
  totalBookings: number
}

export interface PaidDetailOutput {
  rows: PaidDetailRow[]
  summary: PaidDetailSummary
}
```

Reference: [data-model.md](./data-model.md) sections 1–3

### Step 2 — Extend `schemas.ts`

Add the URL param schema to `src/features/admin/financial-reports/schemas.ts`:

```ts
export const paidDetailSearchParamsSchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})
```

Reference: [data-model.md](./data-model.md) section 4

### Step 3 — Extend `financialReportService.ts`

Add `buildPaidDetail` function to `src/features/admin/financial-reports/financialReportService.ts`. Use `round2` (already defined in the file) for all numeric accumulations:

```ts
export function buildPaidDetail(rows: NormalizedFinancialBooking[]): PaidDetailOutput {
  const filtered = rows
    .filter(row => row.paymentBucket === 'PAID' && isActiveFinancialStatus(row.bookingStatus))
    .sort((a, b) => b.slotStart.localeCompare(a.slotStart))

  const summary: PaidDetailSummary = {
    totalAmount: round2(filtered.reduce((acc, r) => acc + r.amount, 0)),
    totalHours: round2(filtered.reduce((acc, r) => acc + r.durationHours, 0)),
    totalBookings: filtered.length,
  }

  return { rows: filtered, summary }
}
```

Import the new types at the top of the file:
```ts
import type { ..., PaidDetailOutput, PaidDetailSummary } from './types'
```

### Step 4 — Create `usePaidDetail.ts`

Create `src/features/admin/financial-reports/usePaidDetail.ts`:

```ts
import { useQuery } from '@tanstack/react-query'
import { endOfDay, startOfDay } from 'date-fns'
import { supabase } from '@/services/supabase'
import { bookingsResponseSchema, reportDateRangeSchema } from './schemas'
import type { ReportDateRangeInput } from './types'
import { buildPaidDetail, normalizeFinancialRows } from './financialReportService'

function toISODateBoundary(value: string, mode: 'start' | 'end'): string {
  const date = new Date(value)
  const boundary = mode === 'start' ? startOfDay(date) : endOfDay(date)
  return boundary.toISOString()
}

export function usePaidDetail(input: ReportDateRangeInput) {
  const parsedInput = reportDateRangeSchema.safeParse(input)

  return useQuery({
    queryKey: ['paid-detail', input.startDate, input.endDate],
    enabled: parsedInput.success,
    queryFn: async () => {
      if (!parsedInput.success) throw new Error('Invalid date range')

      const { startDate, endDate } = parsedInput.data
      const { data, error } = await supabase
        .from('bookings')
        .select('id,player_phone_number,start_time,end_time,status,payment_status,hourly_rate,total_price,players(name)')
        .lte('start_time', toISODateBoundary(endDate, 'end'))
        .gte('end_time', toISODateBoundary(startDate, 'start'))
        .order('start_time', { ascending: false })

      if (error) throw new Error(error.message)

      const parsedRows = bookingsResponseSchema.safeParse(data ?? [])
      if (!parsedRows.success) throw new Error('Unexpected booking payload shape')

      return buildPaidDetail(normalizeFinancialRows(parsedRows.data))
    },
  })
}
```

### Step 5 — Create `PaidDetailStatusBadge.tsx`

Create `src/features/admin/financial-reports/components/PaidDetailStatusBadge.tsx`. Use shadcn/ui `Badge`. See badge color mapping in [contracts/PaidDetailPage.ts](./contracts/PaidDetailPage.ts) under "PaidDetailStatusBadge contract".

Keep this component pure (props-only, no hooks, no service calls).

### Step 6 — Create `PaidDetailPage.tsx`

Create `src/features/admin/financial-reports/components/PaidDetailPage.tsx`.

Key implementation points:
1. Read URL params with `useSearchParams()` from react-router-dom
2. Validate with `paidDetailSearchParamsSchema`; fall back to `format(startOfMonth(new Date()), 'yyyy-MM-dd')` / `format(new Date(), 'yyyy-MM-dd')`
3. Local state: `startDate`, `endDate`, `currentPage` (reset to 1 on date change)
4. Call `usePaidDetail({ startDate, endDate })`
5. Compute pagination: `PAGE_SIZE = 15`, `totalPages`, `pagedRows = data.rows.slice(...)`
6. Render the layout described in [contracts/PaidDetailPage.ts](./contracts/PaidDetailPage.ts)
7. Back link: `<Link to="/admin/reports">← Back to Reports</Link>` using react-router-dom `Link`
8. Use `format(parseISO(row.slotStart), 'dd MMM yyyy')` for date display (date-fns)
9. Use `format(parseISO(row.slotStart), 'HH:mm')` for time display

### Step 7 — Wire Route in `App.tsx`

Add the import and route (you already opened this file in Step 1):
```ts
import PaidDetailPage from './features/admin/financial-reports/components/PaidDetailPage'
```
```ts
{ path: 'reports/paid-detail', element: <PaidDetailPage /> }
```

### Step 8 — Update `AdminFinancialReportsPage.tsx`

Replace the `<PaymentBreakdownSection>` modal trigger with a navigation button. Remove:
- `isPaidModalOpen` and `paidPage` state
- `handleOpenPaidBreakdown` handler
- `<PaidBreakdownModal>` component usage
- `PaidBreakdownModal` import

Add:
```ts
import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

// inside component:
const navigate = useNavigate()

// replace modal button:
<Button
  variant="outline"
  onClick={() => navigate(`/admin/reports/paid-detail?start=${startDate}&end=${endDate}`)}
>
  <ExternalLink className="w-4 h-4 mr-2" />
  View Paid Detail
</Button>
```

> **Note**: `PaidBreakdownModal`, `PaymentBreakdownSection` and their existing files remain unchanged on disk — only their usage in `AdminFinancialReportsPage` changes. Do not delete `PaidBreakdownModal.tsx` or `PaymentBreakdownSection.tsx` unless explicitly instructed.

---

## Verification Checklist

After implementing both user stories:

- [ ] `npm run lint` — zero errors
- [ ] `/admin` navigates to Calendar (list view default)
- [ ] `/admin/dashboard` still loads the all-time metrics page
- [ ] "Dashboard" no longer appears in the nav bar
- [ ] "Calendar" is the first nav item with active highlight when on `/admin`
- [ ] `/admin/reports` shows the Financial Reports page with a "View Paid Detail" button
- [ ] Clicking "View Paid Detail" navigates to `/admin/reports/paid-detail?start=...&end=...`
- [ ] The detail page shows individual booking rows (not grouped by player)
- [ ] Each row shows: date, time, player, contact, confirmation status badge, payment status badge, amount
- [ ] Changing dates on the detail page updates the displayed rows
- [ ] "← Back to Reports" link returns to `/admin/reports`
- [ ] Empty state shows when no paid bookings in range
- [ ] Pagination controls appear when rows > 15
- [ ] All existing admin functionality (booking management, settings, callback requests) unaffected
