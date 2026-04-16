# Implementation Plan: Admin Filter and Player Header Updates

**Branch**: `006-dashboard-header-updates` | **Date**: 2026-04-16 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-dashboard-header-updates/spec.md`

## Summary

Remove the date filter control from the admin dashboard (dashboard silently uses today's date),
then add three new player-facing sections to `PublicLayout`: a quote display area and a bell
notifications icon in the existing "THE SHUTTLE" header, and a sponsors showcase section directly
below the header. All new content uses static in-memory data for the MVP — no new database tables
or Supabase migrations are required.

## Technical Context

**Language/Version**: TypeScript 6.0.2
**Primary Dependencies**: React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8, React Query 5.99.0
**Storage**: N/A — static in-memory data arrays for quotes, announcements, and sponsors (MVP scope)
**Testing**: `npm run lint` (ESLint); visual browser verification at 375 px, 768 px, 1280 px
**Target Platform**: Web browser — responsive desktop + mobile
**Project Type**: web-app
**Performance Goals**: Quote/sponsors sections must not delay calendar or booking-data rendering
**Constraints**: No new Supabase tables; no backend or migration changes for MVP
**Scale/Scope**: ~50 concurrent users; single-court club

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before beginning implementation:

- [x] **I. Spec-First**: `specs/006-dashboard-header-updates/spec.md` exists with three
  prioritized user stories and independent acceptance scenarios. All tasks will trace to a story.
- [x] **II. Type Safety**: New data types (`Quote`, `Announcement`, `Sponsor`) defined as
  TypeScript interfaces in `types.ts`. No `any` introduced. Static data is typed at declaration.
- [x] **III. Component Reusability**: New components (`QuoteArea`, `BellNotification`,
  `SponsorsSection`) are composable Tailwind + shadcn/ui components; placed under
  `src/features/players/header/`. No business logic embedded in components.
- [x] **IV. Data Integrity & Security**: No new tables → no RLS impact. Admin route protection
  and player read-only view are unchanged. No payment or PII data touched.
- [x] **V. Responsive Design**: All new sections (header quote/bell, sponsors row) designed
  mobile-first; tested at ≥375 px, ≥768 px, ≥1280 px. Layout specified in contracts.

## Project Structure

### Documentation (this feature)

```text
specs/006-dashboard-header-updates/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── PublicHeaderUI.ts      # Quote, Bell, Sponsors component contracts
│   └── AdminDashboardUI.ts    # Dashboard date-filter removal contract
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── features/
│   ├── admin/
│   │   └── AdminDashboardPage.tsx      [MODIFY] remove selectedDate state + nav UI
│   └── players/
│       └── header/
│           ├── QuoteArea.tsx           [NEW] displays rotating/static motivational quote
│           ├── BellNotification.tsx    [NEW] bell icon + announcement popover
│           ├── SponsorsSection.tsx     [NEW] sponsor showcase row below header
│           └── types.ts                [NEW] Quote, Announcement, Sponsor interfaces + static data
└── layouts/
    └── PublicLayout.tsx                [MODIFY] embed QuoteArea + BellNotification in header;
                                                 add SponsorsSection below header
```

**Structure Decision**: Single-project layout (all code under `src/`). No backend or test
directory changes for this feature.
