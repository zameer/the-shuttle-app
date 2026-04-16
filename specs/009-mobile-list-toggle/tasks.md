# Tasks: Mobile-Friendly Calendar View Toggle

**Input**: Design documents from `specs/009-mobile-list-toggle/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in each description

---

## Phase 1: Setup

**Purpose**: No new dependencies or database migrations required. The `src/features/players/calendar/` directory will be created implicitly by Phase 2.

*No tasks — proceed directly to Phase 2.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared slot-derivation utility that US1 and US2 both depend on. Must be complete before any user-story UI work begins.

**⚠️ CRITICAL**: T001 must be complete before T002 or T004 can start.

- [X] T001 Create `src/features/players/calendar/deriveSlotRows.ts`: export `SlotRowRepresentation` interface `{ slotStart: Date; slotEnd: Date; status: 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'; booking?: Booking; actionable: boolean }`; export `deriveSlotRows(date: Date, bookings: Booking[]): SlotRowRepresentation[]` that generates one row per hour from 06:00 to 22:00 for the given date — for each hour, find the first matching booking by overlapping time window, set its status; if no booking found set status to `'AVAILABLE'`; set `actionable = status !== 'UNAVAILABLE'`; import `Booking` from `@/features/booking/useBookings`

**Checkpoint**: `deriveSlotRows` utility ready — US1 and US2 implementation can begin.

---

## Phase 3: User Story 1 — List View as Default (Priority: P1) 🎯 MVP

**Goal**: Player opens booking page and immediately sees a list view — no toggle interaction required. Player can switch to calendar view and back.

**Independent Test**: Open the player calendar page without interacting. List view is active (SC-001). A "List / Calendar" toggle is visible. Switch to calendar — CalendarContainer renders. Switch back to list — list rows visible again. The currently selected date is preserved across switches.

### Implementation for User Story 1

- [X] T002 [US1] Create `src/features/players/calendar/PlayerListView.tsx`: accept props matching `PlayerListViewProps` from `specs/009-mobile-list-toggle/contracts/PlayerCalendarViewContract.ts` (`currentDate: Date`, `bookings: Booking[]`, `readOnly: boolean`, `isAdmin: boolean`, `onSlotClick?: (date: Date, booking?: Booking) => void`); call `deriveSlotRows(currentDate, bookings)` from `@/features/players/calendar/deriveSlotRows`; render a `<ul role="list" aria-label="Time slot availability">` where each row is a `<li>` with `tabIndex={0}`, `role="listitem"`, `min-h-[44px]` touch target, showing the formatted time range (e.g. `"6:00 AM – 7:00 AM"`) and a status badge; when `!readOnly && row.actionable && onSlotClick`, make the row interactive (call `onSlotClick(row.slotStart, row.booking)`); render an empty-state `<div>` with a `CalendarX` lucide icon and "No slots available for this date." when `bookings.length === 0`

- [X] T003 [US1] Modify `src/features/players/PublicCalendarPage.tsx`: add `import { useState } from 'react'` (already present); add `import PlayerListView from '@/features/players/calendar/PlayerListView'`; add `import { LayoutList, CalendarDays } from 'lucide-react'`; add state `const [displayMode, setDisplayMode] = useState<'calendar' | 'list'>('list')` — default `'list'` per FR-002; insert a display-mode toggle button group above the calendar swipe hint paragraph: two buttons (`LayoutList` icon + "List" label and `CalendarDays` icon + "Calendar" label) with active/inactive Tailwind styling (`bg-white shadow text-gray-900` active, `text-gray-500 hover:text-gray-700` inactive); replace the inner conditional render with: when `displayMode === 'list'` render `<PlayerListView currentDate={currentDate} bookings={secureBookings as Booking[]} readOnly={true} isAdmin={false} />`, else render existing `<CalendarContainer .../>` block; leave all other existing logic (loading skeleton, `currentDate` state, booking query, secure mapping) unchanged

**Checkpoint**: Page loads in list mode by default (SC-001). Toggle switches between views. `currentDate` unchanged by mode switch.

---

## Phase 4: User Story 2 — Booking Parity Across Views (Priority: P2)

**Goal**: List rows apply the same status colour semantics as calendar cells, ensuring players read status consistently in both views. Rows meet minimum touch-target size and keyboard focus requirements.

**Independent Test**: In list view on a date with known CONFIRMED, PENDING, and UNAVAILABLE bookings, confirm row background colours match the status palette used in `CalendarSlot.tsx` (green/yellow/gray/blue). Tab through rows — each receives visible focus ring.

### Implementation for User Story 2

- [X] T004 [P] [US2] Modify `src/features/players/calendar/PlayerListView.tsx` — apply status colour classes to each row matching `CalendarSlot` semantics: `CONFIRMED` → `bg-green-100 border-green-200 text-green-900`; `PENDING` → `bg-yellow-100 border-yellow-200 text-yellow-900`; `UNAVAILABLE` → `bg-gray-100 border-gray-200 text-gray-400`; `AVAILABLE` → `bg-blue-50 border-blue-200 text-blue-900`; add a small coloured dot or `StatusBadge` label beside the status text; add `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none` to each row `<li>` for keyboard focus visibility; ensure each row height is at minimum `min-h-[44px]` (already spec'd in T002 — verify it is present)

- [X] T005 [P] [US2] Modify `src/features/players/calendar/PlayerListView.tsx` — wire `onSlotClick` interaction for actionable rows: when `!readOnly && row.actionable && onSlotClick` is truthy, render the row as a `<button>`-like element (`role="button"` or convert `<li>` to a clickable region) that calls `onSlotClick(row.slotStart, row.booking)` on click and on `Enter`/`Space` keydown; when `readOnly={true}` (public page) rows are non-interactive display-only; add `aria-disabled={!row.actionable}` to UNAVAILABLE rows

**Checkpoint**: Status colours match CalendarSlot palette. Keyboard focus is visible. UNAVAILABLE rows are non-interactive.

---

## Phase 5: User Story 3 — Simplify Rules Banner (Priority: P2)

**Goal**: Remove the standalone "View Full Rules" link from the rules banner. Rule chips and the header button remain as the two valid entry points.

**Independent Test**: Open the player page — the amber rules banner does not contain any "View Full Rules" text or link (SC-005). Clicking a chip still opens the full rules modal (SC-006). The header ClipboardList button still opens the modal.

### Implementation for User Story 3

- [X] T006 [P] [US3] Modify `src/features/players/rules/RulesBanner.tsx`: remove the `<button>` element at the bottom of `<div className="max-w-[1400px]...">` that renders "View Full Rules" with `<ChevronRight>`; remove the `mb-3` class from the chip-row `<div>` that was sizing for that button (it is currently `className="flex flex-wrap gap-2 mb-3"`); remove the `ChevronRight` import from `lucide-react`; leave all chip `<button>` elements and `onViewFullRules` prop unchanged

**Checkpoint**: Banner renders without "View Full Rules" text. Chip buttons still call `onViewFullRules`. Header button still works.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lint verification across all modified and new files.

- [X] T007 Run ESLint on all changed files and confirm no new errors: `npx eslint src/features/players/PublicCalendarPage.tsx src/features/players/calendar/deriveSlotRows.ts src/features/players/calendar/PlayerListView.tsx src/features/players/rules/RulesBanner.tsx`; expected: zero new lint errors in these files (pre-existing errors in unrelated files are out of scope)

---

## User Story Dependencies

- **US1 (P1)**: After Phase 2 (T001) — independent of US2 and US3
- **US2 (P2)**: After T002 (US1 creates PlayerListView first) — US2 modifies the same component; T004 and T005 are parallel with each other
- **US3 (P2)**: After Phase 2 — fully independent of US1 and US2 (different file)

## Parallel Opportunities

- **T004 + T005 (US2)**: Both edit `PlayerListView.tsx` but touch separate logical sections — can be planned and reviewed together; if splitting work, do sequentially in a single file.
- **T006 (US3)**: Runs in parallel with US1 (T002–T003) since it modifies a different file (`RulesBanner.tsx`).
- **T007 (Polish)**: After all implementation tasks complete.

---

## Implementation Strategy

**MVP scope (US1 only)**: T001 → T002 → T003

**Full delivery order**: T001 → T002 + T006 (parallel) → T003 → T004 + T005 (parallel) → T007

| Phase | Tasks | User Story | Parallelisable |
|-------|-------|------------|----------------|
| Foundational | T001 | — | No (baseline) |
| Phase 3 | T002–T003 | US1 (P1) | T002 parallel with T006 |
| Phase 4 | T004–T005 | US2 (P2) | Yes (parallel with each other) |
| Phase 5 | T006 | US3 (P2) | Parallel with T002 |
| Polish | T007 | — | After all implementation |

**Total tasks**: **7 tasks** across 4 active phases.
