# Research: Mobile-Friendly Calendar List Toggle

## Decision 1: Where to host the new list mode toggle

- Decision: Extend `CalendarContainer` view controls from `week|month` to include a separate display mode control (`calendar|list`) managed by `PublicCalendarPage`.
- Rationale: `CalendarContainer` already owns date navigation and calendar granularity controls. Keeping the display-mode switch adjacent improves usability and minimizes duplicate control surfaces.
- Alternatives considered:
  - Add toggle only in `PublicCalendarPage` outside the container: rejected due to fragmented controls and inconsistent placement.
  - Replace `week|month` with `list`: rejected because it removes existing granularity capability.

## Decision 2: List data source and transformation

- Decision: Reuse the same booking query result currently used for calendar rendering and derive list rows client-side.
- Rationale: Avoids additional API traffic and guarantees consistent slot status between calendar and list views.
- Alternatives considered:
  - Fetch a separate list endpoint: rejected because it duplicates data retrieval and risks status drift.

## Decision 3: List-row granularity

- Decision: Use fixed hourly rows matching existing visible scheduling cadence (06:00-22:00), mapping each row to availability and optional booking metadata.
- Rationale: Mirrors existing player mental model from the calendar and keeps parity for booking actions.
- Alternatives considered:
  - Only render existing booking records: rejected because it hides available gaps and blocks booking initiation in empty hours.

## Decision 4: Mobile-first readability and interaction

- Decision: Design list rows as full-width touch targets with clear time, status, and action affordance; maintain keyboard focus order and visible focus states.
- Rationale: Spec prioritizes mobile friendliness and accessibility while preserving desktop usability.
- Alternatives considered:
  - Dense table-like rows: rejected as hard to scan on <=375 px widths.

## Decision 5: Rules banner action simplification

- Decision: Remove the dedicated "View Full Rules" CTA from `RulesBanner` and retain chip-click + header button entry points.
- Rationale: Matches feature request to reduce visual clutter without losing access paths.
- Alternatives considered:
  - Keep CTA and de-emphasize visually: rejected because requirement explicitly removes link presence.

## Decision 6: Persistence of selected display mode

- Decision: Keep display mode in React state for current session context (no storage persistence).
- Rationale: Requirement mandates easy switching and context retention while interacting, not cross-session preference saving.
- Alternatives considered:
  - Persist in localStorage: rejected for now to keep scope minimal and avoid preference migration complexity.

## Decision 7: Default display mode on page load

- Decision: Initialize `displayMode` as `'list'` (not `'calendar'`) in `PublicCalendarPage`.
- Rationale: FR-002 explicitly mandates list view as the default so that players on mobile see the most readable format without any extra interaction. SC-001 validates this as the first measurable success criterion.
- Alternatives considered:
  - Default to `'calendar'`: rejected because FR-002 and amended US1 explicitly require list view to be active without any user action on page load.
  - Detect viewport and choose default accordingly: rejected as unnecessary complexity; list view is beneficial at all viewports as a starting point.
