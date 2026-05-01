# Research: Calendar Notice Visibility Control (Feature 028)

**Date**: 2026-05-01 | **Branch**: `030-create-feature-branch`

---

## Decision 1: Third Mode Value Name

**Decision**: Use `'both'` as the third `player_display_mode` value.

**Rationale**: Short, self-describing, and avoids confusion with the existing two values. Consistent with the user's language ("both at the same time").

**Alternatives considered**:
- `'calendar_and_message'` — verbose; no added clarity
- `'all'` — too generic, ambiguous for future extension

---

## Decision 2: DB Constraint Update Strategy

**Decision**: New migration file that drops and re-adds the CHECK constraint on `player_display_mode` to include `'both'`.

**Rationale**: PostgreSQL does not support `ALTER CONSTRAINT` for check constraints — the old constraint must be dropped (using the auto-generated name or a named drop) and a new one added. A clean migration file maintains the audit trail.

**Alternatives considered**:
- Modify the original migration — breaks migration history integrity

---

## Decision 3: Public Calendar Layout for "Both" Mode

**Decision**: Render `ClosureMessagePanel` above the calendar/list section in "both" mode using a vertical stack. The view-mode toggle (list/calendar) and CallFAB remain visible since calendar is active.

**Rationale**: Matches the user's stated intent ("both at the same time"). Top placement gives the notice prominence before the calendar. No additional layout primitives required.

**Alternatives considered**:
- Side-by-side layout — complex on mobile, not requested
- Notice at bottom — reduces message visibility

---

## Decision 4: Derive showCalendar / showMessage Booleans

**Decision**: Replace the binary `isClosureMode` flag in `PublicCalendarPage.tsx` with two derived booleans: `showCalendar` and `showMessage`.

```ts
const mode = courtSettings?.player_display_mode ?? 'calendar'
const showCalendar = mode === 'calendar' || mode === 'both'
const showMessage  = mode === 'closure_message' || mode === 'both'
```

**Rationale**: Additive, explicit, and backwards-compatible. Each section guards its own render with one boolean. Adding a fourth mode in future requires only updating the two derivations.

**Alternatives considered**:
- Switch/case on mode string — more verbose, same outcome

---

## Decision 5: Validation for "Both" Mode

**Decision**: Require non-empty `closureMessageMarkdown` when `playerDisplayMode` is `'closure_message'` OR `'both'`. FR-008 (block disabled-both state) is trivially satisfied by a single-select — it is impossible to select "neither" via the UI, but a server-side guard is not added since there is no separate boolean toggle.

**Rationale**: The existing validation guard already catches empty message for `'closure_message'` mode. Extending it to `|| playerDisplayMode === 'both'` is minimal and correct.

---

## Decision 6: Admin Settings Grid Layout

**Decision**: Change the mode selector from a 2-column grid to a 3-column grid (`sm:grid-cols-3`). Add the "Both" button with a distinct blue-purple tint to visually distinguish it as a combination mode.

**Rationale**: The existing 2-column card grid is straightforward to extend. On mobile the cards stack vertically (single column) which handles the third option without overflow.

---

## Decision 7: Legacy Settings Compatibility (FR-011)

**Decision**: The initialization in `AdminSettingsPage.tsx` currently does:
```ts
setPlayerDisplayMode(settings.player_display_mode === 'closure_message' ? 'closure_message' : 'calendar')
```
This must be updated to:
```ts
const raw = settings.player_display_mode
setPlayerDisplayMode(raw === 'closure_message' ? 'closure_message' : raw === 'both' ? 'both' : 'calendar')
```
Any existing row with `player_display_mode = 'calendar'` or `'closure_message'` remains valid after the schema change.

---

## Decision 8: ClosureMessagePanel — No Changes Required

**Decision**: `ClosureMessagePanel` is a stateless presentational component. It accepts a nullable message string. No changes are required — it renders correctly in both `'closure_message'` and `'both'` mode contexts.
