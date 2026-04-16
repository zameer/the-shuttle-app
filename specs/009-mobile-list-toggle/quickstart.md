# Quickstart: Mobile-Friendly Calendar List Toggle

## Prerequisites

- Branch: `009-mobile-calendar-toggle`
- Dependencies installed (`npm install`)
- Existing public booking data available

## Run

1. Start dev server:

```bash
npm run dev
```

2. Open player calendar page.

## Verification: US1 (mobile list view — list is default)

1. Set viewport to 375 px width.
2. Open the player booking page **without taking any action**.
3. Confirm list view is already active — no toggle interaction required (SC-001).
4. Confirm rows are vertically readable with clear time and status labels.
5. Confirm no layout overflow or overlap.
6. Activate the calendar toggle and confirm the calendar view renders.
7. Activate the list toggle and confirm list view returns.

## Verification: US2 (booking parity)

1. In calendar mode, select a known available slot and observe booking initiation path.
2. Switch to list mode and select the equivalent slot.
3. Confirm booking flow entry behavior matches calendar mode.
4. Switch modes repeatedly and confirm current date context remains unchanged.

## Verification: US3 (rules banner simplification)

1. Confirm rules banner no longer shows a "View Full Rules" link.
2. Click a rules chip and confirm rules modal opens.
3. Click header rules button and confirm rules modal opens.

## Lint

Run targeted lint for modified files:

```bash
npx eslint src/features/players/PublicCalendarPage.tsx src/components/shared/calendar/CalendarContainer.tsx src/features/players/rules/RulesBanner.tsx src/features/players/calendar/PlayerListView.tsx
```

Expected: no new lint errors in changed files.
