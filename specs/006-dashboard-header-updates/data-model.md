# Data Model: Admin Filter and Player Header Updates

**Feature**: 006-dashboard-header-updates  
**Phase**: 1 — Design

---

## Overview

This feature introduces no new Supabase tables or migrations. All new data entities are
in-memory TypeScript types backed by static arrays in
`src/features/players/header/types.ts`. The admin dashboard change is a pure UI removal
with no data-model impact.

---

## Entities

### Quote

Represents a motivational message displayed in the player-facing page header.

```typescript
export interface Quote {
  /** Short motivational text to display in the header */
  text: string;
  /** Optional attribution (coach name, author, club slogan) */
  author?: string;
}
```

**Selection strategy**: `QUOTES[dayOfYear(new Date()) % QUOTES.length]`  
Ensures all visitors on the same calendar day see the same quote.

**Validation rules**:
- `text` must be non-empty; max 200 characters to keep header readable.
- `author` is optional; max 80 characters when present.

**State transitions**: N/A — read-only display value.

---

### Announcement

Represents a club-wide notice shown in the bell notification popover.

```typescript
export interface Announcement {
  /** Stable unique identifier (used as React key) */
  id: string;
  /** Short title shown in the notification list */
  title: string;
  /** Full body text shown when expanded or in popover */
  body: string;
  /** ISO 8601 date string (YYYY-MM-DD) for display */
  date: string;
}
```

**Validation rules**:
- `id` must be unique within the static array.
- `title` max 80 characters.
- `body` max 500 characters.
- `date` must be a valid ISO date string.

**State transitions**:
- Empty array → bell icon has no badge, popover shows "No announcements."
- Non-empty array → bell icon shows count badge (capped display at "9+"), popover lists items.

---

### Sponsor

Represents a sponsor displayed in the sponsors showcase section below the player header.

```typescript
export interface Sponsor {
  /** Stable unique identifier (used as React key) */
  id: string;
  /** Display name of the sponsor (always shown as fallback if no logo) */
  name: string;
  /** Optional absolute URL to sponsor logo image */
  logoUrl?: string;
  /** Optional URL to sponsor's website; wraps the card if provided */
  websiteUrl?: string;
}
```

**Validation rules**:
- `id` must be unique within the static array.
- `name` max 60 characters.
- `logoUrl` must be a valid absolute URL when present; images should be ≤ 120 px tall.
- `websiteUrl` must be a valid absolute URL when present (opens in `target="_blank"` with
  `rel="noopener noreferrer"`).

**State transitions**:
- Empty array → SponsorsSection renders a neutral fallback ("No current sponsors") to prevent
  blank broken space (per FR-009).
- Non-empty array → renders horizontal strip of sponsor cards.

---

## Database Changes

**None.** No migrations. No new Supabase tables. No RLS policy changes.

---

## Removed UI State

### `AdminDashboardPage` — `selectedDate` state

| Before | After |
|--------|-------|
| `const [selectedDate, setSelectedDate] = useState(new Date())` | Removed |
| `format(selectedDate, 'yyyy-MM-dd')` passed as prop | `format(new Date(), 'yyyy-MM-dd')` computed inline |
| Date-navigation button row rendered in JSX | Removed |

The `useDashboardMetrics` hook signature and query logic are **unchanged**.

---

## Static Data Location

```text
src/features/players/header/types.ts

Exports:
  - interface Quote
  - interface Announcement
  - interface Sponsor
  - QUOTES: Quote[]          — initial sample quotes
  - ANNOUNCEMENTS: Announcement[]   — initially empty []
  - SPONSORS: Sponsor[]      — initial sample sponsors
```

All content is editable directly in this file and takes effect on next deploy.
