# Implementation Plan: Paid Detail Status + Booking-Status Filters

**Branch**: `029-setup-spec-invocation` | **Date**: 2026-05-01 | **Spec**: `specs/027-paid-detail-status-filter/spec.md`
**Input**: Feature specification from `/specs/027-paid-detail-status-filter/spec.md`

## Summary

Enhance the admin Paid Detail page so admins can switch between `PAID` and `OUTSTANDING` records (default `PAID`) and, when viewing `OUTSTANDING`, apply a booking-status multi-select filter (`CONFIRMED`, `CANCELLED`, `NO_SHOW`) with all three selected by default. The implementation reuses existing booking data queries, introduces typed filter contracts plus Zod URL/input validation, and extends service-layer filtering so summary cards and row data remain consistent with selected filters.

## Technical Context

**Language/Version**: TypeScript 6.0.2  
**Primary Dependencies**: React 19.2.4, React Router 7.x, React Query 5.99.0, Zod 4.x, date-fns 4.1.0, shadcn/ui, Tailwind CSS 3.4.17  
**Storage**: Supabase PostgreSQL (existing `bookings` table, read-only for this feature)  
**Testing**: `npm run lint` (required gate), manual admin flow verification per quickstart  
**Target Platform**: Web (admin SPA in modern desktop/mobile browsers)  
**Project Type**: Single-project frontend web application (Vite React app)  
**Performance Goals**: Filter/scope changes should update rendered table/summary without perceptible lag (target <1s for common ranges)  
**Constraints**: No new npm packages; no Supabase schema/migration changes; preserve existing admin route guards; maintain responsive behavior at 375/768/1280 breakpoints  
**Scale/Scope**: One feature page (`PaidDetailPage`) plus related service/hook/type updates; expected dataset is bounded by selected date range and existing pagination

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before beginning implementation:

- [x] **I. Spec-First**: `specs/027-paid-detail-status-filter/spec.md` exists with prioritized user stories and acceptance scenarios.
- [x] **II. Type Safety**: Plan introduces explicit filter/status types and Zod validation for boundary inputs (query/filter payloads); no `any` required.
- [x] **III. Component Reusability**: UI changes remain in `src/features/admin/financial-reports/components/` and use shadcn/ui + Tailwind primitives.
- [x] **IV. Data Integrity & Security**: Uses existing RLS-protected reads only; filtering and aggregation logic remains in hook/service layer, not view-only logic.
- [x] **V. Responsive Design**: Filter controls (date + scope + multi-select) are specified for stacked mobile and row desktop layouts.

No constitution exceptions required.

## Project Structure

### Documentation (this feature)

```text
specs/027-paid-detail-status-filter/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── PaidDetailFiltersContract.ts
│   ├── PaidDetailServiceContract.ts
│   └── PaidDetailPageContract.ts
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── features/
│   └── admin/
│       ├── AdminFinancialReportsPage.tsx
│       └── financial-reports/
│           ├── schemas.ts
│           ├── types.ts
│           ├── usePaidDetail.ts
│           ├── financialReportService.ts
│           └── components/
│               ├── PaidDetailPage.tsx
│               └── PaidDetailStatusBadge.tsx
├── components/
│   └── ui/
└── services/
    └── supabase.ts
```

**Structure Decision**: Keep all implementation within existing admin financial-report feature modules; no new top-level application modules are required.

## Phase Overview

### Phase 0: Research

- Confirm semantic rules for status scope (`PAID` vs `OUTSTANDING`) and interaction with booking-status multi-select.
- Validate URL/query-state and defaulting strategy for repeatable navigation.
- Confirm service-level filtering and summary aggregation approach that avoids UI-only business logic.

### Phase 1: Design and Contracts

- Extend data model with scope/filter entities and typed payloads.
- Define contracts for page behavior, service filtering, and hook inputs/outputs.
- Produce implementation quickstart with ordered steps and acceptance checks.

### Phase 2 (next command `/speckit.tasks`)

- Generate dependency-ordered implementation tasks for route/page/hook/service updates and verification.

## Post-Design Constitution Re-Check

- [x] **I. Spec-First**: Design artifacts trace directly to US1 and US2 in `spec.md`.
- [x] **II. Type Safety**: `data-model.md` and contracts define typed scope/status entities and schema validation points.
- [x] **III. Component Reusability**: UI contract keeps composition inside existing feature components with shadcn/ui primitives.
- [x] **IV. Data Integrity & Security**: No new tables/routes bypassing guards; filtering remains in service/hook layer.
- [x] **V. Responsive Design**: Contract specifies control behavior across mobile/tablet/desktop breakpoints.

Result: PASS (no exceptions required).

## Complexity Tracking

No constitution violations or added architectural complexity requiring justification.
