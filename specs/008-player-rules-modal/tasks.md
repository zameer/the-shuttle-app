# Tasks: Player Rules — Prominent Banner and Categorised Detail Modal

**Input**: Design documents from `specs/008-player-rules-modal/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in each description

---

## Phase 1: Setup

**Purpose**: Install new dependency and apply database migration — blocks all user stories.

- [X] T001 Run `npm install react-markdown` and verify it appears in `package.json` dependencies
- [X] T002 Create migration `supabase/migrations/20260416000000_court_rules.sql`: CREATE TABLE `court_rules` (id UUID PK, title TEXT, icon TEXT DEFAULT 'ShieldCheck', chip_label TEXT, detail TEXT, sort_order INTEGER, created_at TIMESTAMPTZ); enable RLS; add public SELECT policy for `anon, authenticated`; add admin ALL policy using `public.is_admin()`; INSERT 5 seed rows (No Music / VolumeX, Dress Code / Shirt, Maintain Silence / Volume2, Respect Time Slots / Clock, Be Respectful / Users)

**Checkpoint**: Migration applied, `react-markdown` installed — implementation can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared utilities and the read hook used by both US1 and US2. Must be complete before UI components.

- [X] T003 [P] Create `src/features/players/rules/ruleIcons.ts`: export `RULE_ICON_MAP: Record<string, LucideIcon>` mapping ShieldCheck, VolumeX, Shirt, Volume2, Clock, Users, Music, MessageSquareOff, Footprints; export `DEFAULT_RULE_ICON = ShieldCheck`; export `RULE_ICON_OPTIONS = Object.keys(RULE_ICON_MAP)`
- [X] T004 [P] Create `src/features/players/rules/useCourtRules.ts`: export `CourtRule` interface (id, title, icon, chip_label, detail, sort_order, created_at); implement `useCourtRules()` with `useQuery({ queryKey: ['court-rules'], queryFn: ... })` fetching `.from('court_rules').select('*').order('sort_order', { ascending: true })`; return `data ?? []`

**Checkpoint**: Icon map and read hook ready — US1, US2, US3 can all proceed in parallel.

---

## Phase 3: User Story 1 — Prominent Rules Banner (Priority: P1) 🎯 MVP

**Goal**: Amber warning banner visible on player page load, showing one chip per rule section with a "View Full Rules" trigger.

**Independent Test**: Open the player calendar page. A yellow/amber banner is immediately visible between the sponsors area and the calendar. Each chip shows a lucide icon and `chip_label`. A "View Full Rules" link is present. When no rules exist the banner does not render.

### Implementation for User Story 1

- [X] T005 [US1] Create `src/features/players/rules/RulesBanner.tsx`: accept props `{ rules: CourtRule[]; onViewFullRules: () => void }`; render nothing when `rules.length === 0`; render a `<section role="region" aria-label="Court Rules">` with amber styling (`bg-yellow-50 border border-yellow-300 text-yellow-800`); render a flex-wrap chip row — each chip is a `<button>` with the resolved lucide icon from `RULE_ICON_MAP` + `chip_label`, calling `onViewFullRules` on click; render a "View Full Rules →" button that calls `onViewFullRules`; chips wrap on mobile (≥375 px), single row on ≥768 px

**Checkpoint**: RulesBanner renders correctly in isolation (can import and test in a test page).

---

## Phase 4: User Story 2 — Categorised Rules Modal with Formatted Content (Priority: P2)

**Goal**: A shadcn Dialog showing collapsible rule sections with react-markdown-rendered detail content, openable from header button and banner.

**Independent Test**: Click the "Rules" header button — a modal opens with at least two named sections. Click a section — detail content expands showing formatted text (bold, bullet lists). Click again — collapses. Press Escape — modal closes. Same modal opens from "View Full Rules" in banner.

### Implementation for User Story 2

- [X] T006 [US2] Create `src/features/players/rules/RulesModal.tsx`: accept props `{ open: boolean; onClose: () => void; rules: CourtRule[] }`; use shadcn `Dialog` / `DialogContent` / `DialogHeader` / `DialogTitle` from `@/components/ui/dialog`; `DialogContent` with `className="max-w-lg max-h-[90vh] overflow-y-auto"`; for each rule render a collapsible section: header row with resolved lucide icon + title + ChevronDown/Up toggle; use `useState` per section for expand/collapse; expanded state renders `<ReactMarkdown>` with `rule.detail` and prose-style className; sections with empty `detail` show no toggle chevron and are non-interactive; close handled by `onOpenChange={onClose}`
- [X] T007 [US2] Modify `src/layouts/PublicLayout.tsx`: add `useState<boolean>` for `rulesOpen`; import `useCourtRules`, `RulesBanner`, `RulesModal`, `ClipboardList` from lucide-react; add Rules icon button (`ClipboardList`, `aria-label="View court rules"`) in the header's zone-3 div beside the bell, hidden when `rules.length === 0`; insert `<RulesBanner rules={rules} onViewFullRules={() => setRulesOpen(true)} />` between SponsorsSection and `<main>`; render `<RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} rules={rules} />` after the main content

**Checkpoint**: Banner + modal + header button all wired together. US1 and US2 fully functional.

---

## Phase 5: User Story 3 — Admin Manages Court Rules (Priority: P2)

**Goal**: Admin settings Rules tab with full CRUD — add, inline edit, delete, and up/down reorder of rule sections. Changes reflect immediately in the player view.

**Independent Test**: Admin navigates Settings → Rules tab. List shows 5 seeded sections. Add a new rule — it appears in the list and in the player banner/modal. Edit a rule title — player view shows updated text. Delete a rule — it disappears from player view. Reorder with ↑/↓ — player view reflects new order.

### Implementation for User Story 3

- [X] T008 [US3] Create `src/features/admin/useAdminRules.ts`: import `useQueryClient`, `useMutation`; import `supabase` from `@/services/supabase`; export `useCreateRule()` mutating INSERT into `court_rules` (computes `sort_order = max + 1` from current list), invalidates `['court-rules']`; export `useUpdateRule()` mutating UPDATE by id, invalidates `['court-rules']`; export `useDeleteRule()` mutating DELETE by id, invalidates `['court-rules']`; export `useReorderRules()` accepting `{ aId, bId, aOrder, bOrder }` and swapping sort_order values with two sequential `.update()` calls, invalidates `['court-rules']`
- [X] T009 [US3] Modify `src/features/admin/AdminSettingsPage.tsx`: change `type Tab = 'hours' | 'terms'` to `'hours' | 'terms' | 'rules'`; add a "Rules" tab button with `ClipboardList` icon after the Terms tab button; add a Rules tab panel that renders an inline admin rules management UI using `useCourtRules()` for the list and `useCreateRule`, `useUpdateRule`, `useDeleteRule`, `useReorderRules` hooks; each rule row shows: resolved icon, title, chip_label, ↑ button (disabled at index 0), ↓ button (disabled at last index), Edit button (toggles inline edit form), Delete button (uses `window.confirm` before mutating); an "Add Rule" form at the bottom with: title input (required), icon select (from `RULE_ICON_OPTIONS`), chip_label input (required), detail textarea (markdown); submit calls `useCreateRule().mutateAsync`; inline edit form mirrors the same fields and calls `useUpdateRule().mutateAsync`

**Checkpoint**: All three user stories fully functional. Admin changes reflect in player view.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T010 [P] Run `npx eslint src/features/players/rules/ src/features/admin/useAdminRules.ts src/layouts/PublicLayout.tsx src/features/admin/AdminSettingsPage.tsx` and fix any errors or warnings introduced by this feature
- [X] T011 Verify quickstart.md scenarios manually: banner visible on load, modal opens from header and banner, sections expand/collapse, markdown renders, admin CRUD reflects in player view, empty state hides banner and button

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 (react-markdown installed, migration applied)
- **Phase 3 (US1 Banner)**: Depends on Phase 2 — T003 (ruleIcons) and T004 (useCourtRules)
- **Phase 4 (US2 Modal + Layout)**: Depends on Phase 2; T006 also needs T003 for icon resolution; T007 needs T005 (RulesBanner) and T006 (RulesModal)
- **Phase 5 (US3 Admin)**: Depends on Phase 2; T009 depends on T008
- **Phase 6 (Polish)**: Depends on Phases 3, 4, 5 all complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2 — no dependency on US2 or US3
- **US2 (P2)**: After Phase 2 — independent of US1 except T007 (layout wiring) needs T005
- **US3 (P2)**: After Phase 2 — fully independent of US1 and US2

### Parallel Opportunities

- **T003 + T004**: Both are new files with no dependency on each other — run in parallel
- **T005 (US1) + T006 (US2) + T008 (US3)**: After Phase 2 — three different files, all parallelisable
- **T009 (US3 settings page)**: Can proceed alongside T006 and T007
- **T010 (lint)**: Parallelisable with T011 (manual verification)

---

## Implementation Strategy

**MVP scope (US1 only)**: T001 → T002 → T003 + T004 (parallel) → T005 → T007 (partial: banner + modal state only)

**Full delivery**: All phases in order. Estimated task count: **11 tasks** across 6 phases.

| Phase | Tasks | User Story | Parallelisable |
|-------|-------|-----------|----------------|
| Setup | T001–T002 | — | No (sequential) |
| Foundational | T003–T004 | — | Yes (parallel) |
| Phase 3 | T005 | US1 (P1) | After P2 |
| Phase 4 | T006–T007 | US2 (P2) | T006 parallel with T005/T008 |
| Phase 5 | T008–T009 | US3 (P2) | T008 parallel with T005/T006 |
| Polish | T010–T011 | — | T010+T011 parallel |
