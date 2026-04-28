# Data Model: 025 - Court Unavailable Announcement

**Source**: `research.md` | **Date**: 2026-04-28

---

## Overview

Feature 025 adds global player-view configuration for full-court closure messaging.
Implementation extends existing `court_settings` (single-row configuration) and introduces no new tables.

---

## Entities

### 1. Court Settings (Existing, Extended)

Global settings row used by both admin and player flows.

| Field | Type | Notes |
|------|------|------|
| `id` | `integer` | Fixed `1` singleton row |
| `court_open_time` | `time` | Existing |
| `court_close_time` | `time` | Existing |
| `default_hourly_rate` | `numeric` | Existing |
| `available_rates` | `jsonb` | Existing |
| `terms_and_conditions` | `text \| null` | Existing |
| `player_display_mode` | `'calendar' \| 'closure_message'` | **New**; global player mode |
| `closure_message_markdown` | `text \| null` | **New**; admin-authored markdown closure notice |
| `updated_at` | `timestamptz` | Existing, bumped on save |

RLS remains unchanged:
- Public read policy already exists.
- Admin write policy already exists.

---

### 2. Admin Closure Settings Input (New UI Entity)

Admin form state used to save player display mode and message.

| Field | Type | Notes |
|------|------|------|
| `playerDisplayMode` | `'calendar' \| 'closure_message'` | Required |
| `closureMessageMarkdown` | `string` | Required only for closure mode |
| `saveRequestedAt` | `Date` | Client-side event marker |

Validation:
- Trimmed `closureMessageMarkdown.length > 0` when `playerDisplayMode = 'closure_message'`.
- Reject save when rule fails and show inline/admin toast feedback.
- Preserve existing `closureMessageMarkdown` content when mode is switched back to `calendar`.

---

### 3. Player Availability View State (New Derived UI Entity)

Derived state in `PublicCalendarPage` from `court_settings`.

| Field | Type | Notes |
|------|------|------|
| `mode` | `'calendar' \| 'closure_message'` | Derived from settings |
| `message` | `string` | Markdown text for closure mode |
| `renderState` | `'calendar_ui' \| 'closure_ui' \| 'fallback_text'` | Determined by mode + render health |

---

## Relationships

1. `Admin Closure Settings Input` -> updates singleton `Court Settings` row.
2. `Court Settings` -> drives `Player Availability View State` for all player sessions.
3. `Player Availability View State` -> selects one UI branch:
   - Calendar/list availability interface
   - Closure announcement interface

---

## Validation Rules

- `player_display_mode` must be exactly `calendar` or `closure_message`.
- If mode is `closure_message`, `closure_message_markdown` must contain at least one non-whitespace character.
- Player UI must never render both calendar controls and closure panel simultaneously.
- If markdown rendering fails, fallback text render must remain readable and non-empty.
- Existing `court_settings` constraints (singleton row) remain intact.
- If message is empty/null, player closure view falls back to a default readable closure notice.

---

## State Transitions

1. **Calendar Active**:
   - `player_display_mode = calendar`
   - Players see current calendar/list experience.

2. **Closure Activated**:
   - Admin saves `player_display_mode = closure_message` with valid message.
   - Public page resolves to closure panel and hides booking interactions.

3. **Closure Message Updated**:
   - Admin edits markdown while closure mode active.
   - Players see updated content on next settings fetch/refetch.

4. **Return to Calendar**:
   - Admin saves `player_display_mode = calendar`.
   - Public page returns to normal booking UI; previous closure content remains stored for future reuse.
