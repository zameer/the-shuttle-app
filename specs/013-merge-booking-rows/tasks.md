# Tasks: Merge Booking Rows in Player Check Screen

**Input**: Design documents from `specs/013-merge-booking-rows/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[Story]**: Maps to user story from spec.md
- Exact file paths included in all descriptions

---

## Phase 1: Setup

No setup work required. This feature reuses the existing public booking query and player list view.

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Replace the player list's hour-bucket derivation with an exact chronological row derivation. This is the core logic both user stories depend on.

**⚠️ CRITICAL**: User story implementation cannot begin until T001 is complete.

- [X] T001 Modify `src/features/players/calendar/deriveSlotRows.ts` to replace the hourly overlap loop with a cursor-walk derivation that emits exact booking rows and gap-filling available rows: expand `SlotRowRepresentation` to include `type: 'booking' | 'available'` and `durationMinutes: number`; keep `slotStart`, `slotEnd`, `status`, `booking?`, `actionable`; import `addMinutes` instead of `addHours`; define `SLOT_STEP_MINUTES = 60`; filter bookings to those overlapping the schedule window (06:00–22:00), sort ascending by `start_time`, clamp each booking to the window, emit full-hour available rows where `cursor + 60min <= effectiveStart`, emit one partial available row when `cursor < effectiveStart`, emit one booking row for the full `effectiveStart → effectiveEnd` range, advance `cursor` to `effectiveEnd`, then fill trailing full-hour rows and one final partial gap row to 22:00

**Checkpoint**: `deriveSlotRows` returns exact chronological rows with no duplicated or skipped time, multi-hour bookings appear once, and 30-minute boundary gaps are preserved.

---

## Phase 3: User Story 1 - See Long Bookings as One Continuous Row (Priority: P1) 🎯 MVP

**Goal**: Long bookings in the player booking check screen appear exactly once with their full time range.

**Independent Test**: Use a date containing a 90-minute booking and a 150-minute booking. Confirm each appears as a single row in the player list view and is not repeated in subsequent hour rows.

- [X] T002 [US1] Modify `src/features/players/calendar/PlayerListView.tsx` to consume the richer derived row model from `deriveSlotRows(currentDate, bookings)`: keep the existing read-only list styling and status colors, continue formatting `slotStart` and `slotEnd` into the time label, preserve keyboard/focus behavior, and ensure the list renders one `<li>` per derived row so a long booking appears once instead of repeating in hourly buckets

**Checkpoint**: 90-minute and 150-minute bookings render as one row each with exact `start – end` labels.

---

## Phase 4: User Story 2 - Show Accurate Availability Around 30-Minute Bookings (Priority: P1)

**Goal**: 30-minute bookings remain accurate and the next available row starts exactly when the short booking ends.

**Independent Test**: Use a date containing an `8:00 AM – 8:30 AM` booking. Confirm the booking renders once and the next row begins at `8:30 AM`, not `9:00 AM`, with no overlap or gap.

- [X] T003 [US2] Verify and adjust `src/features/players/calendar/PlayerListView.tsx` row semantics so partial available rows produced by `deriveSlotRows.ts` render correctly using the exact `slotStart` and `slotEnd` values, while preserving the existing status label mapping (`Reserved`, `Pending`, `Unavailable`, `Available`) and read-only interaction rules

**Checkpoint**: Short bookings and adjacent availability remain strictly chronological with no missing or duplicated intervals.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T004 [P] Run ESLint on `src/features/players/calendar/deriveSlotRows.ts` and `src/features/players/calendar/PlayerListView.tsx` using `npx eslint src/features/players/calendar/deriveSlotRows.ts src/features/players/calendar/PlayerListView.tsx` and resolve any errors before marking the feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **US1 (Phase 3)**: Requires T001 complete
- **US2 (Phase 4)**: Requires T001 complete and depends on the updated renderer from T002
- **Polish (Phase 5)**: Requires T001, T002, and T003 complete

### User Story Dependencies

- **US1 (P1)**: Depends on T001
- **US2 (P1)**: Depends on T001 and builds on the same renderer path as US1

---

## Parallel Opportunities

This feature is intentionally narrow. No safe parallel implementation work is recommended before the derivation rewrite is complete.

---

## Implementation Strategy

### MVP First (US1)

1. Complete T001 — rewrite the derivation function
2. Complete T002 — confirm long bookings render once in the player list view
3. Validate the 90-minute and 150-minute examples from quickstart.md

### Complete Feature (US2)

4. Complete T003 — confirm 30-minute boundary behavior renders accurately
5. Validate the `8:00 AM – 8:30 AM` scenario and edge cases from quickstart.md
6. Complete T004 — lint gate

### Notes

- No new packages, no schema changes, no query changes
- Public list view remains read-only and privacy-safe
- The fix is isolated to the player list derivation and renderer
