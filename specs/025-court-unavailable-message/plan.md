# Implementation Plan: Court Unavailable Announcement

**Branch**: `028-pre-specify-branch` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-court-unavailable-message/spec.md`

## Summary

Add a global player display mode toggle that allows admins to switch the public booking page between the existing calendar experience and a full-court-unavailable closure message. Persist mode and message in existing `court_settings`, render formatted markdown for players in closure mode, and enforce validation so closure mode cannot be activated with empty content.

## Technical Context

**Language/Version**: TypeScript 6.0.2, React 19.2.4  
**Primary Dependencies**: Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, Supabase JS 2.103.0, react-hook-form 7.72.1, Zod 4.x, react-markdown 10.1.0  
**Storage**: Supabase PostgreSQL (`court_settings` table extension; no new table required)  
**Testing**: `npm run lint`, `npx tsc --noEmit`, manual admin/player scenario checks across breakpoints  
**Target Platform**: Modern mobile and desktop browsers  
**Project Type**: Single-project React SPA  
**Performance Goals**: Player mode switch should reflect after save/refetch without mixed UI state; closure UI should render without perceptible delay on initial load  
**Constraints**: Preserve existing admin route guard, no `any`, markdown render must be safe and resilient, avoid mixed closure+calendar state in player UI  
**Scale/Scope**: `src/features/admin/`, `src/features/players/`, `src/features/admin/useCourtSettings.ts`, plus 025 planning artifacts and contracts

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/025-court-unavailable-message/spec.md` exists with prioritized stories, acceptance scenarios, edge cases, and measurable success criteria.
- [x] **II. Type Safety**: New mode/message boundaries are planned with explicit string unions and validation guards; no `any` is introduced.
- [x] **III. Component Reusability**: UI changes stay within existing feature pages/components (`AdminSettingsPage`, `PublicCalendarPage`) using existing primitives and Tailwind classes.
- [x] **IV. Data Integrity & Security**: Settings remain in RLS-protected `court_settings`; admin writes continue under existing `is_admin()` policy and `/admin` guard.
- [x] **V. Responsive Design**: Contracts and quickstart include readability/behavior checks at >=375 px, >=768 px, >=1280 px.

### Post-Design Constitution Re-Check

- [x] **I. Spec-First**: `research.md`, `data-model.md`, `quickstart.md`, and contracts map directly to FR-001 through FR-010.
- [x] **II. Type Safety**: Data model and contracts define explicit mode/message types and validation constraints.
- [x] **III. Component Reusability**: Business rules (mode/message validation and settings persistence) remain in settings hook/form flow; player page only branches by derived state.
- [x] **IV. Data Integrity & Security**: No new table-level security surface; existing RLS policies are reused and documented.
- [x] **V. Responsive Design**: Closure display contract requires readable output and deterministic single-mode rendering across supported breakpoints.

## Project Structure

### Documentation (this feature)

```text
specs/025-court-unavailable-message/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- admin-closure-settings.md
|   `-- player-closure-display.md
`-- tasks.md
```

### Source Code (repository root)

```text
src/
|-- features/
|   |-- admin/
|   |   |-- AdminSettingsPage.tsx
|   |   `-- useCourtSettings.ts
|   `-- players/
|       `-- PublicCalendarPage.tsx
|-- components/
|   `-- shared/
|       `-- (optional closure display extract if needed)
`-- App.tsx

supabase/
`-- migrations/
    `-- (new migration to extend court_settings columns)
```

**Structure Decision**: Keep single-project layout and extend existing settings/public-calendar flows rather than introducing new routes or storage tables.

## Phase 0 Research Deliverables

- Resolved storage decision: extend `court_settings` with `player_display_mode` and `closure_message_markdown`.
- Resolved formatting strategy: `react-markdown` rendering with safe fallback behavior.
- Resolved consistency strategy: rely on existing React Query invalidation for `court-settings` updates.

## Phase 1 Design Deliverables

- `data-model.md`: extended `court_settings` and new derived UI entities/validation rules.
- Contracts:
  - `contracts/admin-closure-settings.md`
  - `contracts/player-closure-display.md`
- `quickstart.md`: admin/player validation flow, fallback checks, and quality gates.

## Current Touched-File Scope

- `specs/025-court-unavailable-message/plan.md`
- `specs/025-court-unavailable-message/research.md`
- `specs/025-court-unavailable-message/data-model.md`
- `specs/025-court-unavailable-message/quickstart.md`
- `specs/025-court-unavailable-message/contracts/admin-closure-settings.md`
- `specs/025-court-unavailable-message/contracts/player-closure-display.md`
- `supabase/migrations/20260428_add_player_display_mode_and_closure_message_to_court_settings.sql`
- `src/features/admin/useCourtSettings.ts`
- `src/components/shared/ClosureMessagePanel.tsx`
- `src/features/players/PublicCalendarPage.tsx`
- `src/features/admin/AdminSettingsPage.tsx`
- `src/index.css`

## Implementation Notes

- Migration created to extend singleton `court_settings` with `player_display_mode` and `closure_message_markdown`.
- Admin settings now include a mode selector plus markdown message editor with validation for closure mode.
- Player public page now branches on `player_display_mode` and renders a dedicated closure panel that hides booking interactions.
- Closure markdown rendering includes an explicit error boundary fallback to plain text.
- Court settings mutation now invalidates and refetches active `court-settings` queries after successful updates.

## Complexity Tracking

No constitution violations or exception requests identified.
