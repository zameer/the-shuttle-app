# Research: 025 - Court Unavailable Announcement

**Date**: 2026-04-28 | **Branch**: `028-pre-specify-branch`
**Resolves**: Technical context and implementation decisions for player closure-message mode

---

## Decision 1: Persist Mode and Message in `court_settings`

**Decision**: Extend the existing single-row `court_settings` table with two new fields:
- `player_display_mode` (`calendar` | `closure_message`)
- `closure_message_markdown` (`TEXT`)

**Rationale**:
- `court_settings` already holds global public-calendar behavior and is exposed to both admin and player contexts through existing hooks.
- Single-row semantics (`id = 1`) match this feature's global toggle requirement.
- Existing RLS policies already allow public read and admin-only writes.

**Alternatives considered**:
- New table for closure settings: rejected due to unnecessary schema and query complexity.
- Reusing `terms_and_conditions`: rejected because terms page content and closure banner content serve different business purposes.

---

## Decision 2: Keep Existing Public Route and Branch Rendering

**Decision**: Keep the player entry route at `/` and branch rendering inside `PublicCalendarPage`:
- `calendar` mode -> current list/calendar toggle UI
- `closure_message` mode -> closure announcement panel only (no booking calendar interactions)

**Rationale**:
- Avoids routing and navigation regressions.
- Ensures all player entry points that already resolve to `PublicCalendarPage` respect the same source-of-truth mode.

**Alternatives considered**:
- Separate closure page route: rejected because mode switching would require redirect coupling and increases stale-state risk.

---

## Decision 3: Markdown Rendering Strategy and Safety

**Decision**: Render closure content with `react-markdown` using the same markdown-only approach already used by player rules.

**Rationale**:
- `react-markdown` is already installed and used in production code (`RulesModal`).
- Markdown gives admins required formatting (headings, emphasis, lists) without introducing raw HTML execution.
- Consistent with existing UI patterns and dependencies.

**Alternatives considered**:
- Plain text only: rejected; does not satisfy FR-005.
- Rich text editor with HTML storage: rejected as out-of-scope and higher security surface area.

---

## Decision 4: Save Validation Rules

**Decision**: Enforce validation in admin settings before saving closure mode:
- If `player_display_mode = closure_message`, message must be non-empty after trim.
- For `calendar` mode, message may remain stored but is ignored by player UI.

**Rationale**:
- Directly enforces FR-006.
- Preserves previously authored message for quick reactivation.

**Alternatives considered**:
- Clearing message when switching back to calendar: rejected; harms admin workflow and causes unnecessary rewrite.

---

## Decision 5: Fallback Behavior on Render Failure

**Decision**: Add a safe display fallback for players:
- If markdown render fails, show sanitized/plain-text content in a basic typography container.
- Always preserve a clear "court unavailable until further notice" headline.

**Rationale**:
- Satisfies FR-010 and prevents blank/broken public page.
- Keeps communication available even under malformed markdown edge cases.

**Alternatives considered**:
- Fail closed with generic error panel only: rejected; hides admin-provided details.

---

## Decision 6: Live Consistency and Cache Invalidation

**Decision**: Reuse React Query invalidation on `court-settings` mutation and rely on existing fetch path in `PublicCalendarPage` to reflect mode/message updates.

**Rationale**:
- Existing settings update path already invalidates `['court-settings']`.
- Limits scope to predictable query behavior without introducing websocket or polling complexity.

**Alternatives considered**:
- Introduce realtime subscriptions for settings: rejected as unnecessary for this scope.

---

## Best-Practice Summary

- Keep closure mode as a global settings concern in `court_settings`.
- Render markdown through existing dependency (`react-markdown`) and avoid raw HTML channels.
- Validate closure mode activation with trimmed non-empty message.
- Preserve message content across mode toggles for operational speed.
- Keep player page in a single route with explicit conditional rendering to prevent mixed states.
