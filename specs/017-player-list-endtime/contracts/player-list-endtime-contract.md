# Contract: Player List End-Time Enforcement

Feature: 017
Scope: Player list derivation/output contract only

## 1. Derivation Input Contract

Function surface (conceptual):

- deriveSlotRows(date, bookings, options?)

Required behavior:
- Accept a close-boundary input that preserves minute precision.
- If boundary input is not provided, use existing default close behavior.

Input rules:
- date: selected day context.
- bookings: day booking set already fetched from existing query path.
- close boundary option: parsed from court_settings.court_close_time when available.

## 2. Derivation Output Contract

For every output row in player list:
- slotStart < slotEnd
- slotEnd <= configured close boundary
- type in {'booking','available'}

Booking row contract:
- If booking overlaps close boundary, output visible segment ends at close boundary.
- If booking starts at or after close boundary, no booking row is emitted.

Available row contract:
- No available row may start or end beyond close boundary.
- Existing past-date suppression behavior remains unchanged.

## 3. Fallback Contract

When court_settings cannot be loaded:
- deriveSlotRows still returns valid rows
- existing default close boundary is used
- no runtime crash or blank list solely due to settings failure

## 4. Non-Goals

- No admin list behavior changes.
- No calendar rendering contract changes.
- No database schema or API contract modifications.
