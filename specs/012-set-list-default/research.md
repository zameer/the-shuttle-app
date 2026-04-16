# Research: Admin List Hourly Available Slot Display

## Decision 1 — SLOT_STEP_MINUTES Change (Core Requirement)

**Decision**: Change `SLOT_STEP_MINUTES` from `30` to `60` in `src/features/admin/calendar/deriveAdminListRows.ts`.

**Rationale**: This is the single constant that controls available-slot granularity in the cursor-walk algorithm. The while-loop condition `addMinutes(cursor, SLOT_STEP_MINUTES) <= effectiveBStart` naturally produces hourly rows when the step is 60. All other logic (booking-row merging, cursor advancement) is unchanged.

**Alternatives considered**:
- _Add a parameter to `deriveAdminListRows`_: rejected — over-engineering; admin list always uses 60-min steps; callers should not need to know the display granularity.
- _Handle in the component (`AdminListView`)_: rejected — presentation of available rows is a derivation concern, not a render concern; keeping it in the pure function keeps the component stateless.

---

## Decision 2 — Partial Gap Row Handling (FR-004)

**Decision**: After each while-loop that fills 60-min available rows, add a conditional block that emits one partial-gap available row if `cursor < target` (i.e., gap shorter than 60 minutes exists). Apply this both before each booking and at the trailing window boundary.

**Rationale**: With 30-min slots, every gap was always a multiple of 30 minutes (since all booking times were expected to align to 30-min boundaries). With 60-min slots, a booking can start at a :30 boundary (e.g., 08:30), leaving a 30-minute gap that the `while` loop would silently skip — violating FR-004 which requires all unbooked time to be represented.

**Gap-fill pseudocode** (applied before each booking and at window end):
```
// After the while loop for 60-min slots:
if (cursor < effectiveBStart) {
  const partialDuration = (effectiveBStart - cursor) / 60000
  rows.push available row (cursor → effectiveBStart, durationMinutes = partialDuration)
  cursor = effectiveBStart
}
```

**Alternatives considered**:
- _Round booking times to nearest hour for display purposes_: rejected — booking rows must show exact start/end times (FR-002); rounding would be misleading.
- _Only change the step, skip partial gaps_: rejected — violates FR-004 and SC-003 ("no unrepresented time exists between 06:00 and 22:00").

---

## Decision 3 — Booking Row Behaviour (Confirmed Unchanged)

**Decision**: Booking rows continue to be emitted as a single merged row with their exact `start_time → end_time`, unchanged from feature 011. `SLOT_STEP_MINUTES` change has zero effect on booking rows.

**Rationale**: US2 / FR-002 / FR-003 explicitly require this. Feature 011 already implements single-row merging. This feature confirms and preserves that behavior — no code change required for booking rows.

---

## Decision 4 — Scope Boundary (Admin List Only)

**Decision**: Only `src/features/admin/calendar/deriveAdminListRows.ts` is modified. `PlayerListView` / `deriveSlotRows.ts` (public player view) are untouched; they use a separate derivation function with their own step constant.

**Rationale**: Spec assumption explicitly states "no changes to calendar view or public list view." Separate functions per view ensure the two derivation strategies remain independently evolvable.
