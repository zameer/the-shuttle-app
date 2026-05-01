# Implementation Plan: Calendar Notice Visibility Control

**Branch**: `030-create-feature-branch` | **Date**: 2026-05-01 | **Spec**: `specs/028-calendar-notice-visibility/spec.md`
**Input**: Feature specification from `/specs/028-calendar-notice-visibility/spec.md`

## Summary

Extend the existing `player_display_mode` column in `court_settings` to support a third value `'both'`, enabling admins to show both the important notice message and the player calendar simultaneously. Changes span a DB migration (constraint update), a TypeScript type extension, admin settings UI (add third mode button and update validation), and public calendar page render logic (replace binary `isClosureMode` flag with two derived booleans `showCalendar` / `showMessage`).

## Technical Context

**Language/Version**: TypeScript 6.0.2
**Primary Dependencies**: React 19.2.4, Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, Supabase JS 2.103.0, react-markdown 10.1.0
**Storage**: Supabase PostgreSQL — `court_settings` table extension; no new table required
**Testing**: `npm run lint` plus manual verification from quickstart
**Target Platform**: Web SPA (admin + public player views)
**Project Type**: Single-project frontend web app
**Performance Goals**: No new data fetching; same `useCourtSettings` query with extended type
**Constraints**: No new npm packages, preserve existing RLS policies, no breaking changes to 'calendar' or 'closure_message' behavior
**Scale/Scope**: 4 files changed; 1 new migration file

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/028-calendar-notice-visibility/spec.md` exists with prioritized user stories.
- [x] **II. Type Safety**: `PlayerDisplayMode` union type is extended; no `any` introduced; Supabase data passes through existing typed `CourtSettings` interface.
- [x] **III. Component Reusability**: `ClosureMessagePanel` is unchanged; changes are in feature-level pages only.
- [x] **IV. Data Integrity & Security**: No new RLS changes; existing admin write policy covers the extended column values; no business logic in UI.
- [x] **V. Responsive Design**: 3-column grid degrades to single column on mobile; both-mode stack layout is mobile-first.

No constitution exceptions required.

## Project Structure

### Documentation (this feature)

```text
specs/028-calendar-notice-visibility/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── PlayerVisibilityContract.ts
│   ├── AdminVisibilitySettingsContract.ts
│   └── SchemaContract.ts
└── tasks.md
```

### Source Code (repository root)

```text
supabase/
└── migrations/
    └── 20260501_add_both_player_display_mode.sql  (new)
src/
├── features/
│   ├── admin/
│   │   ├── useCourtSettings.ts          (type extension)
│   │   └── AdminSettingsPage.tsx        (add Both button, fix init, update validation)
│   └── players/
│       └── PublicCalendarPage.tsx       (replace isClosureMode with showCalendar/showMessage)
```

**Structure Decision**: All changes within existing feature modules. No new components or hook files required.

## Phase Overview

### Phase 0: Research

- Determined `'both'` as the third mode value.
- Confirmed DB constraint drop-and-recreate strategy.
- Resolved 'both' layout: ClosureMessagePanel stacked above calendar.
- Confirmed legacy settings compatibility approach.

### Phase 1: Design and Contracts

- `data-model.md`: `player_display_mode` widened to 3-value union; no new tables.
- `contracts/`: PlayerVisibility, AdminVisibilitySettings, Schema contracts defined.
- `quickstart.md`: step-by-step implementation and verification checklist.

### Phase 2 (next command `/speckit.tasks`)

- Generate dependency-ordered tasks for migration, type extension, admin UI, and public page updates.

## Post-Design Constitution Re-Check

- [x] **I. Spec-First**: All FR-001 through FR-011 are covered in data-model and contracts.
- [x] **II. Type Safety**: `PlayerDisplayMode` union is explicit; initialization guard handles null/legacy values.
- [x] **III. Component Reusability**: `ClosureMessagePanel` reused without modification.
- [x] **IV. Data Integrity & Security**: Read-only public access + admin write via existing RLS. Extended constraint prevents invalid values at DB level.
- [x] **V. Responsive Design**: 3-column grid collapses; stacked both-mode layout works at 375 px.

Result: PASS.

## Complexity Tracking

No constitution violations. Single schema constraint change is the highest-risk item — covered by explicit migration strategy in research.md and SchemaContract.ts.


## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before beginning implementation:

- [ ] **I. Spec-First**: `specs/###-feature-name/spec.md` exists with prioritized user stories and
  acceptance scenarios. No implementation task exists without a parent user story.
- [ ] **II. Type Safety**: Plan does not introduce `any` types. All boundary data identified for
  Zod validation. Typed interfaces planned for all new data contracts.
- [ ] **III. Component Reusability**: New UI is built on shadcn/ui primitives. Shared components
  placed under `src/components/shared/`; feature components under `src/features/`. No business
  logic embedded in UI components.
- [ ] **IV. Data Integrity & Security**: RLS policies documented in data-model.md for any new
  tables. Admin routes listed for router-level guard. Price/payment logic in service/hook layer.
- [ ] **V. Responsive Design**: Breakpoints (≥375 px, ≥768 px, ≥1280 px) addressed in contracts.
  Calendar or list views degrade gracefully on mobile.

If any gate cannot be satisfied, document an exception under "Constitution Exceptions" in this
plan before proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
