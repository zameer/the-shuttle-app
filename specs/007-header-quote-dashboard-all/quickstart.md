# Quickstart: Header Quote Layout and All-Time Dashboard Metrics

**Feature**: 007-header-quote-dashboard-all
**Branch**: `007-header-quote-dashboard-all`

---

## Prerequisites

- Node.js 20+, npm installed
- Supabase project running (local or hosted) with `dashboard_metrics` view populated
- `.env.local` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

---

## Development Setup

```bash
cd the-shuttle-ksc
npm install
npm run dev
```

---

## User Story 1 — All-Time Dashboard Metrics

### What was changed

- **New file**: `src/features/dashboard/useAllTimeMetrics.ts`
  - Queries `dashboard_metrics` without a date filter
  - Reduces all rows to `AllTimeMetrics` (four summed fields)
- **Modified**: `src/features/admin/AdminDashboardPage.tsx`
  - Replaced `useDashboardMetrics(dateStr)` with `useAllTimeMetrics()`
  - Removed `format` / date-fns import (no longer needed)
  - Card headings updated from "Today's…" to "Total…"

### Verify all-time metrics

1. Ensure `dashboard_metrics` has data for at least two different `booking_date` values.
2. Open the browser: `http://localhost:5173`
3. Log in as admin → navigate to **Dashboard**.
4. Confirm the four metric cards show totals that reflect **all** booking days combined, not
   just today's date.
5. To double-check, add the daily figures from `dashboard_metrics` manually and compare.

### Zero-data edge case

1. In Supabase Table Editor, ensure `dashboard_metrics` returns no rows (or point to an
   empty test project).
2. Visit the admin dashboard.
3. All four cards should display `0` with no error toast or blank card.

---

## User Story 2 — Quote Beside Header Title

### What was changed

- **Modified**: `src/layouts/PublicLayout.tsx`
  - Header changed from centred title block + stacked QuoteArea → three-zone row:
    title (left) | quote (flex-1) | bell (right)
- **Modified**: `src/features/players/header/QuoteArea.tsx`
  - Wrapper div: removed `mt-2` and `text-center`; quote now left-aligned

### Verify quote placement

1. Open `http://localhost:5173` (player view).
2. Confirm the motivational quote appears **to the right of** "THE SHUTTLE" / "Badminton Court
   Availability", not below it.
3. The bell icon must remain on the far right and be easily tappable.

### Responsive checks

Resize the browser to each breakpoint and confirm:

| Viewport | Expected |
|----------|----------|
| 375 px   | Title on left, quote truncates with ellipsis (line-clamp-2), bell on right |
| 768 px   | Quote expands — may show full text or line-clamp relaxed |
| 1280 px  | All three zones comfortable, no overflow |

### Empty-quote edge case

1. In `src/features/players/header/types.ts`, temporarily set `QUOTES = []`.
2. Reload the player page.
3. Header should render with only title and bell — no empty gap where the quote would be.

---

## Lint Gate

```bash
npm run lint -- --max-warnings 0 \
  src/features/dashboard/useAllTimeMetrics.ts \
  src/features/admin/AdminDashboardPage.tsx \
  src/layouts/PublicLayout.tsx \
  src/features/players/header/QuoteArea.tsx
```

Expected: **0 errors, 0 warnings** on the four changed/new files.

> Pre-existing lint errors in `badge.tsx`, `button.tsx`, `useAuth.tsx`, and other untouched
> files are known and out of scope for this feature.
