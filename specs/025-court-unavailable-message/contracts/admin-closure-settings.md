# Contract: Admin Closure Settings

**Feature**: 025-court-unavailable-message
**Type**: Internal UI + data mutation contract

## Purpose

Define the admin-side contract for configuring what players see on the public booking page.

## Inputs

- Existing `court_settings` record (`id = 1`)
- Admin form values from settings page:
  - `playerDisplayMode`
  - `closureMessageMarkdown`

## Mutation Shape

```ts
type PlayerDisplayMode = 'calendar' | 'closure_message'

interface UpdatePlayerDisplayPayload {
  player_display_mode: PlayerDisplayMode
  closure_message_markdown: string | null
  updated_at: string
}
```

## Validation Rules

1. `player_display_mode` must be one of `calendar` or `closure_message`.
2. When `player_display_mode === 'closure_message'`, `closure_message_markdown?.trim().length > 0` is required.
3. Save must be rejected on client before mutation when rule 2 fails.
4. Save success must produce visible admin confirmation feedback.

## Persistence Rules

1. Settings are written to `court_settings` row `id = 1`.
2. Existing RLS policies apply:
   - `anon/authenticated`: SELECT
   - `authenticated + is_admin()`: ALL mutations
3. Message content is retained when switching back to `calendar` mode for future reuse.

## Error Handling

- Mutation/network failures show admin-visible error feedback and keep form state intact.
- Validation failures prevent mutation execution and highlight required message input.

## Non-goals

- No new admin route.
- No separate closure table.
- No rich-text editor introduction in this feature.
