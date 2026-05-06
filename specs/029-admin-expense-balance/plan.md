# Implementation Plan: Admin Expense Balance (Separate Detail Page)

**Branch**: `031-create-feature-branch` | **Date**: 2026-05-06 | **Spec**: `specs/029-admin-expense-balance/spec.md`
**Input**: Feature specification from `/specs/029-admin-expense-balance/spec.md`

## Summary

Implement admin expense capture and on-demand balance calculation on a dedicated report detail page (similar to Paid Detail), while keeping the entry point as a navigation action below Paid Breakdown. The solution adds a Supabase `expenses` table with admin-only RLS, introduces expense query/mutation hooks and service-layer balance computation, and adds a new protected route under `/admin/reports` for expense/balance operations.

## Technical Context

**Language/Version**: TypeScript 6.0.2  
**Primary Dependencies**: React 19.2.4, React Router 7.x, React Query 5.99.0, react-hook-form 7.72.1, Zod 4.x, Tailwind CSS 3.4.17, shadcn/ui, Supabase JS 2.103.0, date-fns 4.1.0  
**Storage**: Supabase PostgreSQL with RLS; new `expenses` table scoped to admin financial reporting  
**Testing**: `npm run lint` plus manual verification checklist in `quickstart.md`  
**Target Platform**: Web SPA (admin panel)  
**Project Type**: Single-project frontend web app  
**Performance Goals**: Date-range expense fetch and balance render should feel instantaneous for normal admin ranges (target sub-second perceived update)  
**Constraints**: Keep form very simple (date/description/amount), show balance only after explicit button click, maintain admin-route protection, no `any`  
**Scale/Scope**: 1 new DB table + policies, 1 new admin detail route/page, updates to reports navigation and financial report feature hooks/services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/029-admin-expense-balance/spec.md` exists and includes clarified dedicated-page flow.
- [x] **II. Type Safety**: Zod validation planned at form and Supabase response boundaries; typed interfaces for all new entities.
- [x] **III. Component Reusability**: New UI remains feature-scoped under `src/features/admin/financial-reports/` and uses existing UI primitives.
- [x] **IV. Data Integrity & Security**: New table enforces admin-only read/write via RLS; route remains under `AdminProtectedRoute`; calculation logic in service/hook layer.
- [x] **V. Responsive Design**: Contracts define behavior across ≥375 px / ≥768 px / ≥1280 px for detail page form and tables.

No constitution exceptions required.

## Project Structure

### Documentation (this feature)

```text
specs/029-admin-expense-balance/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── AdminReportsNavigationContract.ts
│   ├── ExpenseBalancePageContract.ts
│   └── ExpenseStorageContract.ts
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── App.tsx
├── features/
│   └── admin/
│       ├── AdminFinancialReportsPage.tsx
│       └── financial-reports/
│           ├── schemas.ts
│           ├── types.ts
│           ├── financialReportService.ts
│           ├── useFinancialReport.ts
│           ├── useExpenses.ts                (new)
│           └── components/
│               └── ExpenseBalancePage.tsx    (new)
supabase/
└── migrations/
    └── 20260506_add_expenses_table.sql       (new)
```

**Structure Decision**: Keep all expense logic in the existing admin financial-reports feature module and add one dedicated route page under the current `/admin/reports/*` pattern.

## Phase Overview

### Phase 0: Research

- Confirmed no existing expense model exists in code or DB.
- Chose dedicated detail route (`/admin/reports/expense-balance`) rather than inline section.
- Chose route query params (`start`, `end`) for context transfer from reports page.
- Chose explicit calculate action with hidden-until-click behavior.

### Phase 1: Design and Contracts

- `data-model.md`: Defines persisted `Expense` plus route-state and calculation entities.
- `contracts/`: Defines navigation contract, detail page behavior contract, and storage contract.
- `quickstart.md`: Documents route wiring + implementation sequence for separate page flow.

### Phase 2 (next command `/speckit.tasks`)

- Regenerate tasks to match route-based architecture and remove inline-section assumptions.

## Post-Design Constitution Re-Check

- [x] **I. Spec-First**: Clarified requirement is represented in plan and contracts.
- [x] **II. Type Safety**: Route params and expense payloads are validated with Zod.
- [x] **III. Component Reusability**: Reuses existing report page and detail-page pattern (Paid Detail analogue).
- [x] **IV. Data Integrity & Security**: Admin-only policies and protected route coverage preserved.
- [x] **V. Responsive Design**: Detail page layout is explicitly responsive in contract/quickstart.

Result: PASS.

## Complexity Tracking

No constitution violations requiring justification.
