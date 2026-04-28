# Quickstart: 025 - Court Unavailable Announcement

Validate admin-controlled player display mode (`calendar` vs `closure_message`) with formatted closure notice rendering.

## Prerequisites

- Local environment configured for the app.
- Supabase migration for new `court_settings` fields applied.
- Admin account available for `/admin/settings`.

## 0. Apply migration (local/dev)

1. Apply migration `supabase/migrations/20260428_add_player_display_mode_and_closure_message_to_court_settings.sql` in your local Supabase environment.
2. Verify `court_settings` row `id = 1` contains:
   - `player_display_mode` (`calendar` by default)
   - `closure_message_markdown` (`null` by default)
3. Confirm existing RLS access behavior remains unchanged:
   - public read
   - admin-managed updates

## 1. Install and run

```bash
npm install
npm run dev
```

## 2. Verify baseline (calendar mode)

1. Open player page (`/`).
2. Confirm default behavior remains current booking interface (list/calendar controls visible).
3. Confirm booking interactions are read-only as before.

Expected:
- No closure message shown in calendar mode.

## 3. Configure closure mode in admin

1. Sign in as admin.
2. Open `/admin/settings`.
3. Set player display mode to `Closure message`.
4. Enter markdown message, for example:

```md
# Court Unavailable Until Further Notice

We are temporarily closed for maintenance.

- No bookings can be accepted right now.
- Existing players will be informed when we reopen.

**Contact**: +94 XX XXX XXXX
```

5. Save settings.

Expected:
- Save succeeds with clear confirmation feedback.
- Validation prevents save if closure mode is selected and message is empty/whitespace.

## 4. Verify player closure experience

1. Open `/` in a new tab or refresh existing tab.
2. Confirm closure panel appears.
3. Confirm calendar/list toggle and booking availability UI are hidden.
4. Confirm markdown formatting is readable on:
   - mobile width >= 375 px
   - tablet width >= 768 px
   - desktop width >= 1280 px

Expected:
- Only closure message is shown.
- No mixed state where closure and calendar UI appear together.

## 5. Update closure message

1. In admin settings, edit markdown content.
2. Save.
3. Refresh player page.

Expected:
- Latest saved message is rendered.

## 6. Return to calendar mode

1. In admin settings, switch mode to `Calendar`.
2. Save.
3. Refresh player page.

Expected:
- Player page returns to normal booking interface.
- Closure panel is no longer visible.

## 7. Render fallback check

1. Use intentionally malformed markdown patterns (deep nesting/invalid constructs).
2. Confirm player page remains readable and does not crash.

Expected:
- Safe fallback text rendering appears if markdown render path fails.

## 8. Quality gates

```bash
npm run lint
npx tsc --noEmit
```

Expected:
- Feature-touched files lint/type-check clean.
- Any pre-existing unrelated workspace lint failures should be logged separately.

## 9. Implementation validation log (2026-04-28)

- `npm run lint`: FAIL (workspace pre-existing lint issues)
   - `specs/021-route-callback-requests/contracts/CallbackRequestForm.ts`: unused `z`
   - `src/components/ui/badge.tsx`: `react-refresh/only-export-components`
   - `src/components/ui/button.tsx`: `react-refresh/only-export-components`
   - `src/features/admin/AdminSettingsPage.tsx`: `react-hooks/set-state-in-effect` (existing form hydration pattern)
   - `src/features/auth/useAuth.tsx`: `react-refresh/only-export-components`
   - `src/features/booking/PlayerSelectCombobox.tsx`: `no-explicit-any`
   - `src/features/players/header/types.ts`: `no-useless-escape`
   - `src/hooks/useTimeAdjustment.ts`: unused `addMinutes`
- `npx tsc --noEmit`: PASS
- Manual acceptance walkthrough: pending interactive browser validation for US1-US3
