# Implementation Plan: Admin Report Refinements

**Branch**: `019-admin-report-refinements` | **Date**: 2026-04-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/019-admin-report-refinements/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Refine the existing admin financial reporting experience from feature 018 by removing the inline pending breakdown, preserving outstanding pending follow-up and revenue-loss sections, and moving paid detail into a modal with pagination. In parallel, change the admin booking screen to start in list view by default while preserving synchronized switching back to calendar mode. Implementation will reuse the existing typed report service/hook architecture and current admin booking page state model, with changes scoped to report contracts, report page composition, and admin booking default UI state.

## Technical Context

**Language/Version**: TypeScript 6.0.2 with React 19.2.4  
**Primary Dependencies**: React Query 5.99.0, Supabase 2.103.0, date-fns 4.1.0, Tailwind CSS 3.4.17, shadcn/ui dialog/button primitives, lucide-react 1.8, zod 4.x  
**Storage**: Supabase PostgreSQL with RLS using existing `bookings`, `players`, and `admin_users` access patterns; no schema changes  
**Testing**: `npm run lint`, focused diagnostics on touched files, manual QA for report modal flows and admin booking default-view behavior  
**Target Platform**: Web SPA admin console on mobile, tablet, and desktop  
**Project Type**: React SPA  
**Performance Goals**: Report page renders within existing feature 018 expectations; paid modal open is immediate from already-loaded report data; pagination changes update visible paid rows without additional server fetches  
**Constraints**: Admin-only access, no new database objects, no `any`, keep all-player date-range reporting, preserve reconciliation between paid detail and summary totals, keep date synchronization between admin list and calendar views  
**Scale/Scope**: Focused refinement of existing files under `src/features/admin/financial-reports/`, `src/features/admin/AdminFinancialReportsPage.tsx`, and `src/features/admin/AdminCalendarPage.tsx`; no backend or migration work

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before beginning implementation:

- [x] **I. Spec-First**: `specs/019-admin-report-refinements/spec.md` exists with prioritized user stories and acceptance scenarios.
- [x] **II. Type Safety**: Existing feature-owned report DTOs remain the contract boundary; refined modal pagination state and paid-detail contract will remain typed and boundary data continues through Zod validation.
- [x] **III. Component Reusability**: Report logic remains in service/hook layers; modal and pagination UI will be built from existing primitives and feature-local presentational components.
- [x] **IV. Data Integrity & Security**: Existing RLS-protected report reads are reused; report remains under admin-only routing; payment aggregation logic stays in service/hook layer rather than UI.
- [x] **V. Responsive Design**: The paid-detail modal and admin booking default view will be specified for ≥375 px, ≥768 px, and ≥1280 px behaviors without breaking current mobile-first layouts.

### Constitution Exceptions

None.

## Project Structure

### Documentation (this feature)

```text
specs/019-admin-report-refinements/
|- plan.md
|- research.md
|- data-model.md
|- quickstart.md
|- contracts/
|  \- admin-report-refinement-contract.md
\- tasks.md          # created by /speckit.tasks
```

### Source Code (repository root)

```text
src/
|- App.tsx
|- features/
|  |- admin/
|  |  |- AdminCalendarPage.tsx
|  |  |- AdminFinancialReportsPage.tsx
|  |  \- financial-reports/
|  |     |- components/
|  |     |  |- PaymentBreakdownSection.tsx
|  |     |  |- OutstandingPendingSection.tsx
|  |     |  \- RevenueImpactSection.tsx
|  |     |- financialReportService.ts
|  |     |- schemas.ts
|  |     |- types.ts
|  |     \- useFinancialReport.ts
|  \- booking/
|     \- useBookings.ts
|- components/
|  |- shared/
|  \- ui/
|     |- button.tsx
|     \- dialog.tsx
\- layouts/
   \- AdminLayout.tsx
```

**Structure Decision**: Continue using the existing single-project React SPA layout. Feature-specific reporting changes stay under `src/features/admin/financial-reports/`, page composition remains in `src/features/admin/`, and shared UI primitives are reused from `src/components/ui/`.

## Complexity Tracking

No constitution violations. No complexity exceptions required.

---

## Phase 0 Research Summary

All clarifications and implementation decisions are resolved in [research.md](./research.md).

| Topic | Decision |
|---|---|
| Pending detail scope | Remove the standalone pending breakdown entirely and rely on summary totals plus outstanding-by-player detail for pending follow-up |
| Paid detail delivery | Keep paid entries in the shared report payload and expose them through an explicit modal trigger instead of an always-visible inline section |
| Pagination strategy | Paginate paid entries client-side from the already-fetched report dataset to avoid extra query complexity and preserve reconciliation |
| Booking default view | Initialize admin booking `displayMode` to `list` while keeping the existing toggle and shared date state intact |
| Responsive behavior | Use a modal layout that collapses to a stacked list on mobile and denser rows/table treatment on larger breakpoints |

---

## Phase 1 Design

### Key Design Decisions

**D1 - Narrow the report contract instead of duplicating pending detail elsewhere**  
The report output will stop presenting a dedicated pending breakdown section in the page contract. Pending totals remain in summary, and player-level pending follow-up remains in the outstanding section. This reduces redundant representations of the same pending data.

**D2 - Keep paid aggregation in the existing report service/hook result**  
The report service already owns reconciliation-safe paid entry aggregation. The UI refinement will reuse that output and layer modal visibility plus pagination state in the page/component layer rather than creating a second fetch path.

**D3 - Use client-side pagination over a single loaded paid-entry array**  
Paid entries are already part of the report response for the selected range. Pagination will slice the in-memory paid array into deterministic pages, avoiding additional server requests and keeping total reconciliation trivial.

**D4 - Default booking view changes only initial state, not navigation semantics**  
Admin booking page behavior remains date-synchronized across list and calendar views. The refinement changes the initial `displayMode` value only, so operational behavior after first render stays consistent with earlier features.

### Files Expected to Change

| File | User Stories | Planned Change |
|---|---|---|
| `src/features/admin/AdminFinancialReportsPage.tsx` | US1-US2 | Remove inline pending breakdown usage, add paid-detail trigger, modal state, and client-side pagination controls |
| `src/features/admin/financial-reports/components/PaymentBreakdownSection.tsx` | US1-US2 | Refactor to support paid-only presentation or split into a paid-detail modal component contract |
| `src/features/admin/financial-reports/types.ts` | US1-US2 | Refine paid-detail paging/view model types if current DTOs are too page-agnostic |
| `src/features/admin/financial-reports/useFinancialReport.ts` | US1-US2 | Preserve reconciliation guarantees while exposing only the refined report contract consumed by the page |
| `src/features/admin/financial-reports/financialReportService.ts` | US1-US2 | Remove any now-unused pending breakdown aggregation if it no longer serves outstanding/report requirements |
| `src/features/admin/AdminCalendarPage.tsx` | US3 | Change default `displayMode` to list while preserving toggle and shared selected-date behavior |

### Post-Design Constitution Check

- [x] **I. Spec-First**: Design maps directly to all three user stories and FR-001..FR-013.
- [x] **II. Type Safety**: Existing Zod boundary validation remains intact and any new modal or pagination structures remain feature-owned typed contracts.
- [x] **III. Component Reusability**: UI refinement is composed from feature-local presentation components and shared shadcn/ui primitives; business logic stays outside UI.
- [x] **IV. Data Integrity & Security**: No new privileged pathways are introduced; admin route guard and existing RLS usage remain unchanged.
- [x] **V. Responsive Design**: Modal, pagination, and default-view behavior have defined mobile/tablet/desktop expectations in the contract.

---

## Artifacts

- [research.md](./research.md)
- [data-model.md](./data-model.md)
- [contracts/admin-report-refinement-contract.md](./contracts/admin-report-refinement-contract.md)
- [quickstart.md](./quickstart.md)
