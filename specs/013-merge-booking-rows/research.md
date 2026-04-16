# Research: Merge Booking Rows in Player Check Screen

## Decision 1 — Replace Hourly Overlap Mapping With Cursor-Walk Row Derivation

**Decision**: Replace the current hourly overlap algorithm in `src/features/players/calendar/deriveSlotRows.ts` with a cursor-walk derivation algorithm that emits:
- one booking row per booking record using exact `start_time → end_time`
- available rows that fill the gaps between bookings in chronological order

**Rationale**: The current implementation loops through fixed hourly buckets and finds the first booking overlapping each hour. That design inherently duplicates multi-hour bookings across multiple rows and cannot accurately represent 30-minute booking boundaries. A cursor-based algorithm solves both problems at the root.

**Alternatives considered**:
- _Patch the hourly algorithm with special-case merging in `PlayerListView`_: rejected — view-layer merging would still depend on lossy hourly buckets and would be brittle around 30-minute edges.
- _Reuse admin `deriveAdminListRows` directly_: rejected — admin rows include admin-specific concerns (`durationMinutes`, `playerName`) and now use 60-minute available slots; player view should remain independently scoped and continue to avoid admin-only data.

---

## Decision 2 — Keep Player Available Rows Hourly, But Permit Partial Gaps Around 30-Minute Bookings

**Decision**: The player view should continue to show primarily hourly availability rows for readability, but it must emit partial available rows when a booking starts or ends on a 30-minute boundary so no time is skipped.

**Rationale**: The user explicitly asked that any 30-minute booking generate the following hours accurately. That means if a booking ends at `08:30`, the next available row must begin at `08:30`, not `09:00`. Partial rows are required to preserve accurate chronology.

**Alternatives considered**:
- _Switch the player view to 30-minute availability rows everywhere_: rejected — not required by the request and would significantly increase row count.
- _Snap all rows back to full hours_: rejected — would violate FR-004 and hide real availability after 30-minute bookings.

---

## Decision 3 — Extend Player Row Contract With Row Type and Duration

**Decision**: Evolve `SlotRowRepresentation` so it can explicitly represent:
- `type: 'booking' | 'available'`
- exact `slotStart`, `slotEnd`
- exact `durationMinutes`
- status and optional booking

**Rationale**: The current row contract is too minimal and implicitly tied to hour-sized cells. The renderer needs to know whether a row is a booking or available gap and may also display duration or labels consistently.

**Alternatives considered**:
- _Infer booking rows using only `booking?: Booking`_: rejected — workable but weaker and less explicit; a discriminated type is easier to reason about and extend.

---

## Decision 4 — Preserve Existing Player Visual Style, Change Only Time Semantics

**Decision**: Keep `PlayerListView.tsx` styling, status colors, and read-only behavior intact. Update it only as needed to consume the richer row model and render exact time ranges.

**Rationale**: The problem is incorrect row derivation, not the UI style. This keeps the change minimal and lowers regression risk.
