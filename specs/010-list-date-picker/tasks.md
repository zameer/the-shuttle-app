# Tasks: Player List View Date Picker

**Input**: Design documents from `specs/010-list-date-picker/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Exact file paths included in each description

---

## Phase 1: Setup

**Purpose**: No new dependencies or database migrations required. The `src/features/players/calendar/` directory already exists from feature 009.

*No tasks — proceed directly to Phase 2.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Adjust the booking query range in `PublicCalendarPage` so list mode fetches a single day instead of a full week. This is a prerequisite for both US1 and US2 since the date-picker's date changes drive the query.

- [X] T001 Modify `src/features/players/PublicCalendarPage.tsx` — update the `useMemo` that computes `startDate`/`endDate`: add `import { startOfDay, endOfDay } from 'date-fns'` alongside existing date-fns imports; change the `useMemo` to branch on `displayMode`: when `displayMode === 'list'` return `{ startDate: startOfDay(currentDate), endDate: endOfDay(currentDate) }`; when `displayMode === 'calendar'` keep existing week/month logic unchanged; the `useMemo` dependency array must include `displayMode` in addition to `currentDate` and `view`

**Checkpoint**: In list mode, `usePublicBookings` is called with a single-day range. In calendar mode, query range is unchanged.

---

## Phase 3: User Story 1 — Date Picker in List View (Priority: P1) 🎯 MVP

**Goal**: A date navigation bar appears above the slot list in list view. Player selects any date via the picker and the slot list immediately updates to that day's availability. Selected date is shared with calendar view.

**Independent Test**: Open the player page in list view. A date label showing today plus a date input control are visible. Change the date to tomorrow — the slot list updates without a page reload and the label updates. Switch to calendar view — calendar is positioned at the same date.

### Implementation for User Story 1

- [X] T002 [US1] Create `src/features/players/calendar/ListDateNav.tsx`: implement as a fully controlled component with props `{ value: Date; onChange: (date: Date) => void }` matching `ListDateNavProps` from `specs/010-list-date-picker/contracts/ListDateNavContract.ts`; render a single responsive row (`flex items-center gap-2 w-full`) containing: (a) a formatted date label `<span>` using `format(value, 'EEEE, d MMMM yyyy')` from `date-fns` (FR-007); (b) a native `<input type="date">` whose `value` is `format(value, 'yyyy-MM-dd')` and whose `onChange` parses the input string with `parseISO` — if the result is an invalid date (use `isValid` from `date-fns`), call `onChange(new Date())`; import `parseISO`, `isValid`, `format` from `date-fns`; apply Tailwind classes so the input is accessible and fits within ≥375 px (SC-005)

- [X] T003 [US1] Modify `src/features/players/PublicCalendarPage.tsx` — wire `ListDateNav` into the list view rendering: add `import ListDateNav from '@/features/players/calendar/ListDateNav'`; in the `displayMode === 'list'` branch, render `<ListDateNav value={currentDate} onChange={setCurrentDate} />` immediately above `<PlayerListView .../>` inside the existing `<div className="w-full">` wrapper; remove the static hint paragraph `"Showing availability for today. Use Calendar view to browse other dates."` that was added in feature 009 (it is now redundant with the date picker present)

**Checkpoint**: List view shows today's date in the picker label. Changing the date updates the slot list. Switching to calendar view shows the same date. SC-001, SC-002, SC-004 satisfied.

---

## Phase 4: User Story 2 — Previous / Next Day Navigation (Priority: P2)

**Goal**: Two arrow buttons flank the date label. Tapping either steps the date by one day and the slot list updates immediately.

**Independent Test**: In list view with today selected, tap the right arrow — date advances one day, slot list updates. Tap left arrow — date goes back one day. Confirm the date picker label tracks correctly. Switch to calendar — calendar is at the arrow-navigated date.

### Implementation for User Story 2

- [X] T004 [US2] Modify `src/features/players/calendar/ListDateNav.tsx` — add prev/next arrow buttons: add `import { ChevronLeft, ChevronRight } from 'lucide-react'` and `import { addDays } from 'date-fns'`; insert a `<button>` with `ChevronLeft` icon before the date label — `onClick={() => onChange(addDays(value, -1))}`; insert a `<button>` with `ChevronRight` icon after the date label and before the date input — `onClick={() => onChange(addDays(value, 1))}`; both buttons: `aria-label` ("Previous day" / "Next day"), `type="button"`, minimum touch target `min-w-[44px] min-h-[44px]`, Tailwind hover and focus-visible ring classes; the overall layout MUST remain within ≥375 px without overflow — use `min-w-0 flex-1` on the label span and `shrink-0` on buttons if needed

**Checkpoint**: Prev/next arrows work. Date label and slot list update on each tap. Keyboard focus rings visible. SC-003, SC-005 satisfied.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Lint verification across all new and modified files.

- [X] T005 Run ESLint on all changed files and confirm no new errors: `npx eslint src/features/players/PublicCalendarPage.tsx src/features/players/calendar/ListDateNav.tsx`; expected: zero new lint errors in these files (pre-existing errors in unrelated files are out of scope)

---

## User Story Dependencies

- **US1 (P1)**: After Phase 2 (T001 must complete first — query range adjustment)
- **US2 (P2)**: After T002 (US1 creates `ListDateNav.tsx`; US2 modifies the same file to add arrows)

## Parallel Opportunities

- **T002 (create ListDateNav) + T001 (query range)**: These edit different files and can be worked in parallel.
- **T003 (wire ListDateNav into page)**: Depends on T002 (component must exist first).
- **T004 (add arrows)**: Depends on T002 (same file — must be done after initial component exists, or combined with T002 in one pass).
- **T005 (lint)**: After all implementation complete.

---

## Implementation Strategy

**MVP scope (US1 only)**: T001 → T002 → T003

**Full delivery order**: T001 + T002 (parallel) → T003 → T004 → T005

| Phase | Tasks | User Story | Parallelisable |
|-------|-------|------------|----------------|
| Foundational | T001 | — | Parallel with T002 |
| Phase 3 | T002–T003 | US1 (P1) | T002 ∥ T001 |
| Phase 4 | T004 | US2 (P2) | After T002 |
| Polish | T005 | — | After all implementation |

**Total tasks**: **5 tasks** across 3 active phases.
