# Research: Admin Filter and Player Header Updates

**Feature**: 006-dashboard-header-updates  
**Phase**: 0 — Unknowns resolved before design

---

## Decision 1: Dashboard After Date Filter Removal

**Question**: What should the admin dashboard display after the date-navigation control is
removed — today's data by default, all-time totals, or something else?

**Decision**: Keep today's date as the implicit default. The `useDashboardMetrics` hook already
accepts a `dateString`. After removal, the component computes `format(new Date(), 'yyyy-MM-dd')`
once at render (not stored in state) and passes it to the hook. React Query caches by key, so
repeated renders do not trigger extra network calls. The heading copy remains unchanged.

**Rationale**: Minimal diff — only the `useState` and the navigation button row are removed.
The query, caching, and loading logic are untouched. Today's-date semantics are natural for an
operations dashboard that staff checks daily.

**Alternatives considered**:
- *All-time totals*: Requires a new Supabase view/query. Out of scope for this feature.
- *Weekly aggregate*: Same concern — new query shape. Deferred.

---

## Decision 2: Quote Data Source

**Question**: Where do quotes come from? CMS, Supabase table, env variable, or static array?

**Decision**: Static array in `src/features/players/header/types.ts` for MVP. A quote is chosen
once per page session using a date-seeded index (`dayOfYear % quotes.length`) so different
visitors on the same day see the same quote, but it rotates daily without any server call.

**Rationale**: No backend changes required. Content is predictable and reviewable via code
review. Rotating by day-of-year gives variety without randomness per-reload, which looks stable
to users.

**Alternatives considered**:
- *Supabase table*: Adds migration and RLS surface for read-only static content. Disproportionate.
- *Environment variable*: Only supports a single quote; no rotation.
- *External CMS*: External dependency not yet in the stack; violates constitution's stack-first rule.

---

## Decision 3: Announcement / Notification Data Source

**Question**: Where do announcements for the bell icon come from?

**Decision**: Static array in `types.ts` for MVP. When the array is empty, the bell shows a
neutral empty state (no badge, "No announcements" label in popover). When non-empty, the bell
shows a numeric badge capped at 9+ and a popover lists items.

**Rationale**: No schema or RLS changes. Admin can publish an announcement by editing
`types.ts` and re-deploying — acceptable for a small club. The component contract is defined so
a future Supabase-backed hook can be swapped in with zero UI changes.

**Alternatives considered**:
- *Supabase `announcements` table*: Correct long-term direction; deferred — out of this feature's scope.
- *localStorage flags*: Read state is player-scoped per device; inconsistent with club-wide announcements.

---

## Decision 4: Sponsor Data Source

**Question**: Where does sponsor data come from for the sponsors section?

**Decision**: Static array in `types.ts` for MVP. Each sponsor has `{ id, name, logoUrl?, websiteUrl? }`.
When the array is empty, the section renders a neutral fallback message rather than blank space.

**Rationale**: Same as announcements — acceptable for MVP; contract is isolated so a CMS or
Supabase table can replace the static array later.

**Alternatives considered**:
- *Supabase `sponsors` table*: Deferred — see above.
- *Omit section when empty*: Violates FR-009 ("fallback state when not available").

---

## Decision 5: Bell Notification Interaction Pattern

**Question**: How does clicking the bell reveal announcements — popover, modal, slide-over?

**Decision**: shadcn/ui `Popover` component. On trigger-click it opens an anchored panel listing
announcements with title and date. Keyboard-accessible (Tab / Escape) via shadcn primitives.

**Rationale**: Popover is the lightest disclosure pattern. No route change or scroll disruption.
Already available in the shadcn/ui dependency — no new package needed.

**Alternatives considered**:
- *Dialog/Modal*: Overkill for a short announcement list; visually heavy.
- *Dropdown menu*: Suitable but semantically less clear for "notifications."
- *Side drawer*: Better for longer content; over-engineered for MVP.

---

## Decision 6: Sponsors Section Layout Pattern

**Question**: What widely-used sponsor showcase pattern should the sponsors section follow?

**Decision**: Horizontal flex row on desktop, horizontally scrollable on mobile. Each sponsor
is a card with a logo placeholder (or text name fallback) and an optional link wrapping the
card. A muted "Our Sponsors" label sits above the row. This matches the sponsor strip pattern
used by most event and sports club websites.

**Rationale**: Familiar to users, easy to scan, degrades gracefully to text-only when no logo
URL is provided. Horizontal scroll on mobile keeps the layout from wrapping awkwardly.

**Alternatives considered**:
- *Marquee / ticker*: Animated; distracting and less accessible.
- *Grid layout*: Better for 6+ sponsors; overly spacious for 1–3 sponsors.
- *Full-width banner per sponsor*: Only works for a single primary sponsor.

---

## Decision 7: Component File Organization

**Question**: Where do the new components live?

**Decision**: `src/features/players/header/` — a new subdirectory within the players feature,
since QuoteArea, BellNotification, and SponsorsSection are exclusively used by the public
player-facing layout. `types.ts` in the same folder centralizes static data.

**Rationale**: Constitution Principle III places feature-specific components under `src/features/`.
These are not shared across admin and public views, so `src/components/shared/` would be wrong.

---

## Resolved Unknowns Summary

| Unknown | Resolution |
|---------|------------|
| Dashboard metrics after filter removal | Use today's date silently; no query change |
| Quote source | Static array, day-of-year rotation |
| Announcement source | Static array, popover disclosure |
| Sponsor source | Static array, horizontal strip |
| Bell UI pattern | shadcn/ui Popover |
| Sponsor layout | Horizontal flex row, scrollable on mobile |
| Component location | `src/features/players/header/` |
