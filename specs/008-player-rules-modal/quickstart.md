# Quickstart: Player Rules — Prominent Banner and Categorised Detail Modal

**Feature**: 008-player-rules-modal
**Branch**: `008-player-rules-modal`

---

## 1. Install New Dependency

```bash
npm install react-markdown
```

> `react-markdown` is NOT yet in `package.json`. This must be the first step of implementation.

---

## 2. Database Migration

Apply the new migration to add the `court_rules` table, RLS policies, and seed data:

```bash
supabase db push
# or
supabase migration up
```

Verify in Supabase Studio:
- `court_rules` table exists with 5 seeded rows
- RLS is enabled; anon role can SELECT; authenticated non-admin cannot INSERT

---

## 3. Environment

No new environment variables are required. The existing `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` in `.env` are sufficient.

---

## 4. Verify: Player Banner Appears

1. Start the dev server: `npm run dev`
2. Open the player home page (public URL, not admin)
3. Confirm a yellow/amber banner is visible between the sponsors bar and the main content
4. Confirm the banner shows chip buttons for each seeded rule section (e.g., "No Music", "Dress Code")

---

## 5. Verify: Modal Opens from Banner

1. Click "View Full Rules" in the banner  
   OR click any chip in the banner
2. Confirm the `RulesModal` dialog opens
3. Confirm each rule section is visible as a collapsible row with an icon and title
4. Click a section to expand it; confirm markdown content renders (bold text, bullet lists)
5. Press Escape or click ✕ to close the modal

---

## 6. Verify: Modal Opens from Header

1. Locate the rules icon button (`ClipboardList`) in the header, beside the bell
2. Click it
3. Confirm the same `RulesModal` opens

---

## 7. Verify: Admin Can Manage Rules

1. Log in as admin; navigate to Settings → Rules tab
2. Confirm the list of 5 seeded rule sections is displayed
3. Click Edit on a rule → change the title → Save → confirm list updates
4. Click ↑/↓ arrows on a rule → confirm sort order changes in the list
5. Click Delete on a rule → confirm it is removed
6. Fill in the Add Rule form → submit → confirm new rule appears in the list and in the player banner/modal

---

## 8. Verify: Empty State

1. Delete all rules via the admin tab
2. Navigate to the player home page
3. Confirm the banner is NOT rendered (no empty banner placeholder)
4. Confirm the header Rules button is NOT shown

---

## 9. Lint Check

```bash
npm run lint -- --max-warnings 0
```

Scope to feature files:
```bash
npx eslint src/features/players/rules/ src/features/admin/useAdminRules.ts src/layouts/PublicLayout.tsx src/features/admin/AdminSettingsPage.tsx
```

Expected: 0 errors, 0 warnings on feature files.

---

## 10. Key Files

| File | Purpose |
|------|---------|
| `supabase/migrations/20260416000000_court_rules.sql` | DB table + RLS + seed |
| `src/features/players/rules/useCourtRules.ts` | React Query read hook |
| `src/features/players/rules/ruleIcons.ts` | Icon lookup map + options |
| `src/features/players/rules/RulesBanner.tsx` | In-flow amber banner |
| `src/features/players/rules/RulesModal.tsx` | shadcn Dialog with sections |
| `src/features/admin/useAdminRules.ts` | CRUD mutation hooks |
| `src/layouts/PublicLayout.tsx` | Modified — adds Rules button + banner + modal |
| `src/features/admin/AdminSettingsPage.tsx` | Modified — adds Rules tab |
