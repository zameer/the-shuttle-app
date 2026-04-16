# Research: Player List View Date Picker

## Decision 1: Date picker UI component

- **Decision**: Use a native `<input type="date">` styled to match the project's Tailwind design language, wrapped in the `ListDateNav` component. The formatted human-readable label (FR-007) is rendered separately via `date-fns` `format()`.
- **Rationale**: Zero new dependencies. Mobile browsers (iOS Safari, Android Chrome) natively support `input[type=date]` with a well-optimised picker UX. Aligns with the spec assumption that no third-party calendar widget will be introduced.
- **Alternatives considered**:
  - shadcn/ui Popover + Calendar: rejected — it is an additional heavy component and `input[type=date]` already covers the requirement with better mobile native UX.
  - react-day-picker: rejected — external dependency, unnecessary for this scope.

## Decision 2: ListDateNav placement

- **Decision**: Create `src/features/players/calendar/ListDateNav.tsx` — a controlled component accepting `value: Date`, `onChange: (date: Date) => void`. Rendered by `PublicCalendarPage` above `PlayerListView` when `displayMode === 'list'`.
- **Rationale**: Keeps `PlayerListView` a pure display-only component (only slot rows, no navigation state). All date state management stays lifted in `PublicCalendarPage`.
- **Alternatives considered**:
  - Embed date nav inside `PlayerListView`: rejected because it would make `PlayerListView` stateful and harder to test in isolation.

## Decision 3: Booking query range adjustment for list mode

- **Decision**: Extend the existing `useMemo` in `PublicCalendarPage` to branch on `displayMode`: when `'list'`, use `startOfDay(currentDate)` / `endOfDay(currentDate)`; when `'calendar'`, use the existing week/month logic.
- **Rationale**: `deriveSlotRows` operates on a single day. Querying a full week in list mode would over-fetch data not displayed. Single-day range is sufficient and more efficient.
- **Alternatives considered**:
  - Always query week regardless of mode: rejected — wastes bandwidth on mobile; slot rows only render one day at a time.

## Decision 4: currentDate state reuse (no new state)

- **Decision**: Pass the existing `currentDate` / `setCurrentDate` from `PublicCalendarPage` as `value` / `onChange` into `ListDateNav`. No new state atom required.
- **Rationale**: FR-005 requires the selected date to be preserved when switching views. Since both list and calendar modes share `currentDate`, switching modes automatically preserves the date.
- **Alternatives considered**:
  - Separate `listDate` state: rejected — would require synchronisation logic and could cause desync bugs.

## Decision 5: Prev / Next navigation granularity

- **Decision**: Use `addDays(currentDate, 1)` and `addDays(currentDate, -1)` from `date-fns` (already installed) as the handlers for the next/previous buttons.
- **Rationale**: One-day steps match the list view's single-day slot display. `date-fns` is already in the project dependency tree.
- **Alternatives considered**:
  - Week-step navigation: rejected — too coarse for a day-by-day list view.
