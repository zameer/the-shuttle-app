# Tasks: Admin Report Refinements

**Input**: Design documents from `/specs/019-admin-report-refinements/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No new automated tests were explicitly requested in the specification. Validation is via `npm run lint`, focused diagnostics, and manual QA scenarios from `quickstart.md`.

**Organization**: Tasks are grouped by user story to support independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no unresolved dependencies)
- **[Story]**: User story mapping (`US1`, `US2`, `US3`)
- Every task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the refined paid-detail UI entry points and feature exports.

- [X] T001 Create paid-detail modal component scaffold in `src/features/admin/financial-reports/components/PaidBreakdownModal.tsx`
- [X] T002 Export refined financial reporting components from `src/features/admin/financial-reports/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Refine the report contract and shared data flow before story-specific UI work.

- [X] T003 Define refined paid-breakdown modal state and report DTO updates in `src/features/admin/financial-reports/types.ts`
- [X] T004 Update report aggregation output to remove standalone pending breakdown dependencies in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T005 Preserve refined report contract and reconciliation checks in `src/features/admin/financial-reports/useFinancialReport.ts`

**Checkpoint**: Shared reporting data is aligned with the refined UI contract; story work can proceed safely.

---

## Phase 3: User Story 1 - Simplified Admin Report Review (Priority: P1) 🎯 MVP

**Goal**: Keep summary totals and outstanding pending follow-up while removing the standalone pending breakdown from the main report page.

**Independent Test**: Open the report for a date range and confirm summary totals remain visible, outstanding pending with slot details remains visible, and no separate pending breakdown section is rendered.

### Implementation for User Story 1

- [X] T006 [US1] Remove standalone pending breakdown rendering from `src/features/admin/financial-reports/components/PaymentBreakdownSection.tsx`
- [X] T007 [US1] Recompose the report page around summary, outstanding pending, and revenue impact sections in `src/features/admin/AdminFinancialReportsPage.tsx`
- [X] T008 [US1] Preserve explicit empty-state messaging for outstanding pending and report-level zero states in `src/features/admin/AdminFinancialReportsPage.tsx`

**Checkpoint**: US1 delivers a simpler main report without losing pending follow-up visibility.

---

## Phase 4: User Story 2 - Review Paid Entries in a Modal with Pagination (Priority: P1)

**Goal**: Move paid detail out of the main page and into a paginated modal that preserves reconciliation with the paid summary.

**Independent Test**: From the report page, open the paid detail modal, move across pages for a multi-page dataset, and verify the visible entries together reconcile to the paid summary totals.

### Implementation for User Story 2

- [X] T009 [US2] Implement paginated paid-detail modal UI in `src/features/admin/financial-reports/components/PaidBreakdownModal.tsx`
- [X] T010 [US2] Refactor the paid breakdown launch surface and empty-state messaging in `src/features/admin/financial-reports/components/PaymentBreakdownSection.tsx`
- [X] T011 [US2] Add paid-detail modal open/close state and client-side pagination controls in `src/features/admin/AdminFinancialReportsPage.tsx`
- [X] T012 [US2] Ensure paid-detail page slices and totals remain reconciliation-safe in `src/features/admin/AdminFinancialReportsPage.tsx`

**Checkpoint**: US2 provides detailed paid visibility without crowding the main report page.

---

## Phase 5: User Story 3 - Open Admin Booking on List View by Default (Priority: P2)

**Goal**: Make the admin booking screen start in list view while preserving the existing toggle and shared date behavior.

**Independent Test**: Open the admin booking screen from a fresh navigation, confirm list view appears first, switch to calendar view, and confirm the selected date remains synchronized.

### Implementation for User Story 3

- [X] T013 [US3] Change the initial admin booking display mode to list in `src/features/admin/AdminCalendarPage.tsx`
- [X] T014 [US3] Preserve shared selected-date and query-range behavior when switching from default list view in `src/features/admin/AdminCalendarPage.tsx`

**Checkpoint**: US3 makes list view the starting layout without changing booking-management navigation semantics.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate refinement quality, lint gates, and manual acceptance.

- [X] T015 Verify paid-detail empty states and reconciliation behavior remain aligned with the refined report contract in `src/features/admin/AdminFinancialReportsPage.tsx`
- [X] T016 Run lint and resolve touched-file issues via `npm run lint`
- [ ] T017 Execute manual QA scenarios from `specs/019-admin-report-refinements/quickstart.md` and record outcomes in `specs/019-admin-report-refinements/quickstart.md`

---

## Dependencies

- T001 -> T002
- T003 -> T004 -> T005
- T005 -> T006 -> T007 -> T008
- T005, T001 -> T009 -> T010 -> T011 -> T012
- T005 -> T013 -> T014
- T008, T012, T014 -> T015 -> T016 -> T017

### User Story Completion Order

1. US1 (T006-T008) for the MVP report simplification
2. US2 (T009-T012) for modal paid-detail review with pagination
3. US3 (T013-T014) for admin booking list-default behavior

---

## Parallel Execution Examples

- T003 and T001 can run in parallel after setup starts (types vs modal scaffold).
- After T005, US2 modal component work (T009) and US3 admin booking default-view work (T013) can proceed in parallel.
- After T009 and T013, one engineer can finish report-page modal integration while another verifies booking view behavior.

Example split:

- Engineer A: T009 -> T010 -> T011 -> T012
- Engineer B: T013 -> T014

---

## Implementation Strategy

### MVP First

1. Complete T001-T005 (setup + foundational contract refinement).
2. Complete T006-T008 (US1) to simplify the report page.
3. Validate the simplified report independently before adding modal paid detail.

### Incremental Delivery

1. Ship US1 once the pending breakdown is removed and outstanding pending remains intact.
2. Add US2 to restore detailed paid review through a modal with pagination.
3. Add US3 to improve the admin booking landing workflow.
4. Finish with lint and manual QA closure.