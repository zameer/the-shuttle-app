# Tasks: Calendar Notice Visibility Control (028)

**Input**: Design documents from `/specs/028-calendar-notice-visibility/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓
**Branch**: `030-create-feature-branch`

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in every task

---

## Phase 1: Setup

> No new project setup needed — all required frameworks and packages already present.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DB constraint update and TypeScript type extension that ALL user story tasks depend on.

**⚠️ CRITICAL**: Both tasks must be complete before any user story work begins.

- [X] T001 [P] Create Supabase migration `supabase/migrations/20260501_add_both_player_display_mode.sql` — drop existing `player_display_mode` check constraint and add new one allowing `'calendar'`, `'closure_message'`, `'both'`
- [X] T002 [P] Extend `PlayerDisplayMode` union type from `'calendar' | 'closure_message'` to `'calendar' | 'closure_message' | 'both'` in `src/features/admin/useCourtSettings.ts` (line 4)

**Checkpoint**: Type compiles with `'both'` as a valid value; migration file exists.

---

## Phase 3: User Story 1 — Control Player View Mode (Priority: P1) 🎯 MVP

**Goal**: Admin can select calendar-only, message-only, or both together; change persists and player page reflects it.

**Independent Test**: Open admin settings, switch each mode (calendar → both → closure_message), save each, and confirm the public player page renders the correct sections.

### Implementation for User Story 1

- [X] T003 [US1] Fix `playerDisplayMode` initialization in `src/features/admin/AdminSettingsPage.tsx` — replace the binary ternary on line 57 (`=== 'closure_message' ? 'closure_message' : 'calendar'`) with a 3-way guard: map `'calendar'`, `'closure_message'`, and `'both'` directly; fall back to `'calendar'` for null or unrecognized values
- [X] T004 [US1] Replace the 2-button mode selector grid in `src/features/admin/AdminSettingsPage.tsx` with a 3-column grid (`grid-cols-1 sm:grid-cols-3`) adding a third "Both" button (`onClick={() => setPlayerDisplayMode('both')}`) with active/inactive styling consistent with existing Calendar and Closure Message buttons
- [X] T005 [US1] Extend save validation in `src/features/admin/AdminSettingsPage.tsx` — update the condition on line 113 from `playerDisplayMode === 'closure_message'` to `playerDisplayMode === 'closure_message' || playerDisplayMode === 'both'` so message content is required when either message-only or both mode is selected

**Checkpoint**: Admin can cycle through all 3 modes; saving 'both' with empty message shows validation error; saving any valid combination persists to Supabase.

---

## Phase 4: User Story 2 — Preserve Existing Notice Workflow (Priority: P1)

**Goal**: PublicCalendarPage shows calendar, message, or both based on the persisted mode; existing notice content continues to work unchanged.

**Independent Test**: With mode='both' saved in admin, verify public page shows ClosureMessagePanel above the calendar. Switch to 'calendar' mode, verify message block is hidden. Switch to 'closure_message', verify calendar is hidden.

### Implementation for User Story 2

- [X] T006 [US2] Replace `isClosureMode` with two derived booleans in `src/features/players/PublicCalendarPage.tsx` — remove line 54 (`const isClosureMode = ...`) and add:
  ```ts
  const mode = courtSettings?.player_display_mode ?? 'calendar'
  const showCalendar = mode === 'calendar' || mode === 'both'
  const showMessage = mode === 'closure_message' || mode === 'both'
  ```
- [X] T007 [US2] Update render logic in `src/features/players/PublicCalendarPage.tsx` — replace all `isClosureMode` references: guard calendar sections behind `showCalendar`, render `ClosureMessagePanel` when `showMessage` is true; when both are true render `ClosureMessagePanel` above the calendar section (so message panel appears first, calendar second)
- [X] T008 [US2] Guard view-mode toggle and CallFAB in `src/features/players/PublicCalendarPage.tsx` — replace remaining `!isClosureMode` guards (lines 93 and 159) with `showCalendar` so these controls only appear when the calendar is visible

**Checkpoint**: Each of the 3 modes renders correctly; ClosureMessagePanel is unchanged; existing message markdown renders in both 'closure_message' and 'both' modes.

---

## Phase 5: User Story 3 — Prevent Invalid Visibility State (Priority: P2)

**Goal**: Admin cannot persist a "neither" state (structurally satisfied by single-select; validation covers empty-message edge case).

**Independent Test**: Select 'both' mode with empty message textarea and attempt save — verify save is blocked with a descriptive validation message. Fill in message and save — verify success.

### Implementation for User Story 3

- [X] T009 [US3] Review and update the validation error message text in `src/features/admin/AdminSettingsPage.tsx` for the case where message content is empty but 'closure_message' or 'both' mode is selected — ensure the message clearly explains that notice content is required for the selected mode (e.g., "Notice message content is required when Message or Both mode is selected.")

**Checkpoint**: Validation message is specific and actionable. FR-008 (neither state) is structurally satisfied by single-select — no additional task needed.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T010 Run `npm run lint` and confirm zero new errors introduced by this feature (baseline: 13 pre-existing errors in unrelated files)

---

## Dependencies (Story Completion Order)

```
T001 (migration)    ──┐
                       ├──► T003 → T004 → T005  [Phase 3 US1]
T002 (type)        ──┘    T006 → T007 → T008  [Phase 4 US2]  ← parallel with Phase 3
                           T009                [Phase 5 US3]  ← after T005
                           T010               [Phase 6]       ← last
```

Phase 3 (AdminSettingsPage) and Phase 4 (PublicCalendarPage) are **parallel** — they touch different files and can be implemented simultaneously after Phase 2 is complete.

---

## Parallel Execution Examples

### After Phase 2 is complete, two developers can work in parallel:

**Track A (AdminSettingsPage)**:
```
T003 → T004 → T005 → T009
```

**Track B (PublicCalendarPage)**:
```
T006 → T007 → T008
```

Then merge and run T010.

---

## Implementation Strategy

**MVP scope**: Phase 2 + Phase 3 alone delivers US1 — admin can persist 'both' mode to the DB with full validation. Phase 4 then makes the player page reflect it. MVP is Phases 2–4 together (all P1 stories).

**US3 (P2)** is a one-task polish step (T009) that improves the validation message text only — it does not block MVP delivery.

**Incremental delivery order**:
1. T001 + T002 (foundation, can be done in parallel)
2. T003 → T004 → T005 (admin UI — US1)
3. T006 → T007 → T008 (public page — US2, can start after T002)
4. T009 (validation copy — US3)
5. T010 (lint gate)
