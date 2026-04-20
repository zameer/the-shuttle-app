# Research: 023 — Callback Capture PWA Upgrade

**Date**: 2026-04-20 | **Branch**: `023-new-speckit-spec`  
**Resolves**: All NEEDS CLARIFICATION items from Technical Context in `plan.md`

---

## R1 — Multi-Step Wizard in Existing Dialog

**Question**: Should the guided flow live inside the existing `shadcn/ui Dialog` or be replaced with a bottom sheet / full-screen overlay on mobile?

**Finding**: The existing `CallbackRequestModal.tsx` uses `Dialog` with `max-h-[90vh]` overflow scroll. On mobile (375 px), a deeply nested Dialog with `overflow-y-auto` works but can cause visual jank on keyboard-open. The recommended pattern for mobile-first guided forms is a full-viewport `Dialog` with `w-full max-w-full sm:max-w-lg` that shows one logical step at a time, removing the scroll requirement entirely. This avoids adding a bottom-sheet library (no new dependency).

**Decision**: Upgrade the Dialog to `w-full max-w-full h-dvh sm:max-w-lg sm:h-auto rounded-none sm:rounded-xl` so it feels native on mobile. Show one step per screen — transitions via Tailwind `translate-x` or simple conditional render (conditional render chosen for simplicity; no animation library needed).

**Alternatives considered**:
- Vaul (bottom sheet drawer) — rejected: new dependency, not in project
- Keeping single-scroll layout — rejected: defeats the goal of progressive disclosure; accessibility burden

**Verdict**: ✅ Conditional-render step pattern inside upgraded Dialog (mobile full-screen).

---

## R2 — Offline Queue Strategy

**Question**: Use Workbox `BackgroundSync` plugin (service worker) vs. `localStorage` + `online` event listener?

**Finding**:
- **BackgroundSync** retries failed fetch requests automatically through the service worker background queue (survives browser close). Requires Workbox 7.x plugin config in `vite.config.ts` and that the submission mutates via `fetch` (which Supabase client does). The project already uses VitePWA with `workbox.runtimeCaching`; adding a `BackgroundSyncPlugin` is a config-only change.
- **localStorage + `online` listener** is simpler but not persistent across sessions and requires explicit flush logic in every app boot. More complex React-side code.

**Decision**: Use `BackgroundSync` via Workbox plugin for the actual retry. Additionally maintain a `localStorage` shadow queue so the app can display "you have N pending requests" in offline mode (BackgroundSync queue is opaque from the client side).

**Implementation sketch**:
1. Add to `vite.config.ts` → `workbox.runtimeCaching`: a `NetworkOnly` handler for the Supabase RPC URL pattern with a `BackgroundSyncPlugin({ queueName: 'callback-requests', maxRetentionTime: 24 * 60 })`.
2. The React mutation still calls `useSubmitCallbackRequest` normally; if the request fails with a network error, catch it and push the payload to `localStorage` (key: `shuttle-ksc:pending-callbacks`) and show the "saved offline" toast.
3. Listen to `navigator.onLine` / `window` `online` event to flush the `localStorage` queue and re-submit.

**Note**: BackgroundSync is best-effort (browser discretion). The `localStorage` flush on reconnect provides a deterministic fallback.

**Alternatives considered**:
- IndexedDB (idb library) — rejected: overkill for < 5 pending items; no new dependency justified
- Only BackgroundSync, no localStorage mirror — rejected: no way to show the user pending count or allow manual retry

**Verdict**: ✅ BackgroundSync (Workbox config) + localStorage mirror in `useOfflineCallbackQueue` hook.

---

## R3 — Preference Persistence (Returning Players)

**Question**: Which fields to persist, and what security constraints apply?

**Finding**: The spec (FR-04) explicitly limits persistence to `preferredCallbackTime` only. Phone number is not persisted — users re-enter it each session to prevent accidental prefill on shared devices.

**Fields persisted**:
- `preferredCallbackTime` — stored as `string | null` under key `shuttle-ksc:callback-prefs`
- Stored in `localStorage` (cleared by user via browser settings; no server round-trip)

**Security considerations**:
- `playerPhone` excluded: shared-device risk; phone numbers are PII.
- `playerName` excluded: same reasoning.
- Preference data has no auth context — do not store session-linked data here.

**Decision**: Single `localStorage` key `shuttle-ksc:callback-prefs` holding `{ preferredCallbackTime?: string }` — read on form init, written on successful submit.

**Verdict**: ✅ localStorage, `preferredCallbackTime` only.

---

## R4 — Install Prompt (`BeforeInstallPromptEvent`)

**Question**: When and how to show the PWA install prompt without disrupting the form flow?

**Finding**: The `beforeinstallprompt` event fires before the browser's ambient install mini-infobar. Deferring and replaying it via a custom UI is the recommended pattern. The constraint is: **do not block or delay the callback form flow**.

**Decision**: 
1. Capture `beforeinstallprompt` globally in `PublicCalendarPage.tsx` (or a new `usePWAInstallPrompt` hook), storing `deferredPrompt` in component state.
2. If `deferredPrompt` is available (install not yet accepted/dismissed), show a subtle dismissible banner below the main header — not a modal, not a dialog.
3. Criteria for showing: `deferredPrompt != null` AND user has visited ≥ 2 times (tracked via `localStorage` key `shuttle-ksc:visit-count`). This avoids showing on first visit.

**Alternatives considered**:
- Show install button inside the FAB speed-dial — rejected: clutters the booking action area
- Always show on page load — rejected: aggressive; PWA UX guidance recommends contextual prompting

**Verdict**: ✅ Deferred prompt captured in `usePWAInstallPrompt` hook; shown as a subtle banner after second visit.

---

## R5 — Idempotency (Duplicate Submission Prevention)

**Question**: How to prevent duplicate submissions if a player submits, goes offline, and the offline queue replays the same request?

**Finding**: The existing `submit_callback_request` RPC does not have an idempotency key field. Options:
1. Add idempotency key to the RPC + table — requires a schema migration.
2. Client-side deduplication using a UUID stored alongside each queued item; after successful replay, remove from the queue and mark as "submitted" in localStorage to prevent re-queuing.

**Decision**: Client-side deduplication only (no schema changes). Each queued payload stores a `clientId: crypto.randomUUID()`. On successful submit (online path or replay), record the `clientId` in `localStorage` key `shuttle-ksc:submitted-ids` (last 20 IDs, LRU). On re-submission attempt, skip if `clientId` already in the set.

**Verdict**: ✅ Client-side `clientId` dedup via localStorage; no migration needed.

---

## R6 — Step Structure (UX)

**Question**: How to split 7 fields across 3 steps optimally?

**Decision**:

| Step | Title | Fields | Rationale |
|------|-------|--------|-----------|
| 1 | "Could you please mention" | `playerName`, `playerPhone` | Friendly opener requested in clarification; keeps first step lightweight |
| 2 | "When and where?" | `slotFrom`, `slotTo`, `playerLocation`, `preferredCallbackTime` | Scheduling and contact-window inputs are grouped in one planning step |
| 3 | "Anything else?" | `note` | Final optional context plus review summary before submit |

Step 3 shows a compact read-only review of Step 1–2 values before submit so the player can catch errors. A "Back" button allows going to the previous step without data loss (react-hook-form state preserved).

**Verdict**: ✅ 3 steps as above.

---

## R7 — Supabase Offline Behavior

**Question**: Will the Supabase client throw a typed network error that we can detect as "offline" vs. a server validation error?

**Finding**: `supabase.rpc()` rejects with a standard `Error` object when the network is unavailable; the error message is typically `Failed to fetch`. We can also check `navigator.onLine` before submitting to short-circuit the request. Both checks are needed:
- Pre-submit: `if (!navigator.onLine) → skip fetch, go straight to offline queue`
- Post-submit error catch: check `error.message.includes('Failed to fetch') || !navigator.onLine` → treat as network error → offline queue

**Verdict**: ✅ Pre-flight `navigator.onLine` check + catch-pattern in `useSubmitCallbackRequest`.

---

## Resolved NEEDS CLARIFICATION Summary

| Item | Resolution |
|------|-----------|
| Guided flow UI pattern | Conditional-render 3-step in upgraded mobile-full-screen Dialog |
| Offline queue mechanism | BackgroundSync (Workbox) + localStorage mirror + online-event flush |
| Preference persistence scope | `preferredCallbackTime` only via `localStorage` |
| Install prompt timing | Deferred, banner after 2nd visit |
| Idempotency | Client-side UUID dedup in localStorage |
| Step structure | 3 steps: identity / booking / extras+review |
| Offline error detection | `navigator.onLine` pre-flight + catch pattern |
