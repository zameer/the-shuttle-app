# Research: Admin List View Booking Management

## Decision 1 — Row Derivation Strategy for Merged Bookings

**Decision**: Derive admin list rows in two passes:
1. **Booking rows** — one row per booking record, exact `start_time → end_time` (any duration: 30, 60, 90, 150+ min).
2. **Available rows** — 30-minute granular slots filling every gap in the schedule window (06:00–22:00).

**Rationale**: Booking rows must merge because splitting a 90-minute booking into 3 hourly rows obscures duration, confuses status, and breaks the booking → modal action pairing. Available rows stay granular at 30 min so admins can click a specific half-hour slot when creating a new booking.

**Alternatives considered**:
- _1-hour available rows_: rejected — too coarse; admins cannot target a specific 30-min start offset.
- _Split booking rows into 30-min sub-rows_: rejected — would require merging on render and breaks the 1-booking → 1-row → 1-action invariant.
- _Reuse `deriveSlotRows` (current hourly engine)_: rejected — designed for the read-only player view; cannot produce merged booking rows or sub-hour availability.

---

## Decision 2 — Component Location

**Decision**: New components live in `src/features/admin/`:
- `src/features/admin/calendar/deriveAdminListRows.ts` — pure derivation function (no JSX).
- `src/features/admin/AdminListView.tsx` — admin-only list component.

**Rationale**: Admin list view carries admin-specific logic (player name display, booking actions). Constitution III requires feature-specific components under `src/features/`. Placing it alongside `AdminCalendarPage.tsx` keeps admin code co-located.

**Alternatives considered**:
- _Extend `PlayerListView`_: rejected — player view is read-only and strips PII; admin view needs player names and row actions; divergence would require too many conditional branches.
- _`src/components/shared/`_: rejected — it embeds business logic (row actions, status management), violating Constitution III.

---

## Decision 3 — Row Action UI Pattern

**Decision**: A `MoreVertical` icon (⋮) button on the trailing edge of each row. On click:
- **Booking row** → opens existing `BookingDetailsModal` with the associated booking.
- **Available row** → opens `BookingForm` pre-filled with the slot's `start_time`.

**Rationale**: ⋮ is universally understood as "more actions" in admin interfaces. It is compact (fits one-line rows), keyboard-accessible, and does not compete visually with row status information. Reusing existing `BookingDetailsModal` and `BookingForm` avoids duplicating management logic.

**Alternatives considered**:
- _Tap/click anywhere on the row_: rejected — ambiguous; admins may scroll on mobile and accidentally trigger actions.
- _Inline action buttons on each row_: rejected — too wide for mobile; clutters compact list rows.
- _Swipe-to-reveal_: rejected — not a native browser pattern; requires gesture library; over-engineered for MVP.

---

## Decision 4 — Query Range in List Mode

**Decision**: When admin is in list mode, query bookings for `startOfDay(currentDate) → endOfDay(currentDate)`.

**Rationale**: The existing `useBookings` hook accepts `startDate, endDate` parameters. Scoping to a single day mirrors the player list view approach from feature 010 and avoids fetching unused data.

**Alternatives considered**:
- _Keep week-range query and filter on render_: rejected — wastes bandwidth and React Query cache slots on days not shown.

---

## Decision 5 — Default Display Mode for Admin (Feature 011 Scope)

**Decision**: Feature 011 adds the toggle and list mode to `AdminCalendarPage` with default mode set to `'calendar'` (preserving current behavior). Feature 012 (`012-set-list-default`) is the dedicated spec for changing the admin default to `'list'`.

**Rationale**: Separating default-mode change into its own spec (012) keeps feature 011 focused on capability addition. The admin was previously calendar-only; introducing list without changing the startup mode is a safe, incremental rollout.

**Alternatives considered**:
- _Default to list in feature 011_: rejected — feature 012 already captures this intent as a separate, independently testable requirement.

---

## Decision 6 — 30-Minute Schedule Granularity Boundary

**Decision**: The schedule window runs 06:00–22:00 in 30-minute steps (32 possible available slots), clipped by actual booking boundaries.

**Rationale**: This matches the minimum booking unit implied by the user request ("consider 30, 1.30, 2.30 hours") and court scheduling conventions. It aligns with existing `SCHEDULE_START_HOUR = 6` and `SCHEDULE_END_HOUR = 22` constants in `deriveSlotRows.ts`.

**Alternatives considered**:
- _15-minute steps_: rejected — no evidence court allows 15-min bookings; produces unnecessarily dense lists.
- _60-minute steps_: rejected — contradicts explicit requirement to support 30-minute bookings.
