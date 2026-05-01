# Data Model: Calendar Notice Visibility Control (Feature 028)

**Date**: 2026-05-01 | **Branch**: `030-create-feature-branch`

---

## Overview

Feature 028 extends the existing `court_settings` singleton row (introduced in feature 025) to support a third `player_display_mode` value: `'both'`. No new tables are required. One new migration is needed to update the CHECK constraint.

---

## Entities

### 1. Court Settings (Existing, Extended)

Global singleton settings row. Only `player_display_mode` type is widened.

| Field | Type | Change |
|---|---|---|
| `id` | `integer` | None |
| `court_open_time` | `time` | None |
| `court_close_time` | `time` | None |
| `default_hourly_rate` | `numeric` | None |
| `available_rates` | `jsonb` | None |
| `terms_and_conditions` | `text \| null` | None |
| `player_display_mode` | `'calendar' \| 'closure_message' \| 'both'` | **Extended** — adds `'both'` |
| `closure_message_markdown` | `text \| null` | None |
| `updated_at` | `timestamptz` | None |

**DB constraint change**:  
Old: `CHECK (player_display_mode IN ('calendar', 'closure_message'))`  
New: `CHECK (player_display_mode IN ('calendar', 'closure_message', 'both'))`

---

### 2. PlayerDisplayMode (TypeScript type, Extended)

**File**: `src/features/admin/useCourtSettings.ts`

Old: `'calendar' | 'closure_message'`  
New: `'calendar' | 'closure_message' | 'both'`

---

### 3. Player Visibility State (Derived, New)

Derived from `court_settings.player_display_mode` in `PublicCalendarPage.tsx`.

| Field | Type | Derivation |
|---|---|---|
| `showCalendar` | `boolean` | `mode === 'calendar' \|\| mode === 'both'` |
| `showMessage` | `boolean` | `mode === 'closure_message' \|\| mode === 'both'` |

These replace the single `isClosureMode` flag.

---

### 4. Admin Player View Form State (Existing, Extended)

**File**: `src/features/admin/AdminSettingsPage.tsx`

| Field | Type | Change |
|---|---|---|
| `playerDisplayMode` | `PlayerDisplayMode` | Accepts `'both'` in addition to existing values |

Initialization change: `settings.player_display_mode` is now passed through to the state directly (handling all three valid values), falling back to `'calendar'` for null or unrecognized values.

Validation change: message required when `playerDisplayMode === 'closure_message' || playerDisplayMode === 'both'`.

---

## Validation Rules

- `player_display_mode` must be exactly one of `'calendar'`, `'closure_message'`, or `'both'`.
- `closure_message_markdown` must contain at least one non-whitespace character when `player_display_mode` is `'closure_message'` or `'both'`.
- It is impossible to persist a "neither" state via the UI (single-select); FR-008 is satisfied structurally.
- Legacy rows with `player_display_mode = 'calendar'` or `'closure_message'` remain valid with no data migration needed.

---

## State Transitions

1. **Calendar Only** (`player_display_mode = 'calendar'`):
   - `showCalendar = true`, `showMessage = false`
   - Players see calendar/list UI only

2. **Message Only** (`player_display_mode = 'closure_message'`):
   - `showCalendar = false`, `showMessage = true`
   - Players see ClosureMessagePanel only

3. **Both** (`player_display_mode = 'both'`):
   - `showCalendar = true`, `showMessage = true`
   - Players see ClosureMessagePanel above calendar/list UI
   - View toggle (list/calendar) and CallFAB remain active

4. **Mode Change**:
   - Admin selects new mode and saves → `updateSettings` persists → React Query cache invalidated → public page refetches on next request

---

## Relationships

1. `Admin Player View Form State` → mutates `Court Settings` singleton row
2. `Court Settings` → drives `Player Visibility State` for all player sessions
3. `Player Visibility State` → controls which UI sections render in `PublicCalendarPage.tsx`
