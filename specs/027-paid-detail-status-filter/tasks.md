# Tasks: Paid Detail Manual Load Flow

**Input**: Design documents from `/specs/027-paid-detail-status-filter/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/, quickstart.md

**Tests**: No explicit test-first/TDD requirement in spec. This task list uses lint + manual verification tasks only.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

> **Context**: The previous tasks.md implemented auto-load behavior (T001–T018 all complete). This is the updated task list for refactoring `PaidDetailPage` to the manual-load architecture defined in `plan.md` (draft filters + applied filters + Load Details button).

## Completed (Auto-Load Implementation — Superseded)

> The tasks below (T001–T018) implemented the auto-load architecture and are fully complete.
> They are kept for reference only. The manual-load refactoring tasks begin at T019.

- [X] T001 Run baseline lint check with `npm run lint`
- [X] T002 Review current paid-detail contracts
- [X] T003 [P] Add `DetailStatusScope`, `OutstandingBookingStatus`, `PaidDetailFilterInput` types in `src/features/admin/financial-reports/types.ts`
- [X] T004 [P] Add Zod schemas in `src/features/admin/financial-reports/schemas.ts`
- [X] T005 Extend service filtering logic in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T006 Update `usePaidDetail` hook in `src/features/admin/financial-reports/usePaidDetail.ts`
- [X] T007 [US1] Initialize scope state in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T008 [US1] Add scope selector UI in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T009 [US1] Wire scope to `usePaidDetail` + reset pagination in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T010 [US1] Render summary/table/empty-state from hook output in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T011 [US2] Add booking-status multi-select UI in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T012 [US2] Toggle handlers + minimum-one guard in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T013 [US2] Pass `outstandingStatuses` into hook input in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T014 [US2] Status filtering in service in `src/features/admin/financial-reports/financialReportService.ts`
- [X] T015 [US2] Hook validation for status arrays in `src/features/admin/financial-reports/usePaidDetail.ts`
- [X] T016 Quickstart validation
- [X] T017 Navigation regression check
- [X] T018 Final lint gate

---

## Phase 1: Setup — Manual Load Refactor

**Purpose**: Confirm baseline, review current auto-load code, and identify exact change surfaces.

- [X] T019 Run baseline lint check with `npm run lint` and record current error count in `package.json`
- [X] T020 [P] Review current `PaidDetailPage.tsx` auto-load wiring against `specs/027-paid-detail-status-filter/contracts/PaidDetailPageContract.ts` and `specs/027-paid-detail-status-filter/contracts/PaidDetailFiltersContract.ts`

---

## Phase 2: Foundational — Type and Hook Updates

**Purpose**: Extend the type system and hook interface to support manual-load (draft vs applied state). These changes block both user story phases.

**⚠️ CRITICAL**: Complete before US1 and US2 page work.

- [X] T021 [P] Add `PaidDetailDraftFilters` and `PaidDetailAppliedFilters` interface types alongside existing `PaidDetailFilterInput` in `src/features/admin/financial-reports/types.ts`
- [X] T022 Update `usePaidDetail` hook signature to accept `(appliedFilters: PaidDetailFilterInput, enabled: boolean)` and gate query execution on `enabled` in `src/features/admin/financial-reports/usePaidDetail.ts`

**Checkpoint**: Hook is callable with `enabled=false` before first load and executes only when `enabled=true`.

---

## Phase 3: User Story 1 — Manual Load Control (Priority: P1) 🎯 MVP

**Goal**: Admin can edit date + scope filters in draft state without triggering a fetch; clicking Load Details applies current draft and refreshes results. No data loads on page open.

**Independent Test**: Open `/admin/reports/paid-detail`, verify no data fetch occurs and pre-load guidance is visible; change date/scope filters and verify table still shows guidance; click Load Details and verify table/summary populate for the selected filters.

### Implementation for User Story 1

- [X] T023 [US1] Replace single filter state in `PaidDetailPage.tsx` with `draftFilters` state (startDate, endDate, scope, outstandingStatuses) and `appliedFilters` state initialized to `null` in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T024 [US1] Add `hasLoadedOnce` boolean state (default `false`) and render a pre-load guidance message when `hasLoadedOnce === false` in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T025 [US1] Wire all filter controls (date inputs, scope selector) to update `draftFilters` only — do NOT copy to `appliedFilters` on change in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T026 [US1] Add `Load Details` button in the filter section; on click: copy `draftFilters` → `appliedFilters`, set `hasLoadedOnce = true`, reset pagination to page 1 in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T027 [US1] Pass `appliedFilters` and `enabled={hasLoadedOnce}` into updated `usePaidDetail` hook call in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T028 [US1] Ensure table, summary cards, and empty-state message render from `usePaidDetail` output only (not from draft state) in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`

**Checkpoint**: Page opens with no data fetch; Load Details triggers fetch with current filters; filter edits do not auto-refresh.

---

## Phase 4: User Story 2 — Outstanding Status Multi-Select with Manual Load (Priority: P1)

**Goal**: OUTSTANDING booking-status multi-select (CONFIRMED, CANCELLED, NO_SHOW all default-selected) participates in the draft filter state and is applied together with scope + dates on Load Details click.

**Independent Test**: Select OUTSTANDING scope, verify booking-status multi-select is visible with all three selected; change selections without clicking Load Details and confirm results are unchanged; click Load Details and confirm rows show only selected booking statuses.

### Implementation for User Story 2

- [X] T029 [US2] Confirm `draftFilters.outstandingStatuses` is initialized to all three values (`CONFIRMED`, `CANCELLED`, `NO_SHOW`) and keep the booking-status multi-select wired to `draftFilters` (not `appliedFilters`) in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T030 [US2] Verify `handleStatusToggle` updates only `draftFilters.outstandingStatuses` with minimum-one guard (no auto-fetch side-effect) in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T031 [US2] Confirm that `Load Details` click copies `outstandingStatuses` from `draftFilters` into `appliedFilters` alongside dates and scope (no separate handler needed if T026 does full draft→applied copy) in `src/features/admin/financial-reports/components/PaidDetailPage.tsx`

**Checkpoint**: Changing booking-status selection does not trigger fetch; Load Details applies all filter fields including selected statuses.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Regression verification, quickstart validation, and final lint gate.

- [X] T032 Verify that changing any filter without clicking Load Details never causes a network request to Supabase by reviewing how `enabled` propagates through `usePaidDetail` in `src/features/admin/financial-reports/usePaidDetail.ts`
- [X] T033 [P] Verify reports-to-detail and detail-to-reports navigation remains intact in `src/features/admin/AdminFinancialReportsPage.tsx` and `src/features/admin/financial-reports/components/PaidDetailPage.tsx`
- [X] T034 [P] Validate quickstart scenarios from `specs/027-paid-detail-status-filter/quickstart.md` including no-auto-refresh verification checklist
- [X] T035 Run final lint gate with `npm run lint` and confirm no new errors were introduced in `src/features/admin/financial-reports/` files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; T021 and T022 block page changes.
- **Phase 3 (US1)**: Depends on Phase 2 completion; implements core manual-load refactor.
- **Phase 4 (US2)**: Depends on Phase 3 — `draftFilters` shape must exist before verifying status multi-select wiring.
- **Phase 5 (Polish)**: Depends on US1 + US2 completion.

### User Story Dependencies

- **US1 (P1)**: Core manual-load control; must complete before US2 verification.
- **US2 (P1)**: Verifies that `outstandingStatuses` participates correctly in draft→applied copy already established by US1.

### Within-Story Order

- T021 (types) before T022 (hook) — hook depends on type shapes.
- T023–T025 (state split + control wiring) before T026 (Load Details button) — button needs draft state to copy from.
- T026 (Load Details) before T027 (hook call) — hook call needs `appliedFilters` + `hasLoadedOnce`.

## Parallel Opportunities

- T020 and T021 can run in parallel (different files, both read-only contract review + type addition).
- T033 and T034 can run in parallel (different verification targets, no shared file writes).

## Parallel Example: User Story 1

```bash
# Types review + hook update can overlap contract review
Task: "T021 Add PaidDetailDraftFilters / PaidDetailAppliedFilters in types.ts"
Task: "T020 Review PaidDetailPage.tsx against contracts"
```

## Parallel Example: Polish

```bash
# Navigation regression and quickstart review have no dependency on each other
Task: "T033 Verify navigation in AdminFinancialReportsPage.tsx and PaidDetailPage.tsx"
Task: "T034 Validate quickstart scenarios from quickstart.md"
```

## Implementation Strategy

### MVP First (US1 core manual-load)

1. Complete Phase 1 and Phase 2 (T019–T022).
2. Deliver US1 draft/applied state split + Load Details button (T023–T028).
3. Validate US1 independently (no fetch on page open; Load Details triggers fetch).

### Incremental Delivery

1. Type + hook foundation ready (T021–T022).
2. Page state split + Load Details button (T023–T028).
3. Outstanding status multi-select wiring verification (T029–T031).
4. Regression + lint gate (T032–T035).

### Notes

- **No new npm packages** and **no schema changes** — hard constraints from plan.md.
- Keep filtering logic in service/hook layer; `PaidDetailPage.tsx` must not compute filtered rows directly.
- Responsive breakpoints (375/768/1280) must remain unbroken — Load Details button must be visible without horizontal scroll at mobile width.
- `appliedFilters` is initialized to `null` (or a typed sentinel) so `enabled=false` is naturally derived from `hasLoadedOnce`.
