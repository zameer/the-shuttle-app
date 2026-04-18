# Implementation Plan: Fix Paid Modal UI

**Branch**: `020-fix-paid-modal-ui` | **Date**: 2026-04-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-fix-paid-modal-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Fix paid-details modal UI regressions introduced in feature 019 by ensuring top content is fully visible on open, restoring a visible close icon action, stabilizing pagination visibility and layout, and moving the PAID breakdown action section to the end of report sections. The work remains frontend-only and reuses existing report data contracts and admin authorization.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 6.0.2 with React 19.2.4  
**Primary Dependencies**: React Query 5.99.0, Tailwind CSS 3.4.17, shadcn/ui dialog/button primitives, lucide-react 1.8  
**Storage**: Supabase PostgreSQL with existing RLS model (no schema changes)  
**Testing**: `npm run lint`, focused diagnostics for touched files, manual QA scenarios from quickstart  
**Target Platform**: Web SPA admin console (mobile/tablet/desktop)
**Project Type**: React SPA  
**Performance Goals**: Modal open/close and pagination interactions remain instantaneous from in-memory paid data; no additional report queries for pagination  
**Constraints**: No backend changes, no new DB objects, preserve report math and reconciliation behavior, keep admin-only access intact, maintain responsive behavior at >=375 px, >=768 px, >=1280 px  
**Scale/Scope**: UI and layout refinements in existing report page and modal components under `src/features/admin/financial-reports/` and `src/features/admin/AdminFinancialReportsPage.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before beginning implementation:

- [x] **I. Spec-First**: `specs/020-fix-paid-modal-ui/spec.md` exists with prioritized stories and acceptance scenarios.
- [x] **II. Type Safety**: No new untyped boundaries; existing report DTOs remain typed and no `any` is introduced.
- [x] **III. Component Reusability**: Modal refinements stay in feature components and reuse existing shadcn/ui dialog/button primitives.
- [x] **IV. Data Integrity & Security**: No data-layer changes; report remains under current admin route guard and RLS-protected reads.
- [x] **V. Responsive Design**: Modal content, close action, and pagination visibility are explicitly addressed for mobile/tablet/desktop breakpoints.

If any gate cannot be satisfied, document an exception under "Constitution Exceptions" in this
plan before proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/020-fix-paid-modal-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── paid-modal-ui-contract.md
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── features/
│   └── admin/
│       ├── AdminFinancialReportsPage.tsx
│       └── financial-reports/
│           ├── components/
│           │   ├── PaidBreakdownModal.tsx
│           │   └── PaymentBreakdownSection.tsx
│           ├── index.ts
│           ├── types.ts
│           ├── financialReportService.ts
│           └── useFinancialReport.ts
└── components/
  └── ui/
    └── dialog.tsx
```

**Structure Decision**: Reuse the current single React SPA structure and restrict changes to the admin report page and paid modal feature components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations. No complexity exceptions required.

---

## Phase 0 Research Summary

All open planning questions are resolved in [research.md](./research.md).

| Topic | Decision |
|---|---|
| Top clipping in modal | Use modal layout spacing and scroll-container sizing so first row is visible on initial open |
| Missing close icon | Ensure close icon action is explicitly visible and not obscured by modal overflow/layout |
| Pagination visibility | Keep pagination controls in a consistently visible footer area that does not clip or overlap content |
| Section ordering | Move PAID breakdown section render position to the last section in report page order |
| Data behavior | Preserve existing paid summary/reconciliation calculations; no aggregation changes |

---

## Phase 1 Design

### Key Design Decisions

**D1 - Separate modal scroll region from action/footer region**  
The modal body content will scroll independently while header and pagination footer remain fully visible, preventing top-row clipping and footer crowding.

**D2 - Preserve close affordance in all viewport sizes**  
Close icon visibility is treated as a required modal affordance and validated in responsive layouts to avoid hidden or clipped close actions.

**D3 - Keep pagination presentation robust without changing page math**  
Pagination behavior remains unchanged logically; only visual structure and alignment are adjusted to guarantee clear controls and page indicator display.

**D4 - Reorder report sections at page composition layer**  
PAID breakdown section is moved to the bottom by adjusting section ordering in report page composition, without altering report data contracts.

### Files Expected to Change

| File | User Stories | Planned Change |
|---|---|---|
| `src/features/admin/financial-reports/components/PaidBreakdownModal.tsx` | US1, US2 | Adjust modal spacing, scroll containment, close affordance visibility, pagination footer layout |
| `src/features/admin/AdminFinancialReportsPage.tsx` | US3 | Move paid breakdown section render order to the final section position |
| `src/features/admin/financial-reports/components/PaymentBreakdownSection.tsx` | US3 | Optional copy/layout tweaks if required after section reorder |
| `src/components/ui/dialog.tsx` | US1, US2 | Update shared dialog behavior only if modal-level fixes cannot fully resolve clipping and close-icon visibility |

### Post-Design Constitution Check

- [x] **I. Spec-First**: All design choices map to US1-US3 and FR-001..FR-009.
- [x] **II. Type Safety**: No new untyped contracts; existing report types remain authoritative.
- [x] **III. Component Reusability**: Changes remain in feature-level components while using existing reusable dialog primitives.
- [x] **IV. Data Integrity & Security**: No data mutation or permission model changes.
- [x] **V. Responsive Design**: Modal header/content/footer composition and pagination visibility are explicitly covered across breakpoints.

---

## Artifacts

- [research.md](./research.md)
- [data-model.md](./data-model.md)
- [contracts/paid-modal-ui-contract.md](./contracts/paid-modal-ui-contract.md)
- [quickstart.md](./quickstart.md)
