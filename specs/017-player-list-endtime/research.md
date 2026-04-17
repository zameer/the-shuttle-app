# Research: Player List End-Time Enforcement

Feature: 017 - Player list should not show beyond end time
Date: 2026-04-17
Branch: 017-create-feature-branch

## Decision 1: Enforce player-list hard stop at configured close time

- Decision: Player list booking rows are clamped to configured close boundary; no row may end after close.
- Rationale: User requirement states end time is critical due to residential area constraints. Player-facing output must not suggest post-close playability.
- Alternatives considered:
  - Keep unclamped booking rows for calendar parity (rejected: violates FR-001/FR-002/FR-003).
  - Apply same clamp to admin list (rejected: out of scope; admin operational visibility remains unchanged).

## Decision 2: Use minute-precision close boundary, not hour-only rounding

- Decision: Derivation must use exact close time (HH:mm[:ss]) when building effective schedule end and booking clamp.
- Rationale: Hour rounding via Math.ceil can expose rows beyond actual boundary (e.g., 22:30 rounded to 23).
- Alternatives considered:
  - Keep scheduleEndHour numeric API only (rejected: cannot enforce precise non-zero minute boundaries).
  - Floor rounding (rejected: can hide valid in-window rows).

## Decision 3: Keep scope limited to player list rendering

- Decision: Update player-list derivation and caller flow only; no schema, RLS, or role/auth changes.
- Rationale: Spec FR-006 limits scope to player list rendering and forbids role model changes.
- Alternatives considered:
  - New DB field such as residential_hard_close_time (rejected for this feature: unnecessary scope expansion).
  - Global close-time behavior across all views (rejected: not requested).

## Decision 4: Preserve safe fallback when settings unavailable

- Decision: If court settings fail to load, player list uses current default close boundary behavior.
- Rationale: Matches FR-007 and avoids runtime failures.
- Alternatives considered:
  - Render empty list until settings load (rejected: poor UX and unnecessary block).
  - Throw hard error when settings missing (rejected: violates resiliency requirement).

## Decision 5: Keep existing filter semantics for post-close bookings

- Decision: Continue filtering to bookings overlapping visible window and ensure rows starting at/after close are excluded from player list output.
- Rationale: Supports FR-004 while preserving current derivation model.
- Alternatives considered:
  - UI-only clipping after derivation (rejected: can leave inconsistent duration metadata).
