# Implementation Plan: Admin Financial Reporting

**Branch**: `018-enforce-player-endtime` | **Date**: 2026-04-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/018-admin-financial-reports/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Deliver an admin-only financial reporting surface for a selected date range with four outputs: (1) PAID vs PENDING totals for hours and amount, (2) PAID/PENDING breakdown including player information, (3) outstanding pending list by player with slot-level details, and (4) no-show/cancellation revenue-loss impact. Implementation will reuse existing Supabase `bookings` and `players` data, aggregate in a typed service/hook layer, and render responsive report sections with explicit zero states.

## Technical Context

**Language/Version**: TypeScript 6.0.2 with React 19.2.4  
**Primary Dependencies**: React Query 5.99.0, Supabase 2.103.0, date-fns 4.1.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8, zod 4.x  
**Storage**: Supabase PostgreSQL with RLS (`bookings`, `players`, `admin_users` + existing `dashboard_metrics` view)  
**Testing**: `npm run lint` (required), targeted hook/service unit tests where available, manual QA from quickstart scenarios  
**Target Platform**: Web SPA (admin console) across mobile/tablet/desktop  
**Project Type**: React SPA  
**Performance Goals**: Date-range report render in <=2s for typical monthly range and <=4s for high-volume quarterly ranges; no duplicate network fetches for same query key  
**Constraints**: Admin-only access, no schema migrations for this feature, explicit zero states for all report sections, preserve existing date policy based on booking `start_time` day for grouping  
**Scale/Scope**: New admin report feature slice under `src/features/admin/`; expected touch points are report hook/service, report page/sections, and route/nav integration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before beginning implementation:

- [x] **I. Spec-First**: `specs/018-admin-financial-reports/spec.md` exists with prioritized user stories and acceptance scenarios.
- [x] **II. Type Safety**: Typed report DTOs and aggregations planned; Supabase boundary output validated/mapped before UI consumption; no `any` introduced.
- [x] **III. Component Reusability**: Business logic stays in report service/hook under `src/features/admin`; UI sections are composable presentation components.
- [x] **IV. Data Integrity & Security**: Existing RLS-protected reads from `bookings`/`players` reused; admin route remains router-guarded via `AdminProtectedRoute`; financial math centralized in service layer.
- [x] **V. Responsive Design**: Report sections include mobile-first stacked layout with tablet/desktop table expansion and explicit empty/zero states.

### Constitution Exceptions

None.

## Project Structure

### Documentation (this feature)

```text
specs/018-admin-financial-reports/
|- plan.md
|- research.md
|- data-model.md
|- quickstart.md
|- contracts/
|  \- admin-financial-report-contract.md
\- tasks.md          # created by /speckit.tasks
```

### Source Code (repository root)

```text
src/
|- App.tsx                            # route wiring; add admin report route
|- features/
|  |- admin/
|  |  |- AdminDashboardPage.tsx       # existing admin landing
|  |  |- AdminFinancialReportsPage.tsx  # NEW page container
|  |  |- financial-reports/
|  |  |  |- useFinancialReport.ts     # NEW typed React Query hook
|  |  |  |- financialReportService.ts # NEW aggregation logic
|  |  |  |- schemas.ts                # NEW Zod boundary schemas
|  |  |  |- types.ts                  # NEW feature-owned DTO interfaces
|  |  |  \- components/               # NEW report section components
|  \- auth/
|     \- AdminProtectedRoute.tsx      # existing admin router guard
|- layouts/
|  \- AdminLayout.tsx                 # admin navigation update
\- services/
   \- supabase.ts                     # existing client reused

supabase/
\- migrations/                        # no changes for this feature
```

**Structure Decision**: Use the existing single React SPA structure under `src/` with feature-scoped admin reporting modules and no backend/supabase schema modifications.

## Complexity Tracking

No constitution violations. No complexity exceptions required.

---

## Phase 0 Research Summary

All clarifications and implementation decisions are resolved in [research.md](./research.md).

| Topic | Decision |
|---|---|
| Date grouping policy | Aggregate by booking `start_time` day to remain consistent with existing metrics view |
| Payment classification | `PAID` and `PENDING` are primary groups; null/legacy unknown values map to pending-safe handling in UI with explicit labeling |
| Revenue-loss calculation | For `NO_SHOW` and `CANCELLED`, use `total_price`; fallback to `hourly_rate * duration`; then fallback to `0` with marker |
| Aggregation location | Compute report aggregates in typed service/hook layer; UI remains presentation-only |
| Security model | Reuse `AdminProtectedRoute` + existing RLS policies for admin-readable booking/player details |

---

## Phase 1 Design

### Key Design Decisions

**D1 - Single report query + deterministic in-memory aggregation**  
Load bookings for the selected date range once through a feature-specific hook and derive all report sections from a shared typed aggregation result to prevent reconciliation drift between summary and breakdown.

**D2 - Strict reconciliation contract between summary and breakdown**  
Summary totals are computed from exactly the same normalized rows used by PAID/PENDING breakdown sections, guaranteeing FR-004 and SC-002 by design.

**D3 - Pending-by-player rows include slot list as first-class output**  
Outstanding entries expose player identity, pending amount, total pending hours, and slot array (start, end, status, amount) so collection workflows can act without opening individual booking modals.

**D4 - No-show/cancellation impact keeps transparent fallback accounting**  
Revenue loss uses `total_price` when available; missing-rate records are preserved in output with computed `0` fallback and countable markers, satisfying edge-case stability requirements.

### Files Expected to Change

| File | User Stories | Planned Change |
|---|---|---|
| `src/features/admin/financial-reports/types.ts` | US1-US4 | Define typed DTOs for summary, breakdown, pending list, and revenue-loss blocks |
| `src/features/admin/financial-reports/schemas.ts` | US1-US4 | Add Zod schemas for Supabase booking rows and report query inputs |
| `src/features/admin/financial-reports/financialReportService.ts` | US1-US4 | Build normalized row mapping and aggregate calculators |
| `src/features/admin/financial-reports/useFinancialReport.ts` | US1-US4 | Fetch bookings + optional player names and expose typed report state |
| `src/features/admin/AdminFinancialReportsPage.tsx` | US1-US4 | Render date-range controls and report sections with zero/empty states |
| `src/layouts/AdminLayout.tsx` and `src/App.tsx` | FR-001, FR-010 | Add admin navigation entry and protected route wiring |

### Post-Design Constitution Check

- [x] **I. Spec-First**: Design maps directly to all four user stories and FR-001..FR-010.
- [x] **II. Type Safety**: Data boundary schemas and feature-owned typed contracts are explicitly planned.
- [x] **III. Component Reusability**: Aggregation logic isolated in service/hook layer; section components remain reusable/presentational.
- [x] **IV. Data Integrity & Security**: Uses current RLS and admin route guard; no client-trusted financial values.
- [x] **V. Responsive Design**: Contracted mobile/tablet/desktop section behavior and empty states are defined.

---

## Artifacts

- [research.md](./research.md)
- [data-model.md](./data-model.md)
- [contracts/admin-financial-report-contract.md](./contracts/admin-financial-report-contract.md)
- [quickstart.md](./quickstart.md)
