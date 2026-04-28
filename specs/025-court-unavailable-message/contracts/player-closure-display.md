# Contract: Player Closure Display

**Feature**: 025-court-unavailable-message
**Type**: Public UI rendering contract

## Purpose

Guarantee deterministic player-facing rendering based on global display mode.

## Input Source

`PublicCalendarPage` consumes `court_settings` and derives:
- `player_display_mode`
- `closure_message_markdown`

## View Selection Contract

```ts
type PlayerDisplayMode = 'calendar' | 'closure_message'

interface PlayerClosureDisplayState {
  mode: PlayerDisplayMode
  closureMessage: string | null
  render: 'calendar-ui' | 'closure-ui' | 'fallback-text'
}
```

## Rendering Rules

1. If `mode === 'calendar'`:
   - Render existing calendar/list availability UI.
   - Render booking-related read-only interactions as currently defined.
2. If `mode === 'closure_message'`:
   - Hide calendar/list mode controls.
   - Hide all booking availability interaction surfaces.
   - Render closure heading and markdown message.
3. Do not render both calendar UI and closure UI in the same paint path.

## Formatting Contract

1. Markdown formatting supports readable structures (headings, emphasis, lists).
2. Rendering uses markdown-safe pathway (no executable content).
3. If markdown rendering fails, fallback to plain readable text while preserving closure intent.

## Consistency Expectations

1. Latest saved admin mode is the sole source of truth for all player sessions.
2. Latest saved closure message is displayed whenever closure mode is active.
3. Switching back to `calendar` removes closure UI and restores existing player booking views.

## Responsive Contract

Closure UI remains readable and functional at:
- mobile >= 375 px
- tablet >= 768 px
- desktop >= 1280 px

## Non-goals

- No per-court selective closure behavior.
- No role-specific player variants.
