# Tasks: Fix Paid Modal UI

**Input**: Design documents from `/specs/020-fix-paid-modal-ui/`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: No new automated tests were explicitly requested in the specification. Validation is via lint, focused diagnostics, and manual QA scenarios from `quickstart.md`.

**Organization**: Tasks are grouped by user story to support independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no unresolved dependency)
- **[Story]**: User story mapping (`US1`, `US2`, `US3`)
- Every task includes an exact file path

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare modal fix workflow and ensure feature entry points remain aligned.

- [X] T001 Confirm paid modal component and report page wiring baseline in `src/features/admin/financial-reports/components/PaidBreakdownModal.tsx` and `src/features/admin/AdminFinancialReportsPage.tsx`
- [X] T002 Align financial-reports feature exports for modal/report composition in `src/features/admin/financial-reports/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stabilize shared modal layout contract and UI primitives before story-specific fixes.

- [X] T003 Define refined modal view-state and pagination-control typing requirements in `src/features/admin/financial-reports/types.ts`
- [X] T004 Refine shared dialog content container behavior for consistent close-icon visibility and viewport fit in `src/components/ui/dialog.tsx`
- [X] T005 Verify report data hooks/services remain unchanged and compatible with UI-only fixes in `src/features/admin/financial-reports/useFinancialReport.ts` and `src/features/admin/financial-reports/financialReportService.ts`

**Checkpoint**: Shared modal/dialog contract is stable and ready for story-specific UI fixes.

---

## Phase 3: User Story 1 - Read Paid Entries Clearly in Modal (Priority: P1) 🎯 MVP

**Goal**: Ensure paid modal opens with first entry fully visible and no top clipping.

**Independent Test**: Open paid details for a range with entries and verify the first row is fully visible at open across supported viewport sizes.

### Implementation for User Story 1

- [X] T006 [US1] Rework paid modal header/content spacing and scroll-region boundaries in `src/features/admin/financial-reports/components/PaidBreakdownModal.tsx`
- [X] T007 [US1] Ensure empty-state and content-first-row visibility remain unclipped in `src/features/admin/financial-reports/components/PaidBreakdownModal.tsx`
- [X] T008 [US1] Validate modal open state defaults and page reset behavior for first-render visibility in `src/features/admin/AdminFinancialReportsPage.tsx`

**Checkpoint**: US1 delivers a readable paid modal with no clipped top content.

---

## Phase 4: User Story 2 - Close and Navigate Paid Modal Reliably (Priority: P1)

**Goal**: Provide a visible close icon and robust pagination area presentation in the paid modal.

**Independent Test**: Open modal on multi-page data, confirm close icon is visible and functional, and verify pagination controls/page indicator remain visible and usable while paging.

### Implementation for User Story 2

- [X] T009 [US2] Ensure visible close icon affordance and accessible close behavior in `src/features/admin/financial-reports/components/PaidBreakdownModal.tsx`
- [X] T010 [US2] Refine pagination footer layout and boundary disabled-state presentation in `src/features/admin/financial-reports/components/PaidBreakdownModal.tsx`
- [X] T011 [US2] Align modal open-trigger copy and control affordances with revised navigation behavior in `src/features/admin/financial-reports/components/PaymentBreakdownSection.tsx`

**Checkpoint**: US2 provides reliable close and page navigation UX in the modal.

---

## Phase 5: User Story 3 - Keep Paid Breakdown Action at Bottom of Report (Priority: P2)

**Goal**: Render PAID breakdown section last in report layout order.

**Independent Test**: Load report page and verify section order is summary, outstanding pending, revenue impact, then paid breakdown; repeat after date-range change.

### Implementation for User Story 3

- [X] T012 [US3] Reorder report section composition so PAID breakdown renders last in `src/features/admin/AdminFinancialReportsPage.tsx`
- [X] T013 [US3] Verify paid section trigger behavior remains intact after section reorder in `src/features/admin/AdminFinancialReportsPage.tsx`

**Checkpoint**: US3 establishes stable, requested report section order.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate final UX fixes and quality gates.

- [X] T014 Verify modal clipping, close action, and pagination visibility against contract expectations in `src/features/admin/financial-reports/components/PaidBreakdownModal.tsx`
- [X] T015 Run lint and resolve touched-file issues via `npm run lint`
- [ ] T016 Execute manual QA scenarios from `specs/020-fix-paid-modal-ui/quickstart.md` and record outcomes in `specs/020-fix-paid-modal-ui/quickstart.md`

---

## Dependencies

- T001 -> T002
- T003 -> T004 -> T005
- T005 -> T006 -> T007 -> T008
- T004, T007 -> T009 -> T010 -> T011
- T005 -> T012 -> T013
- T008, T011, T013 -> T014 -> T015 -> T016

### User Story Completion Order

1. US1 (T006-T008) for modal content visibility MVP
2. US2 (T009-T011) for close icon and pagination UX reliability
3. US3 (T012-T013) for final report section ordering

---

## Parallel Execution Examples

- T003 and T001 can run in parallel (type/contract baseline versus wiring baseline).
- After T005, US1 modal layout work (T006-T008) and US3 section reorder work (T012-T013) can proceed in parallel.
- After T007, one engineer can finish close/pagination UX (T009-T011) while another validates section ordering stability.

Example split:

- Engineer A: T006 -> T007 -> T009 -> T010 -> T011
- Engineer B: T012 -> T013

---

## Implementation Strategy

### MVP First

1. Complete T001-T005 (setup + foundational contract stabilization).
2. Complete T006-T008 (US1) to fix clipped first-row visibility.
3. Validate US1 independently before layering additional UX refinements.

### Incremental Delivery

1. Deliver US1 for immediate modal readability restoration.
2. Add US2 for close/pagination UX robustness.
3. Add US3 for report section order alignment.
4. Finish with lint and manual QA closure.