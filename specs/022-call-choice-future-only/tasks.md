# Tasks: 022 — Player Call Choice and Future-Only Dates

**Input**: Design documents from `specs/022-call-choice-future-only/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/CallFABChooser.ts ✓, quickstart.md ✓

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to
- Exact file paths are included in each task description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure dev environment is running and verify baseline before any changes.

- [X] T001 Confirm `npm run dev` starts without error and `npx tsc --noEmit` produces zero errors (baseline check before any edits)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational infrastructure changes are required for this feature — all changes are additive modifications to existing components. This phase is satisfied by Phase 1 completing successfully.

**⚠️ NOTE**: US1 (speed-dial FAB) and US2 (future-only dates) touch different files and can be implemented in parallel after Phase 1.

**Checkpoint**: Phase 1 complete → both US1 and US2 can begin simultaneously.

---

## Phase 3: User Story 1 — Choose Contact Method (Priority: P1) 🎯 MVP

**Goal**: Replace the three-state `CallFAB` with a speed-dial chooser that always shows both "Call Now" and "Request Callback" — Call Now is disabled-greyed when no agent is available.

**Independent Test**: Open public page → tap FAB → both buttons animate up above it. With agent available: Call Now is a green active link; without agent: Call Now is greyed-out with "No agent available" label; Request Callback is always blue and active. Clicking outside or the X closes the chooser.

### Implementation for User Story 1

- [X] T002 [US1] Rewrite `src/features/players/call/CallFAB.tsx`: replace the three-state component (loading/available/unavailable) with a speed-dial chooser.
  - Add `isOpen: boolean` state (default `false`)
  - Add `useEffect` with `mousedown`/`touchstart` listener on `document` + `keydown` Escape listener to close chooser when clicking outside or pressing Escape; clean up on unmount
  - Render a `fixed bottom-6 right-6 z-50` container wrapping the main FAB and the two action buttons
  - Main FAB: `h-14 w-14 rounded-full` — shows `<Loader2 className="animate-spin">` when `isLoading`; shows `<X>` icon when `isOpen`; shows `<Phone>` icon when closed and not loading
  - Main FAB background: `bg-blue-600 hover:bg-blue-700` always (loading/closed/open — consistent colour, not state-dependent)
  - Two action buttons animate above the FAB using `flex flex-col-reverse gap-3 mb-3`:
    - Each button: `transition-all duration-200 ease-out` + when `isOpen`: `translate-y-0 opacity-100` / when closed: `translate-y-4 opacity-0 pointer-events-none`
    - **"Request Callback"** button (rendered first / appears lower in stack):
      - Always `<button>` (never disabled)
      - `bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-12 flex items-center gap-2 shadow-lg`
      - Icon: `<MessageSquare>` from lucide-react; label `<span className="text-sm font-medium">Request Callback</span>`
      - `onClick`: close chooser → call `onRequestCallback()`
    - **"Call Now"** button (rendered second / appears higher in stack):
      - When `availableAgentPhone` is non-null: render `<a href={\`tel:${availableAgentPhone}\`}>` with `bg-green-600 hover:bg-green-700 text-white rounded-full px-4 h-12 flex items-center gap-2 shadow-lg`; icon `<Phone>`; label `Call Now`; `onClick` closes chooser
      - When `availableAgentPhone` is null: render `<div className="flex flex-col items-end gap-1">` containing: (1) a `<span className="text-xs text-gray-500 text-right pr-1">No agent available</span>` and (2) a `<button disabled>` with `bg-gray-300 text-gray-500 cursor-not-allowed rounded-full px-4 h-12 flex items-center gap-2 shadow-lg opacity-60`; icon `<PhoneOff>`; label `Call Now`
  - When `isLoading` is true: main FAB shows spinner; action buttons container is hidden (`hidden` class or `isOpen` forced `false` during loading — do not show action buttons)
  - `aria-label` on main FAB: `"Contact us"` (always); `aria-expanded={isOpen}` on main FAB button
  - Remove the `showUnavailableMsg` state entirely — it is replaced by the speed-dial pattern

- [X] T003 [US1] Run `npx tsc --noEmit` and `npm run lint` after T002; fix any errors before proceeding

**Checkpoint**: User Story 1 complete. Manually verify all three FAB scenarios (loading, agent available, no agent) work correctly.

---

## Phase 4: User Story 2 — Show Only Current and Future Dates (Priority: P1)

**Goal**: Clamp public calendar/list to today and future. Block past-date navigation in `ListDateNav` and `CalendarContainer`. Filter past time slots within today's list.

**Independent Test**: Open public page → list view shows today only, with "previous day" chevron disabled. Date input rejects past dates. Past time slots for today are not shown. Switching to calendar view — prev week/month navigation is blocked when on current period.

### Implementation for User Story 2

- [X] T004 [P] [US2] Update `src/features/players/calendar/ListDateNav.tsx`: add `minDate?: Date` prop.
  - Import `isSameDay`, `isBefore` from `date-fns`
  - Add `minDate?: Date` to `ListDateNavProps`
  - On the `<input type="date">`: add `min={minDate ? format(minDate, 'yyyy-MM-dd') : undefined}`
  - On the "Previous day" `<button>`: add `disabled={minDate ? (isSameDay(value, minDate) || isBefore(value, minDate)) : false}` and `className` — append `disabled:opacity-40 disabled:cursor-not-allowed` to existing classes
  - In `handleInputChange`: if `minDate` is provided and the parsed date is before `minDate`, call `onChange(minDate)` instead of the parsed value

- [X] T005 [P] [US2] Update `src/components/shared/calendar/CalendarContainer.tsx`: add `minDate?: Date` prop.
  - Import `startOfWeek`, `startOfMonth`, `isBefore` from `date-fns` (add to existing imports — `startOfToday` is already imported)
  - Add `minDate?: Date` to `CalendarContainerProps`
  - In `prev()`: before calling `onDateChange`, compute the candidate date (`subMonths(currentDate, 1)` or `subWeeks(currentDate, 1)`). If `minDate` is provided: for month view check `isBefore(startOfMonth(candidate), startOfMonth(minDate))`; for week view check `isBefore(startOfWeek(candidate), startOfWeek(minDate))` — if either condition is true, return early without calling `onDateChange`
  - On the prev navigation `<button>` (the one calling `prev()`): derive `isPrevDisabled` boolean from the same logic as above, add `disabled={isPrevDisabled}` and `disabled:opacity-40 disabled:cursor-not-allowed` classes

- [X] T006 [US2] Update `src/features/players/calendar/PlayerListView.tsx`: filter past time slots within today.
  - Import `isToday`, `isBefore` from `date-fns` (add to existing imports)
  - After `const rows = deriveSlotRows(...)`: add:
    ```ts
    const now = new Date()
    const visibleRows = isToday(currentDate)
      ? rows.filter(row => !isBefore(row.slotEnd, now))
      : rows
    ```
  - Replace all uses of `rows` in the JSX with `visibleRows`

- [X] T007 [US2] Update `src/features/players/PublicCalendarPage.tsx`: wire up `minDate` and clamp initial date.
  - Import `startOfToday` from `date-fns` (add to existing imports if not already present)
  - Change `useState(new Date())` to `useState(startOfToday())`
  - Pass `minDate={startOfToday()}` to `<ListDateNav>` component
  - Pass `minDate={startOfToday()}` to `<CalendarContainer>` component

- [X] T008 [US2] Run `npx tsc --noEmit` and `npm run lint` after T004–T007; fix any errors

**Checkpoint**: User Story 2 complete. Verify: prev chevron disabled today, date input min enforced, past time slots hidden today, future days show all slots, calendar prev blocked at current week/month.

---

## Phase 5: User Story 3 — Preserve Callback Access During Availability Changes (Priority: P2)

**Goal**: Ensure "Request Callback" remains active and accessible even when immediate call availability changes while the player is on the page.

**Independent Test**: With `useNextAvailableAgent` returning `null` (no agent), callback remains accessible. With availability fluctuating (agent comes and goes), the callback button stays enabled in the speed-dial.

### Implementation for User Story 3

- [X] T009 [P] [US3] Verify that `src/features/players/call/useNextAvailableAgent.ts` refetches on interval or window focus so availability changes are reflected automatically.
  - Read current hook implementation; confirm `staleTime` and `refetchInterval` / `refetchOnWindowFocus` settings
  - If `refetchInterval` is not set, add `refetchInterval: 30_000` so availability is refreshed every 30 seconds without a page reload
  - No changes needed to `CallFAB.tsx` — the speed-dial's "Request Callback" button is always enabled by construction (T002 ensures it is never disabled)

- [X] T010 [US3] Run `npx tsc --noEmit` and `npm run lint` after T009; fix any errors

**Checkpoint**: User Story 3 complete. "Request Callback" is always reachable regardless of agent availability state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility, and responsive checks across all user stories.

- [X] T011 [P] Validate responsive layout: open public page at 375 px viewport width — FAB and speed-dial action buttons must not overflow or overlap content; action labels may be hidden on xs (verify `sm:inline` pattern from contract)
- [X] T012 [P] Validate accessibility: FAB button must have `aria-label="Contact us"` and `aria-expanded`; disabled "Call Now" button must have `aria-disabled="true"`; disabled prev chevrons must have `aria-disabled="true"`
- [X] T013 Run full lint + TypeScript check one final time: `npm run lint ; npx tsc --noEmit` — must produce zero errors
- [X] T014 Manual smoke test against [quickstart.md](./quickstart.md) verification checklist — all 12 items must pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Satisfied by Phase 1 — no additional work
- **Phase 3 (US1) + Phase 4 (US2)**: Both depend on Phase 1 only — **can run in parallel**
- **Phase 5 (US3)**: Depends on Phase 3 (US1) being complete (speed-dial already implements always-active callback)
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5 complete

### User Story Dependencies

- **US1 (Call Choice)**: No dependency on US2 — can start after Phase 1
- **US2 (Future-Only Dates)**: No dependency on US1 — can start after Phase 1
- **US3 (Preserve Callback)**: Depends on US1 (verifies speed-dial always-active property built in T002)

### Within Each User Story

- US2: T004 (`ListDateNav`) and T005 (`CalendarContainer`) are independent [P] — can run in parallel
- US2: T006 (`PlayerListView`) is independent [P] — can run in parallel with T004/T005
- US2: T007 (`PublicCalendarPage`) wires everything up — depends on T004, T005 being complete

### Parallel Opportunities

- T004 + T005 + T006 can all run simultaneously (different files, no shared state)
- T011 + T012 (polish checks) can run simultaneously
- US1 (Phase 3) and US2 (Phase 4) can run in parallel in separate sessions

---

## Parallel Example: User Story 2

```
# These three tasks touch different files — run simultaneously:
T004: Update ListDateNav.tsx (minDate prop)
T005: Update CalendarContainer.tsx (minDate prop + prev guard)
T006: Update PlayerListView.tsx (intra-day slot filter)

# After T004 + T005 complete, wire in the page:
T007: Update PublicCalendarPage.tsx (pass minDate={startOfToday()})
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 3: User Story 1 (T002–T003)
3. **STOP and VALIDATE**: Both contact actions visible; speed-dial opens/closes; greyed-out state correct
4. Continue to Phase 4 (US2) when ready

### Incremental Delivery

1. T001 (baseline check) → foundation confirmed
2. T002–T003 (US1) → speed-dial FAB chooser live
3. T004–T008 (US2) in parallel → future-only dates enforced
4. T009–T010 (US3) → availability refresh confirmed
5. T011–T014 (polish) → full validation pass

### Task Count Summary

| Phase | Tasks | User Story |
|---|---|---|
| Phase 1 (Setup) | 1 | — |
| Phase 2 (Foundational) | 0 | — |
| Phase 3 | 2 | US1 |
| Phase 4 | 5 | US2 |
| Phase 5 | 2 | US3 |
| Phase 6 (Polish) | 4 | — |
| **Total** | **14** | |
