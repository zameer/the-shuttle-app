# Data Model: 023 — Callback Capture PWA Upgrade

**Source**: `research.md` (all decisions resolved) | **Date**: 2026-04-20

---

## Overview

No new Supabase tables or migrations required. All new state is:
1. **Component-local React state** — step progression, submission status
2. **Browser `localStorage`** — draft persistence, preference storage, offline queue, deduplication log
3. **Workbox BackgroundSync queue** — service worker retry queue (opaque; mirrored by localStorage)

The existing `callback_requests` table and `submit_callback_request` RPC are unchanged.

---

## 1. Component State

### `CallbackRequestForm` (multi-step coordinator)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `step` | `1 \| 2 \| 3` | `1` | Current active step |
| `submissionStatus` | `SubmissionStatus` | `'idle'` | Tracks result of submit attempt |
| `isOfflineQueued` | `boolean` | `false` | True when submit was queued (no network) |

```ts
export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'offline-queued' | 'error'
```

### Step components (step-local only)

Each step component receives `control`, `register`, `errors` from the parent `useForm` instance — no local state beyond what react-hook-form provides.

---

## 2. localStorage Entities

All keys namespaced under `shuttle-ksc:` to avoid collisions.

### 2a. Callback Draft (`shuttle-ksc:callback-draft`)

Persists partially completed form data across page refreshes/sessions.

```ts
interface CallbackCaptureDraft {
  playerName?: string
  playerPhone?: string
  slotFrom?: string         // ISO datetime-local string
  slotTo?: string           // ISO datetime-local string
  playerLocation?: string
  preferredCallbackTime?: string
  note?: string
  savedAt: string           // ISO timestamp
  expiresAt: string         // ISO timestamp (savedAt + 24h)
}
```

**Lifecycle**:
- Written on each step advance (debounced, 500 ms)
- Cleared on successful submission
- Checked on form init: if `expiresAt > now`, pre-fill form values and show "Continue from last time?" banner

**Security note**: Does not persist `playerPhone` after step 1 is submitted (phone is kept only for the current session after that — it stays in react-hook-form memory but is not re-serialized to localStorage after initial entry). Actually, since the draft is for continuity of an *incomplete* form, phone IS included in the draft so the user doesn't re-type it. It is cleared on success or expiry.

---

### 2b. Callback Preferences (`shuttle-ksc:callback-prefs`)

Persists optional fields for returning players.

```ts
interface CallbackCapturePreferences {
  preferredCallbackTime?: string
}
```

**Lifecycle**:
- Written on successful submission (overwrite)
- Read on form init for Step 2 pre-fill
- Never expires (until user clears browser data)

---

### 2c. Pending Offline Queue (`shuttle-ksc:pending-callbacks`)

Mirror of the Workbox BackgroundSync queue for UI display.

```ts
interface PendingCallbackItem {
  clientId: string                    // crypto.randomUUID()
  payload: CallbackRequestFormValues  // Full form values
  queuedAt: string                    // ISO timestamp
}

type PendingCallbackQueue = PendingCallbackItem[]
```

**Lifecycle**:
- Item pushed when submit fails with network error (before BackgroundSync queues the same request)
- Item removed when BackgroundSync successfully replays OR when online-flush re-submits successfully
- Max 10 items (oldest dropped if limit exceeded)

---

### 2d. Submitted IDs (`shuttle-ksc:submitted-ids`)

Deduplication log to prevent replay duplicates.

```ts
type SubmittedIdLog = string[]  // Array of clientId UUIDs (max 20, LRU)
```

**Lifecycle**:
- `clientId` appended on every successful submission (online or replayed)
- Before submitting (online or offline-flush), check if `clientId` already present → skip if yes
- Trimmed to last 20 entries on each write

---

### 2e. Visit Counter (`shuttle-ksc:visit-count`)

Controls install prompt display threshold.

```ts
type VisitCount = number  // Integer, incremented on each page mount
```

**Lifecycle**:
- Incremented once per `PublicCalendarPage` mount
- If `visitCount >= 2` and `deferredPrompt != null` → show install banner

---

## 3. Hook Inventory

| Hook | File | Responsibility |
|------|------|---------------|
| `useCallbackDraft` | `src/features/players/call/useCallbackDraft.ts` | Read/write draft to localStorage; expiry check |
| `useCallbackPreferences` | `src/features/players/call/useCallbackPreferences.ts` | Read/write `preferredCallbackTime` preference |
| `useOfflineCallbackQueue` | `src/features/players/call/useOfflineCallbackQueue.ts` | Manage pending queue; online-flush; dedup check |
| `usePWAInstallPrompt` | `src/hooks/usePWAInstallPrompt.ts` | Capture `beforeinstallprompt`; visit-count gate; expose trigger fn |
| `useSubmitCallbackRequest` | `src/features/players/call/useSubmitCallbackRequest.ts` | Existing; modified to accept `clientId` and pre-flight offline check |

---

## 4. Supabase Layer (No Changes)

| Entity | Change |
|--------|--------|
| `callback_requests` table | None |
| `submit_callback_request` RPC | None (called identically) |
| `booking_agents` table | None |
| RLS policies | None |

---

## 5. Workbox Config Change (vite.config.ts)

New `runtimeCaching` entry added to existing `workbox` block:

```ts
{
  urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/rpc\/submit_callback_request/i,
  handler: 'NetworkOnly',
  options: {
    backgroundSync: {
      name: 'callback-requests',
      options: {
        maxRetentionTime: 24 * 60  // 24 hours in minutes
      }
    }
  }
}
```

This is a Workbox `BackgroundSyncPlugin` integration via the `backgroundSync` option in VitePWA's `runtimeCaching`. The Supabase RPC URL pattern targets only the callback submission endpoint.

---

## 6. Step → Field Mapping

| Step | Component | Fields | Validation triggered on "Next" |
|------|-----------|--------|-------------------------------|
| 1 | `CallbackCaptureStep1` | `playerName`, `playerPhone` | `trigger(['playerName', 'playerPhone'])` |
| 2 | `CallbackCaptureStep2` | `slotFrom`, `slotTo`, `playerLocation`, `preferredCallbackTime` | `trigger(['slotFrom', 'slotTo', 'playerLocation'])` |
| 3 | `CallbackCaptureStep3` | `note` + review | Full `handleSubmit` on "Submit" |

---

## 7. State Machine — Submission Flow

```
idle
  → [user clicks Submit] → submitting
      → [RPC success] → success
      → [network error + navigator.onLine false] → offline-queued
      → [other error] → error
  → [online event fires + queue non-empty] → submitting (background replay)
      → [success] → items removed from queue
```
