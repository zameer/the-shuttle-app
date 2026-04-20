# Tasks: 023 — Callback Capture PWA Upgrade

**Input**: Design documents from `specs/023-callback-capture-pwa/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared config and shared type contracts required by all user stories.

- [X] T001 Add Workbox callback runtime cache entry in `vite.config.ts` using `NetworkOnly` with BackgroundSync queue `callback-requests`.
- [X] T002 Extend callback feature types in `src/features/players/call/types.ts` with submission status, draft, preferences, pending queue, and submitted-id types.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build reusable persistence and submission primitives used by all stories.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create draft persistence hook in `src/features/players/call/useCallbackDraft.ts` with 24-hour expiry and restore metadata.
- [X] T004 [P] Create callback preference hook in `src/features/players/call/useCallbackPreferences.ts` for `preferredCallbackTime` persistence.
- [X] T005 [P] Create offline queue hook in `src/features/players/call/useOfflineCallbackQueue.ts` with enqueue, dequeue, dedup, and `online` flush behavior.
- [X] T006 Modify submit mutation input and offline preflight in `src/features/players/call/useSubmitCallbackRequest.ts` to accept `clientId` and throw `network-offline` when offline.

**Checkpoint**: Shared hooks and submission interfaces are complete and ready for story implementation.

---

## Phase 3: User Story 1 — Fast Guided Callback Capture (Priority: P1) 🎯 MVP

**Goal**: Deliver a guided, clear, three-step callback flow with player-facing copy updates.

**Independent Test**: From public page, open callback form and complete all 3 steps; Step 1 title is exactly "Could you please mention", Step 2 includes preferred callback time, Step 3 is review + note + submit.

- [X] T007 [US1] Update dialog layout for mobile-first step flow in `src/features/players/call/CallbackRequestModal.tsx`.
- [X] T008 [P] [US1] Create Step 1 component in `src/features/players/call/CallbackCaptureStep1.tsx` with exact title "Could you please mention" and name/phone inputs.
- [X] T009 [P] [US1] Create Step 2 component in `src/features/players/call/CallbackCaptureStep2.tsx` with slot start, slot end, location, and preferred callback time inputs.
- [X] T010 [P] [US1] Create Step 3 component in `src/features/players/call/CallbackCaptureStep3.tsx` with review panel and note input only.
- [X] T011 [US1] Rewrite flow coordinator in `src/features/players/call/CallbackRequestForm.tsx` for per-step validation, progress indicator, and player-facing copy without court/rules terminology.

**Checkpoint**: Guided capture is independently usable and matches clarified copy and field placement.

---

## Phase 4: User Story 2 — Reliable Capture in Weak or No Network (Priority: P1)

**Goal**: Ensure callback requests are safely queued offline and retried automatically.

**Independent Test**: With network offline, submit callback request and verify offline-queued feedback appears; reconnect and verify pending request is replayed and removed from pending storage.

- [X] T012 [US2] Create success/queued outcome view in `src/features/players/call/CallbackSuccessView.tsx` with separate `success` and `offline-queued` states.
- [X] T013 [US2] Integrate offline queue and dedup lifecycle into `src/features/players/call/CallbackRequestForm.tsx` for enqueue, mark-submitted, and status transitions.

**Checkpoint**: Offline capture and retry flow works independently from install prompt features.

---

## Phase 5: User Story 3 — App-Like Repeat Access for Returning Players (Priority: P2)

**Goal**: Add install prompt entry and repeat-visit acceleration through preference prefill.

**Independent Test**: After second visit, install banner appears and can be dismissed/triggered; preferred callback time is pre-filled in Step 2 for returning players.

- [X] T014 [P] [US3] Create deferred install prompt hook in `src/hooks/usePWAInstallPrompt.ts` with visit-count gating and trigger/dismiss APIs.
- [X] T015 [P] [US3] Add install banner integration in `src/features/players/PublicCalendarPage.tsx` using `usePWAInstallPrompt`.
- [X] T016 [P] [US3] Update preference prefill/save path in `src/features/players/call/CallbackRequestForm.tsx` so `preferredCallbackTime` is restored in Step 2 and persisted after submit.

**Checkpoint**: Returning users get app-like install flow and reduced input effort.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate feature quality and readiness across all stories.

- [X] T017 Run feature TypeScript validation from `specs/023-callback-capture-pwa/quickstart.md` using `npx tsc --noEmit` and resolve issues in touched files.
- [X] T018 Run feature lint validation from `specs/023-callback-capture-pwa/quickstart.md` using `npx eslint src/features/players/call/ src/hooks/usePWAInstallPrompt.ts src/features/players/PublicCalendarPage.tsx` and resolve issues.

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) has no dependencies.
- Foundational (Phase 2) depends on Setup and blocks all user stories.
- User Stories (Phases 3-5) depend on Foundational completion.
- Polish (Phase 6) depends on all implemented user stories.

### User Story Dependencies

- **US1 (P1)**: starts after Phase 2; MVP baseline.
- **US2 (P1)**: starts after US1 coordinator exists (`T011`) and foundational queue hook (`T005`) is complete.
- **US3 (P2)**: starts after US1 coordinator exists (`T011`) and can run in parallel with US2 after shared prerequisites.

---

## Parallel Execution Examples

### User Story 1

Run in parallel after `T007`:

```text
T008 + T009 + T010
```

### User Story 2

Run `T012` first, then `T013` integration in sequence.

### User Story 3

Run `T014` first, then `T015` and `T016` in parallel:

```text
T015 + T016
```

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1.
2. Complete Phase 2.
3. Complete Phase 3 (US1) and validate independent test criteria.

### Incremental Delivery

1. Add US2 (offline resilience), validate independently.
2. Add US3 (install + repeat access), validate independently.
3. Finish polish checks before merge.

