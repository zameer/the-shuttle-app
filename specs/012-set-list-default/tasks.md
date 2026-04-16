# Tasks: Admin List Hourly Available Slot Display

**Input**: Design documents from `specs/012-set-list-default/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (no dependencies on in-progress tasks)
- **[Story]**: Maps to user story from spec.md

---

## Phase 2: Core Implementation

**Purpose**: Single-file change — update `SLOT_STEP_MINUTES` and add partial-gap row emission. Both user stories (US1 hourly slots, US2 merged booking rows) are satisfied by this one change; booking-row logic is already correct from feature 011.

- [X] T001 [US1+US2] Modify `src/features/admin/calendar/deriveAdminListRows.ts` — three changes: (1) change constant `SLOT_STEP_MINUTES` from `30` to `60`; (2) inside the `for` loop after the `while` block that fills 60-min available rows before each booking, add an `if (cursor < effectiveBStart)` block that emits one partial available row `{ type: 'available', slotStart: cursor, slotEnd: effectiveBStart, durationMinutes: (effectiveBStart.getTime() - cursor.getTime()) / 60000, status: 'AVAILABLE', actionable: true }` and advances cursor to `effectiveBStart`; (3) after the trailing `while` loop that fills remaining 60-min available rows, add an `if (cursor < scheduleEnd)` block that emits one partial trailing available row `{ type: 'available', slotStart: cursor, slotEnd: scheduleEnd, durationMinutes: (scheduleEnd.getTime() - cursor.getTime()) / 60000, status: 'AVAILABLE', actionable: true }`

**Checkpoint**: A day with zero bookings produces exactly 16 available rows (06:00–22:00 in 1-hour blocks). A booking of any duration appears as exactly one row. Partial gaps adjacent to non-hour-boundary bookings are represented.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T002 [P] Run ESLint: `npx eslint src/features/admin/calendar/deriveAdminListRows.ts` — 0 errors required

---

## Dependencies & Execution Order

- T001 has no dependencies — start immediately
- T002 requires T001 complete

---

## Implementation Strategy

1. Edit `deriveAdminListRows.ts` (T001) — three targeted changes
2. Run lint (T002)
3. Validate manually with quickstart.md verification steps

### Notes

- No new files, no new packages, no schema changes
- Booking rows are untouched — feature 011 already merges them correctly
- `AdminListView.tsx` and `AdminCalendarPage.tsx` do not require any changes
