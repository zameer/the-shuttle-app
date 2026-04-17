# Research: List End-Time and Payment Visibility

Feature: 016 - Fix list end boundary and payment status visibility  
Branch: 016-setup-feature-branch  
Date: 2026-04-17

## Decision 1: Keep list schedule boundary at 06:00-22:00 but stop clipping booking rows

- Decision: Preserve schedule window constants for slot generation but remove booking end-time clamping for booking rows in list derivation.
- Rationale: Current derivation clamps booking rows to schedule end and causes perceived 30-minute shortfall and list/calendar mismatch for end-boundary overlaps.
- Alternatives considered:
  - Keep clamp and show visual warning: rejected because it still diverges from calendar behavior.
  - Extend schedule end globally: rejected because the reported defect is clipping inconsistency, not schedule policy change.

## Decision 2: Keep overlap inclusion logic aligned with calendar behavior

- Decision: Ensure any booking overlapping the visible day context remains represented in list derivation and is not hidden due to end-boundary clipping side effects.
- Rationale: FR-003 and FR-004 require parity between list and calendar for overlapping bookings.
- Alternatives considered:
  - Restrict to in-window-only bookings: rejected due to data visibility loss near boundary.

## Decision 3: Add payment status to admin booking rows only

- Decision: Display payment status badge on booking rows in admin list view; do not show payment state on available rows.
- Rationale: Supports admin operational scanning while preserving current player/public visibility boundaries.
- Alternatives considered:
  - Show payment status in player list view: rejected because requirement scope is admin list only.

## Decision 4: Reuse existing payment-status utility module

- Decision: Reuse normalizePaymentStatus/getPaymentStatusLabel/getPaymentStatusBadgeVariant from existing payment status utility instead of introducing new mapping logic.
- Rationale: Keeps behavior consistent with booking detail and calendar surfaces while avoiding duplicated status semantics.
- Alternatives considered:
  - Inline mapping in AdminListView: rejected because it duplicates logic and risks drift.

## Decision 5: Keep derivation as pure transformation, not UI-layer patching

- Decision: Fix boundary behavior in deriveSlotRows and deriveAdminListRows rather than compensating only in rendering components.
- Rationale: Derivation is the shared source of list truth; fixing there keeps both admin/player list outputs coherent.
- Alternatives considered:
  - UI-only post-processing in list components: rejected because it fragments behavior and increases maintenance cost.

## Decision 6: Preserve past-date available-row suppression behavior

- Decision: Keep existing isPastDate suppression for available rows unchanged while applying boundary fixes only to booking-row visibility.
- Rationale: Past-date suppression is a distinct feature already implemented and should not regress.
- Alternatives considered:
  - Remove suppression during boundary fix: rejected as out-of-scope regression risk.

## Decision 7: No schema or API contract changes required

- Decision: Treat this as display/derivation-layer correction only with existing booking/payment fields.
- Rationale: Required data already exists in booking query payloads.
- Alternatives considered:
  - Add DB fields or migration: rejected because no new persistence requirement exists.

## Decision 9: Align list schedule window with court_settings (secondary improvement)

- Decision: Accept an optional `scheduleEndHour` parameter in both derive functions (default: existing `SCHEDULE_END_HOUR = 22`). Callers pass `Math.ceil(timeStrToHours(court_close_time))` from their already-loaded court settings query — mirroring how `WeekView.tsx` (line 44) derives its grid height.
- Rationale: The calendar WeekView reads `court_close_time` from the DB (`Math.ceil(timeStrToHours(settings.court_close_time))`), while both derive functions hardcode `SCHEDULE_END_HOUR = 22`. If `court_close_time = "22:30:00"`, the calendar renders to row 23:00 while the list stops at 22:00 — explaining the 30-minute shortfall in Issue 1. Making derive functions accept this parameter fixes both the hardcoded mismatch and ensures future schedule changes propagate automatically to list views.
- Alternatives considered:
  - Keep hardcoded 22 and only fix clamping: partially addresses Issue 1 only when a booking crosses 22:00; does not fix mismatch when court_close_time itself differs from 22:00.
  - Move `SCHEDULE_END_HOUR` to a shared constant file: still hardcoded, not DB-driven.

