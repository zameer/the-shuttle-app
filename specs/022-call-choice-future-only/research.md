# Research: 022 — Player Call Choice and Future-Only Dates

**Date**: 2026-04-19  
**Branch**: `021-route-callback-requests`

## Research Questions

Three unknowns were identified from the Technical Context:

1. Speed-dial FAB animation using Tailwind CSS only (no framer-motion)
2. Filtering list-view slots to "current time onward" with date-fns
3. Preventing CalendarContainer navigation into past weeks/months

---

## Decision 1: Speed-Dial FAB Animation

**Decision**: Use Tailwind CSS `transition`, `translate-y`, and `opacity` utility classes toggled via a `boolean` React state (`isOpen`). Each child action button receives `translate-y-0 opacity-100` when open and `translate-y-4 opacity-0 pointer-events-none` when closed.

**Rationale**: 
- No new dependencies (no framer-motion, no @headlessui/react beyond what is already present).
- Tailwind transitions (`transition-all duration-200 ease-out`) produce smooth expand/collapse on all target devices.
- The speed-dial pattern is a well-established mobile UX convention; vertical stacking above the FAB matches Material Design speed-dial, which players will recognise.
- `pointer-events-none` on closed state prevents accidental taps during the closing animation.

**Alternatives Considered**:
- **CSS keyframe animations via `@keyframes`**: Possible but requires custom Tailwind config; Tailwind utility transitions are sufficient and simpler.
- **Framer Motion `AnimatePresence`**: Would require installing `framer-motion` (~35 KB); rejected as over-engineering for a two-button reveal.
- **Bottom sheet (shadcn Sheet)**: Rejected per clarification Q5 — speed-dial is the agreed pattern.

**Implementation Note**: The main FAB toggles `isOpen`. Clicking outside (using a `useEffect` on `mousedown`/`touchstart`) or pressing Escape closes the chooser. Each child action button also closes the chooser on click before executing its action.

---

## Decision 2: Filtering List Slots to Current Time Onward

**Decision**: In `PlayerListView.tsx`, after `deriveSlotRows` produces rows, filter out any row where `row.slotEnd` is before `new Date()` (current local time). Apply this filter only when the `currentDate` is the same calendar day as today (using `isToday(currentDate)` from date-fns).

**Rationale**:
- `deriveSlotRows` already returns `slotStart` and `slotEnd` as `Date` objects, making this a cheap array filter — no new hook or RPC call.
- Comparing `slotEnd < now` (not `slotStart`) means a slot that has started but not yet ended remains visible — a slot starting at 9:00 is still shown at 9:30, which is correct behaviour.
- The `isToday` guard ensures future-day list views are never filtered (only today's list applies intra-day filtering).

**Alternatives Considered**:
- **Filter at the query level (pass `now` as `startDate`)**: Already done for the outer date range, but `deriveSlotRows` produces synthetic "AVAILABLE" slots from court settings that are not returned by the booking query — so query-level filtering alone is insufficient.
- **Filter by `slotStart < now`**: Rejected because a slot that has already started (e.g., 9:00 when current time is 9:15) is still partially available and should remain visible.

---

## Decision 3: Preventing Past Navigation in Calendar and List Views

**Decision**: 

**ListDateNav**: Add a `minDate: Date` prop. Set `min={format(minDate, 'yyyy-MM-dd')}` on the `<input type="date">`. Disable the "previous day" chevron button when `isSameDay(value, minDate) || isBefore(value, minDate)`.

**CalendarContainer**: Add an optional `minDate?: Date` prop. In `prev()`, before calling `onDateChange`, compute the proposed new date and compare against `startOfWeek(minDate)` (week view) or `startOfMonth(minDate)` (month view) — skip the navigation if the proposed date would be before the min boundary.

**Rationale**:
- Keeping the guard in the nav components (not in the page) means the page simply passes `startOfToday()` as `minDate` and has no navigation logic to maintain.
- The HTML `min` attribute on `<input type="date">` provides an additional browser-native guard for typed date input.
- `isSameDay` check for disabling prev button handles the exact-today boundary without flickering at midnight.

**Alternatives Considered**:
- **Clamping `currentDate` in the page on every render**: Would require `useEffect` with side effects; guarding at the nav level is cleaner.
- **Hiding the prev button entirely on today**: Chosen approach (disable, not hide) is better for accessibility — the button remains in the tab order with a disabled state rather than disappearing.

---

## Resolved NEEDS CLARIFICATION Items

All Technical Context items were fully known from the existing codebase — no NEEDS CLARIFICATION remained after spec review. Research above documents implementation decisions not ambiguities.

## Summary Table

| Decision | Chosen Approach | Key Constraint |
|---|---|---|
| Speed-dial FAB animation | Tailwind `transition` + `translate-y`/`opacity` via state | No new dependencies |
| Intra-day slot filtering | `filter(row => !(isToday(date) && row.slotEnd < now))` in `PlayerListView` | Only applied when `isToday(currentDate)` |
| Nav past-date guard | `minDate` prop on `ListDateNav` + `CalendarContainer` | HTML `min` attribute + button disabled state |
