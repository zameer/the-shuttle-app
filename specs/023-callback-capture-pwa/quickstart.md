# Quickstart: 023 — Callback Capture PWA Upgrade

**Branch**: `023-new-speckit-spec` | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Prerequisites

- Node.js ≥ 20, `npm install` already run
- Supabase dev server running (or `.env.local` with remote keys)
- Chrome DevTools (for offline simulation, PWA install testing)

---

## Running the Dev Server

```sh
npm run dev
```

Navigate to `http://localhost:5173`. The public calendar page shows at `/`.

> **Note**: Service workers are **disabled** in `vite dev` mode. To test BackgroundSync and offline queuing, run `npm run build && npm run preview` first (see "Testing Offline" below).

---

## Testing the Guided Multi-Step Flow

1. Open the public page (`/`).
2. Click the FAB (floating action button, bottom-right).
3. Choose **"Request a Callback"** — the Dialog opens at Step 1.
4. Verify:
   - Step 1 shows "Could you please mention" — name + phone fields only.
   - Clicking **"Next"** with empty fields shows validation errors.
   - Filling both fields and clicking **"Next"** advances to Step 2.
5. Step 2 — "When and where?":
   - Set slot start and slot end (use datetime-local inputs).
   - Set a location and preferred callback time. Click **"Next"**.
   - Slot end before slot start shows a cross-field error.
6. Step 3 — "Anything else?":
   - Step 3 contains only note input plus confirmation review.
   - A read-only review panel shows Step 1–2 values.
   - Click **"Submit"** to send.
7. Success screen shows confirmation with assigned agent or "pending" message (same as before).

---

## Testing Draft Restoration

1. Complete Step 1 and Step 2 (do not submit).
2. Reload the page.
3. Click the FAB → "Request a Callback".
4. A **"Continue from last time?"** banner should appear above Step 1 with a timestamp.
5. Click **"Restore"** — form fields should be pre-filled with your previous values.
6. Click **"Start fresh"** — banner dismisses and the form is blank.

> Draft expires after 24 hours. To test expiry, manually edit `shuttle-ksc:callback-draft` in DevTools → Application → Local Storage and change `expiresAt` to a past ISO date.

---

## Testing Offline Queuing

> Requires a production build and the preview server.

```sh
npm run build
npm run preview
```

Navigate to `http://localhost:4173`.

1. Open DevTools → **Application** → **Service Workers** — confirm the SW is registered.
2. Open DevTools → **Network** → set to **Offline**.
3. Fill the callback form on all 3 steps and click **"Submit"**.
4. Expected: a toast saying "Saved offline — will send when you reconnect" and the modal shows the "offline queued" confirmation screen.
5. Check DevTools → Application → Local Storage → `shuttle-ksc:pending-callbacks` — the queued item should appear.
6. Set Network back to **Online**.
7. Within a few seconds, the pending item should be flushed (removed from localStorage). A success toast appears.

**To test BackgroundSync replay** (browser-controlled):
1. Queue a submission while offline (as above).
2. Completely close the tab and reopen it.
3. DevTools → Application → Background Services → Background Sync — shows the pending queue.
4. Go online. The SW replays the request automatically.

---

## Testing the PWA Install Prompt

1. Open the app in Chrome on a fresh profile (or incognito with PWA support enabled).
2. The `beforeinstallprompt` event fires on first load but the banner is suppressed (visit count = 1).
3. Reload the page (visit count = 2).
4. A subtle **"Add to Home Screen"** banner should appear below the page header.
5. Click **"Install"** — Chrome's install dialog appears.
6. Click **"Not now"** — the banner dismisses and does not re-appear during the session.

> To reset visit count: DevTools → Application → Local Storage → delete `shuttle-ksc:visit-count`.

---

## Testing Preference Persistence

1. Complete a full form submission. In Step 2, enter `"after 5pm"` as the preferred callback time.
2. After success, dismiss the modal.
3. Open the form again (FAB → "Request a Callback").
4. Navigate to Step 2 — `preferredCallbackTime` should be pre-filled with `"after 5pm"`.
5. To clear: DevTools → Application → Local Storage → delete `shuttle-ksc:callback-prefs`.

---

## Running Checks

```sh
# TypeScript type-check
npx tsc --noEmit

# Lint (feature files)
npx eslint src/features/players/call/ src/hooks/usePWAInstallPrompt.ts
```

Both must report zero errors before submitting a PR.

---

## localStorage Key Reference

| Key | Purpose | Cleared when |
|-----|---------|-------------|
| `shuttle-ksc:callback-draft` | In-progress form draft | On successful submit or expiry (24h) |
| `shuttle-ksc:callback-prefs` | Saved `preferredCallbackTime` | Never (user clears browser data) |
| `shuttle-ksc:pending-callbacks` | Offline queue mirror | Item removed after successful replay |
| `shuttle-ksc:submitted-ids` | Deduplication log (last 20 IDs) | Never (auto-trimmed to 20 entries) |
| `shuttle-ksc:visit-count` | Install prompt threshold | Never |

---

## Files Changed (planned)

| File | Change |
|------|--------|
| `vite.config.ts` | Add BackgroundSync Workbox config |
| `src/features/players/call/CallbackRequestForm.tsx` | Replace with multi-step coordinator |
| `src/features/players/call/CallbackCaptureStep1.tsx` | New: identity step |
| `src/features/players/call/CallbackCaptureStep2.tsx` | New: booking step |
| `src/features/players/call/CallbackCaptureStep3.tsx` | New: extras + review step |
| `src/features/players/call/CallbackSuccessView.tsx` | New: success/queued confirmation |
| `src/features/players/call/useCallbackDraft.ts` | New: localStorage draft hook |
| `src/features/players/call/useCallbackPreferences.ts` | New: preference persistence hook |
| `src/features/players/call/useOfflineCallbackQueue.ts` | New: offline queue hook |
| `src/features/players/call/useSubmitCallbackRequest.ts` | Modify: add `clientId` + offline check |
| `src/features/players/call/types.ts` | Modify: add `SubmissionStatus`, draft types |
| `src/features/players/call/CallbackRequestModal.tsx` | Modify: upgrade Dialog to mobile-full-screen |
| `src/hooks/usePWAInstallPrompt.ts` | New: deferred install prompt hook |
| `src/features/players/PublicCalendarPage.tsx` | Modify: add install banner |
