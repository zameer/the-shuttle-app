# Quickstart: Admin Financial Reporting

## Prerequisites

- Node/npm dependencies installed
- Supabase environment configured for existing project
- Admin user available in `admin_users`

## Run

1. Start app:

```powershell
npm run dev
```

2. Sign in through admin login.
3. Open admin financial report page (new route under `/admin`).

## Implementation Checklist (Phase 2 Preview)

1. Create feature folder `src/features/admin/financial-reports/` with:
   - `types.ts`
   - `schemas.ts`
   - `financialReportService.ts`
   - `useFinancialReport.ts`
   - `components/*` for section rendering
2. Add admin page container `AdminFinancialReportsPage.tsx`.
3. Wire route in `src/App.tsx` and navigation in `src/layouts/AdminLayout.tsx`.
4. Validate no business aggregation logic leaks into JSX view components.

## Manual QA Scenarios

### US1: Date-Range Payment Summary

1. Select a date range with mixed paid/pending bookings.
2. Verify summary displays paid/pending hours and amounts.
3. Clear any player-level filtering control (if present) and confirm results remain all-player scoped.
4. Select empty date range and confirm zero totals are displayed.

### US2: Paid/Pending Breakdown with Player Info

1. Verify paid and pending sections both render.
2. Confirm each breakdown entry includes player info.
3. Sum breakdown totals and verify equality with summary totals.
4. Verify one-sided datasets still render both sections with zero counterpart.

### US3: Outstanding Pending by Player + Slot Details

1. Use date range with pending records.
2. Verify each player record shows pending amount and slot details.
3. Verify multi-slot players expose all relevant slots.
4. Verify empty-state copy and zero total when no pending bookings exist.

### US4: No-Show/Cancellation Impact

1. Use date range with `NO_SHOW` and `CANCELLED` bookings.
2. Verify lost hours and lost amount are shown separately by impact type.
3. Verify range without impacted statuses shows zero values.
4. Verify fallback amount handling is stable when amount/rate data is missing.

## Validation Gates

```powershell
npm run lint
```

Optional targeted tests (if created during implementation):

```powershell
npm test -- --runInBand
```