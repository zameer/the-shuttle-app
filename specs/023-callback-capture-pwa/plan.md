# Implementation Plan: Callback Capture PWA Upgrade

**Branch**: `[023-new-speckit-spec]` | **Date**: 2026-04-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-callback-capture-pwa/spec.md`

## Summary

Upgrade callback capture to a guided 3-step mobile-first flow with resilient offline queuing and repeat-visit acceleration. The latest clarifications are incorporated: player-facing copy avoids court/rules terms, Step 1 title is exactly "Could you please mention", and preferred callback time is collected in Step 2 (Step 3 is note + review + submit). No schema changes are required; implementation uses React hooks, localStorage, and Workbox BackgroundSync.

## Technical Context

**Language/Version**: TypeScript 6.0.2, React 19.2.4  
**Primary Dependencies**: Vite 8.0, Tailwind CSS 3.4.17, shadcn/ui, React Query 5.99.0, react-hook-form 7.72.1, Zod 4.x, Supabase JS 2.103.0, date-fns 4.1.0, lucide-react 1.8, vite-plugin-pwa 1.2.x  
**Storage**: Supabase PostgreSQL (existing RPC/table), browser localStorage, Workbox BackgroundSync queue  
**Testing**: `npx tsc --noEmit`, ESLint, manual browser/PWA checks via `npm run dev` and `npm run build && npm run preview`  
**Target Platform**: Modern mobile and desktop browsers (Chrome-first for PWA install/background sync behavior)
**Project Type**: Single-project React web app (SPA)  
**Performance Goals**: First-time callback completion in under 60 seconds for at least 90% of players (SC-001); fast step transitions with no full-page navigation  
**Constraints**: Strict TypeScript (no `any`), no Supabase schema changes, offline-capable submission, mobile-first layout at >=375 px  
**Scale/Scope**: Public callback capture flow and related hooks/components in `src/features/players/call/` plus PWA prompt behavior in public player page

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify all five principles before beginning implementation:

- [x] **I. Spec-First**: `specs/023-callback-capture-pwa/spec.md` exists with prioritized user stories and acceptance scenarios.
- [x] **II. Type Safety**: Plan introduces no `any`; boundary payloads are validated by existing Zod schema and typed contracts.
- [x] **III. Component Reusability**: UI uses shadcn/ui + Tailwind. Business logic remains in hooks (`useCallbackDraft`, `useOfflineCallbackQueue`, `usePWAInstallPrompt`).
- [x] **IV. Data Integrity & Security**: No new tables. Existing Supabase RLS and RPC access model preserved. Client does not bypass server validation.
- [x] **V. Responsive Design**: Dialog and step contracts support mobile/tablet/desktop breakpoints, with full-screen mobile behavior and graceful desktop sizing.

### Post-Design Constitution Re-Check

- [x] **I. Spec-First**: Phase artifacts map directly to FR-001 through FR-015 and clarified copy/step placement decisions.
- [x] **II. Type Safety**: `contracts/` and `data-model.md` maintain explicit interfaces/unions for draft, queue, and submission statuses.
- [x] **III. Component Reusability**: Step UI remains feature-local; shared hooks and contracts isolate logic from presentational components.
- [x] **IV. Data Integrity & Security**: No direct client-side trust changes; dedup and retry logic is additive and non-destructive.
- [x] **V. Responsive Design**: Quickstart and contracts define behavior across >=375 px, >=768 px, and >=1280 px.

## Project Structure

### Documentation (this feature)

```text
specs/023-callback-capture-pwa/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── CallbackCaptureFlow.ts
│   └── OfflineQueue.ts
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   └── shared/
├── features/
│   ├── players/
│   │   ├── PublicCalendarPage.tsx
│   │   └── call/
│   │       ├── CallbackRequestForm.tsx
│   │       ├── CallbackRequestModal.tsx
│   │       ├── CallbackCaptureStep1.tsx
│   │       ├── CallbackCaptureStep2.tsx
│   │       ├── CallbackCaptureStep3.tsx
│   │       ├── CallbackSuccessView.tsx
│   │       ├── useCallbackDraft.ts
│   │       ├── useCallbackPreferences.ts
│   │       ├── useOfflineCallbackQueue.ts
│   │       ├── useSubmitCallbackRequest.ts
│   │       └── types.ts
│   └── ...
├── hooks/
│   └── usePWAInstallPrompt.ts
└── services/
    └── supabase.ts

specs/
└── 023-callback-capture-pwa/
```

**Structure Decision**: Use the existing single-project SPA structure. Feature-specific components remain in `src/features/players/call/`; reusable hooks stay in `src/hooks/` when shared across pages.

## Phase 0 Research Deliverables

- `research.md` finalized with all technical unknowns resolved.
- Clarification-driven UX updates documented: Step 1 exact title and Step 2 preferred callback field placement.
- Alternative approaches and rationale captured for queueing, install prompting, and idempotency.

## Phase 1 Design Deliverables

- `data-model.md` updated for step-field mapping and localStorage lifecycle.
- `contracts/CallbackCaptureFlow.ts` and `contracts/OfflineQueue.ts` aligned with clarified step titles and field allocation.
- `quickstart.md` updated with revised step copy and test flow.

## Complexity Tracking

No constitution violations or justified exceptions.
