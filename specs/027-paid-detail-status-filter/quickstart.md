# Quickstart: Implement Paid Detail Status + Booking-Status Filters

## Prerequisites

- Active branch: `029-setup-spec-invocation`
- Active feature pointer: `specs/027-paid-detail-status-filter`
- Baseline command: `npm run lint` (known workspace baseline issues may exist; do not introduce new ones)

## Step 1: Extend Types and Schemas

1. Update `src/features/admin/financial-reports/types.ts`:
- Add `DetailStatusScope`
- Add `OutstandingBookingStatus`
- Add filter-input interface used by `usePaidDetail`

2. Update `src/features/admin/financial-reports/schemas.ts`:
- Add enum schema for scope
- Add array schema for outstanding booking statuses (min 1)
- Add composed filter-input schema

## Step 2: Extend Service Filtering Logic

1. Update `src/features/admin/financial-reports/financialReportService.ts`:
- Introduce scope-aware detail builder or extend existing `buildPaidDetail`
- For `PAID`, keep paid-only behavior
- For `OUTSTANDING`, include non-paid rows and filter by selected booking statuses
- Keep summary derived from filtered rows only

## Step 3: Update Hook Contract

1. Update `src/features/admin/financial-reports/usePaidDetail.ts`:
- Accept filter input (`startDate`, `endDate`, `scope`, `outstandingStatuses`)
- Validate with new schema
- Keep React Query key consistent with all filter dimensions
- Return scope-filtered rows and summary

## Step 4: Update Paid Detail Page UI

1. Update `src/features/admin/financial-reports/components/PaidDetailPage.tsx`:
- Add scope selector in existing filter section beside date controls
- Default scope to `PAID`
- Show booking-status multi-select only when scope = `OUTSTANDING`
- Default selected statuses to `CONFIRMED`, `CANCELLED`, `NO_SHOW`
- Reset page to 1 on scope/date/status changes
- Keep existing table/status-badge rendering

## Step 5: Verify Parent Navigation Compatibility

1. Confirm `AdminFinancialReportsPage` navigation to detail route still works.
2. Confirm back-navigation from detail page still returns to reports.

## Step 6: Validation Checklist

1. Open `/admin/reports/paid-detail`:
- Scope defaults to `PAID`
- Date controls remain functional

2. Switch to `OUTSTANDING`:
- Booking-status multi-select appears
- Defaults include all three statuses

3. Toggle status selections:
- Table and summary update accordingly
- Pagination resets to first page

4. Run lint:
- `npm run lint`
- Confirm no new lint errors in touched files
