# Research: Player Rules — Prominent Banner and Categorised Detail Modal

**Feature**: 008-player-rules-modal
**Phase**: 0 — Unknowns resolved before design

---

## Decision 1: Markdown Rendering Library

**Question**: How should markdown-formatted rule detail content be rendered in the modal?
The project currently has no markdown renderer. Options: (a) `react-markdown`, (b) custom
parser for a limited subset, (c) store HTML and use `dangerouslySetInnerHTML`.

**Decision**: Install `react-markdown` as a new dependency.

**Rationale**:
- `react-markdown` is the de-facto standard for React markdown rendering; it is lightweight
  (~30 kB gzipped), actively maintained, and outputs safe React elements (no `innerHTML` risk).
- A custom parser for bold/lists/line-breaks would need ongoing maintenance and would diverge
  from what admins expect from markdown editors.
- `dangerouslySetInnerHTML` is prohibited — it is an XSS vector for admin-entered content.
- The constitution allows new dependencies when justified in plan.md.

**Alternatives considered**:
- *Custom renderer*: Fragile; hard to extend when admins request new formatting. Rejected.
- *dangerouslySetInnerHTML*: Security risk (XSS from admin-entered content). Rejected.

---

## Decision 2: Database Table Design for `court_rules`

**Question**: How should the `court_rules` table be structured? What columns are needed?
Should `icon` be stored as a string name or an enum?

**Decision**: New table `court_rules` with columns:
```sql
id          UUID PRIMARY KEY DEFAULT uuid_generate_v4()
title       TEXT NOT NULL
icon        TEXT NOT NULL DEFAULT 'ShieldCheck'   -- lucide-react icon name
chip_label  TEXT NOT NULL                          -- short text for banner chip
detail      TEXT NOT NULL DEFAULT ''               -- markdown string
sort_order  INTEGER NOT NULL DEFAULT 0
created_at  TIMESTAMPTZ DEFAULT NOW()
```
`icon` is stored as a plain string (lucide icon name) — resolved to a component at render time
via a lookup map in the client. No enum — allows adding new icons without a migration.

**Rationale**:
- Mirrors the `court_settings` + `recurring_unavailable_blocks` pattern already in the project.
- `sort_order` integer enables drag-and-drop or up/down reordering without gaps (can use
  simple swap or re-index on save).
- Separate `chip_label` from `title` allows "No Music Allowed" as title and "No Music" as the
  compact chip — shorter chips fit better in the banner row on mobile.

**Alternatives considered**:
- *Store icon as enum*: Requires migration to add new icons. Rejected.
- *Merge chip_label into title (truncate)*: Loses control of the chip text. Rejected.

---

## Decision 3: RLS Policy Pattern

**Question**: What RLS policies does `court_rules` need?

**Decision**: Follow the exact pattern of `recurring_unavailable_blocks`:
- `SELECT`: `anon, authenticated` — rules are public information, no auth required.
- `INSERT / UPDATE / DELETE / ALL`: `authenticated` with `USING (public.is_admin())` and
  `WITH CHECK (public.is_admin())`.

**Rationale**: Players are unauthenticated; they must be able to read rules. Admin writes
are already gated by `public.is_admin()` used in all other admin-managed tables.

---

## Decision 4: React Query Hook Architecture

**Question**: Should player (read) and admin (CRUD) hooks live in the same file?

**Decision**: Two separate files:
- `src/features/players/rules/useCourtRules.ts` — public read-only query
- `src/features/admin/useAdminRules.ts` — admin CRUD mutations (create, update, delete, reorder)

**Rationale**: Matches the project pattern (`useCourtSettings.ts` owns admin hooks while
`useSettings.ts` owns the player read). Keeps player bundle clean — admin mutation code is
never loaded by the player route.

---

## Decision 5: Modal Implementation

**Question**: Use `@base-ui/react` Dialog, shadcn/ui `Dialog`, or a custom modal?

**Decision**: Use shadcn/ui `Dialog` from `src/components/ui/dialog.tsx` — the file already
exists in the project. Wrapping it in a `RulesModal.tsx` feature component keeps the modal
logic isolated.

**Rationale**: The project already has `dialog.tsx` from shadcn/ui. Using it avoids adding
another dialog primitive and is consistent with Constitution Principle III (build on shadcn/ui).
`@base-ui/react` Dialog would be a new import from a different namespace — unnecessary when
shadcn Dialog is already present.

---

## Decision 6: Icon Lookup in Client

**Question**: How does the client map a stored icon string (`"ShieldCheck"`) to a rendered
lucide-react component?

**Decision**: Define a `RULE_ICON_MAP` record in a shared file:
```ts
const RULE_ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck, VolumeX, Shirt, Clock, Users, Music, ...
}
```
The admin form offers a fixed list of selectable icons (dropdown); the player view resolves
the stored name to the component via the map, with `ShieldCheck` as the fallback.

**Rationale**: Avoids dynamic imports or eval. The icon set is small and bounded (≤15 options).
Admins pick from a curated list; unknown strings fall back to a safe default.

---

## Decision 7: Admin Reorder UX

**Question**: How should the admin reorder rule sections? Drag-and-drop, or up/down buttons?

**Decision**: Up/Down arrow buttons on each row (simpler, no drag-and-drop library needed).
On click, swap `sort_order` values of adjacent rows and save both via a single mutation batch.

**Rationale**: Adding a drag-and-drop library (e.g., `@dnd-kit`) for 5–10 rule rows is
over-engineering. Simple up/down buttons are accessible, keyboard-friendly, and match the
simpler admin UX already in the project.

**Alternatives considered**:
- *@dnd-kit drag-and-drop*: 10 kB+ addition; overkill for a short list. Rejected.

---

## Resolved Unknowns Summary

| Unknown | Resolution |
|---------|------------|
| Markdown renderer | `react-markdown` (new dependency) |
| Table design | `court_rules` with title, icon, chip_label, detail, sort_order |
| RLS pattern | Public SELECT; admin-only DML via `is_admin()` |
| Hook architecture | Split: player `useCourtRules.ts` + admin `useAdminRules.ts` |
| Modal primitive | shadcn/ui `Dialog` (already in `src/components/ui/dialog.tsx`) |
| Icon lookup | `RULE_ICON_MAP` record; curated admin dropdown; `ShieldCheck` fallback |
| Admin reorder UX | Up/Down buttons; swap sort_order; no drag-and-drop library |
