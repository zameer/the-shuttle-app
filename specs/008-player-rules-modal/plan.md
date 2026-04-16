# Implementation Plan: Player Rules — Prominent Banner and Categorised Detail Modal

**Branch**: `008-player-rules-modal` | **Date**: 2026-04-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-player-rules-modal/spec.md`

## Summary

Three coordinated changes: (1) new `court_rules` Supabase table + migration with public-read /
admin-write RLS, seeded with five initial rules; (2) player-facing — prominent rules banner
(icon chips) between sponsors and calendar, "Rules" header button, and modal with collapsible
sections rendering markdown detail content (via `react-markdown`); (3) admin-facing — new
"Rules" tab in `AdminSettingsPage` for full CRUD and reordering of rule sections.

## Technical Context

**Language/Version**: TypeScript 6.0.2
**Primary Dependencies**: React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, Supabase 2.103.0, lucide-react 1.8, react-markdown (NEW — to be installed)
**Storage**: Supabase PostgreSQL — new `court_rules` table; new migration required
**Testing**: `npm run lint` (ESLint); visual browser verification at 375 px, 768 px, 1280 px
**Target Platform**: Web browser — responsive desktop + mobile
**Project Type**: web-app
**Performance Goals**: Rules query completes within React Query default stale-time; no layout shift on banner render
**Constraints**: Admin writes protected by `is_admin()` RLS; player reads are public (anon); no Zod schema needed for rules (no user-submitted financial data)
**Scale/Scope**: ~50 concurrent users; single-court club
**Primary Dependencies**: React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, React Query 5.99.0, Supabase 2.103.0, lucide-react 1.8, react-markdown (NEW — to be installed)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/008-player-rules-modal/spec.md` exists with three prioritised
  user stories (US1 banner, US2 modal, US3 admin CRUD) and independent acceptance scenarios.
- [x] **II. Type Safety**: New `CourtRule` interface typed explicitly. Supabase response typed.
  No `any`. `react-markdown` used at component boundary only (content rendering).
- [x] **III. Component Reusability**: Player components in `src/features/players/rules/`;
  admin management in `src/features/admin/`. All styling via Tailwind. No business logic in UI.
- [x] **IV. Data Integrity & Security**: New `court_rules` table has RLS — public SELECT for
  anon/authenticated, admin-only INSERT/UPDATE/DELETE via `is_admin()`. No payment data.
- [x] **V. Responsive Design**: Rules banner and modal designed for ≥375 px, ≥768 px,
  ≥1280 px. Modal scrolls on mobile. Bell and Rules buttons remain accessible on narrow screens.

## Project Structure

### Documentation (this feature)

```text
specs/008-player-rules-modal/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── PlayerRulesUI.ts       # Banner + header button + modal contract
│   └── AdminRulesUI.ts        # Admin CRUD tab contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── 20260416000000_court_rules.sql          [NEW] court_rules table + RLS + seed data

src/
├── features/
│   ├── players/
│   │   └── rules/
│   │       ├── useCourtRules.ts                [NEW] React Query hook — fetch all rules (public)
│   │       ├── RulesBanner.tsx                 [NEW] prominent in-flow banner with chip row
│   │       └── RulesModal.tsx                  [NEW] modal with collapsible sections + markdown
│   └── admin/
│       ├── AdminSettingsPage.tsx               [MODIFY] add 'rules' tab
│       └── useAdminRules.ts                    [NEW] CRUD hooks for court_rules (admin-only)
└── layouts/
    └── PublicLayout.tsx                        [MODIFY] add Rules header button; insert RulesBanner
```

**Structure Decision**: Single-project layout. Feature components in dedicated
`src/features/players/rules/` directory to keep player rules isolated from header types.
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
