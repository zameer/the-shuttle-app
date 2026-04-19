# Quickstart: 022 — Player Call Choice and Future-Only Dates

**Date**: 2026-04-19

## Overview

This feature makes two isolated changes to the public player page (`/`):

1. **Speed-dial FAB chooser** — `CallFAB.tsx` is rewritten to expand two action buttons above it when tapped.
2. **Future-only date restriction** — calendar and list views are clamped to today + future; list view additionally hides time slots that have already ended today.

No new npm packages, no migrations, no new files — only existing files are modified.

---

## Files Modified

| File | Change |
|---|---|
| `src/features/players/call/CallFAB.tsx` | Rewrite: 3-state FAB → speed-dial chooser |
| `src/features/players/PublicCalendarPage.tsx` | Init `currentDate` to `startOfToday()`; pass `minDate` to nav/calendar |
| `src/features/players/calendar/ListDateNav.tsx` | Add `minDate` prop; enforce `min` attribute; disable prev button at boundary |
| `src/features/players/calendar/PlayerListView.tsx` | Filter out past slots within today after `deriveSlotRows` |
| `src/components/shared/calendar/CalendarContainer.tsx` | Add `minDate` prop; guard `prev()` against going before min boundary |

---

## How to Test Locally

### 1. Start the dev server

```bash
npm run dev
```

### 2. Test the speed-dial FAB chooser

Open `http://localhost:5173` (public player page).

**Scenario A — Agent available** (seed the `booking_agents` table with a row where `is_active = true` and a valid `phone` number):

1. The FAB appears bottom-right with a phone icon.
2. Tap/click the FAB — it rotates to an X; two buttons animate up above it:
   - **Call Now** (green) — clicking it opens the device call flow / `tel:` link.
   - **Request Callback** (blue) — clicking it opens the callback modal.
3. Tap the FAB again or click outside — chooser collapses.

**Scenario B — No agent available** (ensure no `booking_agents` row is active):

1. FAB appears bottom-right with a phone icon (grey/default colour).
2. Tap FAB — two buttons animate up:
   - **Call Now** — greyed-out, disabled, shows "No agent available" sub-label.
   - **Request Callback** (blue) — still active.

**Scenario C — Loading state** (throttle the network to Slow 3G in DevTools):

1. While `useNextAvailableAgent` is loading, the FAB shows a spinner and is non-interactive.

---

### 3. Test future-only date restriction

**List view — no past dates navigable:**

1. On the public page, ensure list view is selected (default).
2. The date shows today. Click the "previous day" chevron — it should be disabled; clicking has no effect.
3. The date input (`<input type="date">`) should have `min` set to today; typing a past date is rejected by the browser.

**List view — past time slots hidden today:**

1. View today's list. Slots whose end time is before the current local time should not appear.
2. Navigate to tomorrow — all slots for tomorrow appear (no time filtering on future dates).

**Calendar view — no past week/month:**

1. Switch to Calendar view.
2. Click the previous week/month chevron — the navigation should be blocked when already at the current week/month boundary.

---

## Verification Checklist

- [ ] Speed-dial chooser opens and closes correctly
- [ ] "Call Now" is active (green link) when agent phone is available
- [ ] "Call Now" is greyed-out and disabled with "No agent available" label when no agent
- [ ] "Request Callback" always active; opens callback modal
- [ ] Clicking outside the speed-dial group closes it
- [ ] List view "previous day" button is disabled on today
- [ ] List view date input rejects past dates
- [ ] Past time slots within today are hidden in list view
- [ ] Tomorrow's list view shows all slots (no time filter)
- [ ] Calendar week/month prev navigation blocked at current period boundary
- [ ] `npm run lint` — zero errors
- [ ] `npx tsc --noEmit` — zero errors
