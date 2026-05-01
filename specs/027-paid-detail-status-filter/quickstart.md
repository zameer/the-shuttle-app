# Quickstart: Implement Manual Load for Paid Detail

## Prerequisites

- Active branch: `030-create-feature-branch`
- Active feature pointer: `specs/027-paid-detail-status-filter`
- Baseline lint can contain existing unrelated issues; do not add new issues in touched files

## Step 1: Update Type and Schema Contracts

1. Update `src/features/admin/financial-reports/types.ts`:
- Add or refine draft/applied filter state types if needed.

2. Update `src/features/admin/financial-reports/schemas.ts`:
- Ensure filter input schema supports applied filter validation.
- Ensure outstanding status array requires at least one value.

## Step 2: Update Hook for Manual Trigger

1. Update `src/features/admin/financial-reports/usePaidDetail.ts`:
- Accept applied filters only.
- Support query enablement tied to explicit load action state.
- Keep query key based on applied filters.

## Step 3: Update Page State Model

1. Update `src/features/admin/financial-reports/components/PaidDetailPage.tsx`:
- Maintain draft filters bound to UI controls.
- Maintain applied filters used for query.
- Add `Load Details` button.
- Do not fetch on initial load.

## Step 4: Update Page Rendering Behavior

1. In `PaidDetailPage.tsx`:
- Keep existing summary/table rendering based on loaded data only.
- Show pre-load guidance before first load action.
- Keep existing empty state only for post-load zero results.
- Reset pagination to page 1 on load action.

## Step 5: Verify Outstanding Status Filtering

1. Under OUTSTANDING mode:
- Keep multi-select defaults.
- Apply selected statuses only on load action.

## Step 6: Manual Verification Checklist

1. Open `/admin/reports/paid-detail`:
- Confirm no data auto-load occurs.
- Confirm pre-load guidance is shown.

2. Edit date/scope/status filters without clicking load:
- Confirm displayed results do not change.

3. Click `Load Details`:
- Confirm table and summary update with current filter values.
- Confirm pagination resets to page 1.

4. Run lint:
- `npm run lint`
- Confirm no new lint errors in files touched by this feature.
