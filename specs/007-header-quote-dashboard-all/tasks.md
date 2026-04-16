# Tasks: Header Quote Layout and All-Time Dashboard Metrics

**Input**: Design documents from `/specs/007-header-quote-dashboard-all/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅
**Branch**: `007-header-quote-dashboard-all`

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = all-time metrics, US2 = quote layout)
- Lint gate (`npm run lint`) MUST pass on every touched file before marking a task complete

## Phase 1: Setup

**Purpose**: No new project structure needed — this feature modifies existing files and adds
one new hook file to an existing directory. No migrations, no new packages, no config changes.

- [x] T001 Verify branch `007-header-quote-dashboard-all` is active and working tree is clean

**Checkpoint**: Branch confirmed — user story implementation can begin in parallel

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No shared blocking prerequisites — User Story 1 and User Story 2 touch completely
disjoint files and can be implemented independently and in any order.

**⚠️ Both phases (3 and 4) may start immediately after T001.**

---

## Phase 3: User Story 1 — All-Time Admin Dashboard Metrics (Priority: P1) 🎯 MVP

**Goal**: Replace the single-day dashboard query with an all-time aggregate so every metric
card reflects the sum of all booking days, not just today.

**Independent Test**: Log in as admin → navigate to Dashboard → confirm the four metric cards
(Total Bookings, Expected Revenue, Revenue Collected, Pending) show cumulative totals across
all rows in `dashboard_metrics`, not just today's date. Verify zero-value render when no data.

### Implementation for User Story 1

- [x] T002 [P] [US1] Create `useAllTimeMetrics` hook with `AllTimeMetrics` interface in `src/features/dashboard/useAllTimeMetrics.ts` — query all rows from `dashboard_metrics` (no date filter), reduce to four summed fields; return `{ total_bookings: 0, ... }` when result is empty
- [x] T003 [US1] Update `src/features/admin/AdminDashboardPage.tsx` — replace `useDashboardMetrics(dateStr)` with `useAllTimeMetrics()`, remove `format` and date-fns import (if unused), update card heading text from "Today's …" to "Total …" per contracts/AdminDashboardUI.ts

**Checkpoint**: Admin dashboard shows all-time totals. Verify with quickstart.md § User Story 1.

---

## Phase 4: User Story 2 — Quote Displayed Beside Header Title (Priority: P2)

**Goal**: Move the motivational quote from stacked-below-subtitle to the right of the title
block in a three-zone flex row, keeping the bell on the far right; header stays compact on mobile.

**Independent Test**: Open the player calendar page → confirm the quote appears in the same
horizontal row as "THE SHUTTLE" title, NOT below the subtitle. Resize to 375 px — quote must
truncate gracefully, bell must remain on far right. Empty-QUOTES array → no empty gap.

### Implementation for User Story 2

- [x] T004 [P] [US2] Update `src/features/players/header/QuoteArea.tsx` — change wrapper div from `className="mt-2 text-center px-2"` to `className="px-2"` (remove `mt-2` and `text-center` per contracts/PublicHeaderUI.ts)
- [x] T005 [US2] Restructure header flex layout in `src/layouts/PublicLayout.tsx` — replace single centred div (title + subtitle + QuoteArea) with three-zone row: Zone 1 `shrink-0` (h1 + subtitle p), Zone 2 `flex-1 min-w-0` (QuoteArea), Zone 3 `shrink-0 self-start pt-1` (BellNotification); outer container `flex items-center gap-3` per contracts/PublicHeaderUI.ts

**Checkpoint**: Quote is beside the title at all three breakpoints. Verify with quickstart.md § User Story 2.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T006 Run lint gate on all touched/new files and confirm zero errors: `src/features/dashboard/useAllTimeMetrics.ts`, `src/features/admin/AdminDashboardPage.tsx`, `src/features/players/header/QuoteArea.tsx`, `src/layouts/PublicLayout.tsx`

---

## Dependencies

```
T001 (branch check)
├── T002 [P] [US1] Create useAllTimeMetrics hook
│   └── T003 [US1] Update AdminDashboardPage
└── T004 [P] [US2] Update QuoteArea classes
    └── T005 [US2] Restructure PublicLayout header
        └── T006 Lint gate (after all implementation tasks)
```

US1 (T002→T003) and US2 (T004→T005) are fully independent and can be worked in parallel.

## Parallel Execution Examples

**Session A** (US1 — metrics):
1. T001 → T002 → T003 → T006

**Session B** (US2 — layout, starts same time as Session A):
1. T001 → T004 → T005 → T006

> T006 (lint gate) should run after both streams complete.

## Implementation Strategy

**MVP** = Phase 3 alone (T001–T003): delivers the highest-priority, higher-business-value
change (all-time dashboard) with zero UI risk. Phase 4 can be deferred if needed.

**Full delivery** = All phases T001–T006.

**Task count**: 6 total (2 per story implementation + 1 setup + 1 lint gate)

| Story | Tasks | Parallel opportunities |
|-------|-------|----------------------|
| US1 (P1) | T002, T003 | T002 parallel with T004 |
| US2 (P2) | T004, T005 | T004 parallel with T002 |
| Setup/Polish | T001, T006 | — |
