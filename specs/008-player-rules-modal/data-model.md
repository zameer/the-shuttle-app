# Data Model: Player Rules — Prominent Banner and Categorised Detail Modal

**Feature**: 008-player-rules-modal
**Phase**: 1 — Design

---

## Overview

One new database table (`court_rules`), one new migration, two new hook files, three new
React components, and modifications to `AdminSettingsPage` and `PublicLayout`.

---

## Database: `court_rules` Table

```sql
CREATE TABLE public.court_rules (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT        NOT NULL,
  icon        TEXT        NOT NULL DEFAULT 'ShieldCheck',
  chip_label  TEXT        NOT NULL,
  detail      TEXT        NOT NULL DEFAULT '',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
ALTER TABLE public.court_rules ENABLE ROW LEVEL SECURITY;

-- Players (unauthenticated) can read all rules
CREATE POLICY "Public read court_rules"
  ON public.court_rules FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert, update, delete
CREATE POLICY "Admin manage court_rules"
  ON public.court_rules FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

### Seed Data (initial five rules)

```sql
INSERT INTO public.court_rules (title, icon, chip_label, detail, sort_order) VALUES
  ('No Music Allowed',          'VolumeX',     'No Music',     '**No personal speakers or audio devices** are permitted on court.\n\n- Earphones for personal use are allowed.\n- Bluetooth speakers are strictly prohibited.\n- Respect the residential environment.', 1),
  ('Dress Code Required',       'Shirt',        'Dress Code',   '**Appropriate sports attire is mandatory.**\n\n- Non-marking sports shoes required.\n- No open-toed shoes or slippers on court.\n- Modest sportswear expected at all times.', 2),
  ('Maintain Silence',          'Volume2',      'Silence',      '**Keep noise to a minimum** at all times.\n\n- No shouting or loud celebrations.\n- Speak at a conversational volume.\n- This court is in a residential area — neighbours must not be disturbed.', 3),
  ('Respect Time Slots',        'Clock',        'Time Slots',   '**Strictly observe your booked time slot.**\n\n- Arrive on time and vacate promptly when your slot ends.\n- Do not play beyond your booking.\n- Overruns affect other players and court availability.', 4),
  ('Be Respectful & Responsible','Users',       'Respectful',   '**Treat all players, staff, and equipment with respect.**\n\n- Report any equipment damage immediately.\n- Clean up after yourself.\n- No aggressive language or behaviour will be tolerated.', 5);
```

---

## TypeScript Interfaces

### `CourtRule` — co-located in `src/features/players/rules/useCourtRules.ts`

```typescript
export interface CourtRule {
  id: string
  title: string
  icon: string          // lucide-react icon name stored as string
  chip_label: string
  detail: string        // markdown-formatted string
  sort_order: number
  created_at: string
}
```

### Icon Lookup Map — co-located in `src/features/players/rules/ruleIcons.ts`

```typescript
import {
  ShieldCheck, VolumeX, Shirt, Volume2, Clock, Users,
  Music, MessageSquareOff, Footprints, LucideIcon
} from 'lucide-react'

export const RULE_ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck, VolumeX, Shirt, Volume2, Clock, Users,
  Music, MessageSquareOff, Footprints,
}

export const DEFAULT_RULE_ICON: LucideIcon = ShieldCheck

export const RULE_ICON_OPTIONS = Object.keys(RULE_ICON_MAP)
```

---

## React Query Hooks

### `useCourtRules` — `src/features/players/rules/useCourtRules.ts`

```typescript
// Returns CourtRule[] ordered by sort_order ascending
// queryKey: ['court-rules']
// No auth required (public read RLS)
```

### `useAdminRules` (mutations) — `src/features/admin/useAdminRules.ts`

```typescript
// useCreateRule()  → insert new row
// useUpdateRule()  → update by id
// useDeleteRule()  → delete by id
// useReorderRules() → swap sort_order of two adjacent rules by id
// All invalidate queryKey ['court-rules'] on success
```

---

## Component Inventory

| Component | Location | Purpose |
|-----------|----------|---------|
| `RulesBanner` | `src/features/players/rules/RulesBanner.tsx` | In-flow banner: title, chip row, "View Full Rules" trigger |
| `RulesModal` | `src/features/players/rules/RulesModal.tsx` | shadcn Dialog: collapsible sections + react-markdown |
| Admin rules tab | `src/features/admin/AdminSettingsPage.tsx` [MODIFY] | New 'rules' Tab with CRUD list |

### `PublicLayout.tsx` changes (MODIFY)

- Import `RulesBanner` and `RulesModal`; add `useCourtRules` result as prop or manage modal state at layout level
- Add "Rules" icon button (`ClipboardList`) in header, beside bell — opens modal
- Render `<RulesBanner>` between `<SponsorsSection>` and `<main>`
- When rules array is empty: neither button nor banner renders

### `AdminSettingsPage.tsx` changes (MODIFY)

- `Tab` type: `'hours' | 'terms' | 'rules'`
- New "Rules" tab renders the admin CRUD list: add, edit (inline), delete, reorder up/down
- Each row shows: icon (rendered), title, chip_label, edit/delete buttons, up/down arrows
- "Add Rule" form: title (required), icon (dropdown from `RULE_ICON_OPTIONS`), chip_label (required), detail (textarea, markdown)

---

## Migration File

```
supabase/migrations/20260416000000_court_rules.sql
```

Includes: table creation, RLS enable, two policies, seed INSERT.
