# Quickstart: Player List View Date Picker

## Prerequisites

- Branch: `010-list-date-picker`
- Feature 009 implementation complete (`PlayerListView`, display-mode toggle in `PublicCalendarPage`)
- Dependencies installed (`npm install` — no new packages required)
- Existing public booking data available (or Supabase local dev running)

## Run

```bash
npm run dev
```

Open the player calendar page (public route, e.g. `/`).

---

## Verification: US1 — Date picker in list view

1. Confirm list view is active by default (feature 009 — no toggle required).
2. Locate the date navigation bar above the slot list — it shows today's date in a readable label (e.g., "Wednesday, 16 April 2026").
3. Use the date picker control to select tomorrow's date.
4. Confirm the slot list updates immediately — no page reload — and the label updates to tomorrow's date.
5. Select a date 7 days ahead. Confirm slot list updates again.
6. Select a past date. Confirm slots render without any error or restriction.
7. Switch to Calendar view. Confirm the calendar is positioned at the same date you last selected in list view.

---

## Verification: US2 — Previous / Next day navigation

1. In list view with today selected, tap the "next day" (chevron-right) button.
2. Confirm the date label advances by one day and the slot list updates.
3. Tap the "previous day" (chevron-left) button twice.
4. Confirm the date label goes back two days from where it was.
5. Switch to Calendar view. Confirm the calendar date matches the last date reached via arrow navigation.

---

## Verification: Edge cases

1. Rapidly tap "next day" 5 times. Confirm the date settles at today + 5 and no stale slot data is visible.
2. At 375 px viewport width, confirm the date picker row (label + prev + next + picker) does not overflow horizontally and has no horizontal scrollbar.

---

## Lint

```bash
npx eslint src/features/players/PublicCalendarPage.tsx src/features/players/calendar/ListDateNav.tsx
```

Expected: zero new lint errors in changed files.
