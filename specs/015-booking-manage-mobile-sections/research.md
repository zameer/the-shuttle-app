# Research: Mobile Booking Manage Sections

Feature: 015 - Mobile Booking Manage Sections  
Branch: 015-init-speckit-feature  
Date: 2026-04-17

## Decision 1: Use progressive disclosure with section panels

- Decision: Split booking manage content into clearly labeled panels, with core summary panel always visible and non-core panels collapsed by default.
- Rationale: The current long-form modal creates vertical overflow on small devices. Progressive disclosure reduces scroll cost and cognitive load.
- Alternatives considered:
  - Keep fully expanded single column: rejected due to primary action accessibility issues.
  - Move to multi-screen wizard: rejected because it slows quick updates like status-only edits.

## Decision 2: Define default-visible core summary as player, status, and contact details

- Decision: On screen open, show player info, status controls, and contact details without expansion.
- Rationale: This aligns with the clarification and supports the most frequent admin decisions first.
- Alternatives considered:
  - Show player and status only: rejected by clarification.
  - Show only status by default: rejected because identification and contact context are needed for confident updates.

## Decision 3: Keep primary actions in a sticky action bar

- Decision: Place save and critical actions in a sticky footer action bar inside the modal container.
- Rationale: Sticky actions keep critical controls reachable while navigating long details. This directly addresses mobile inaccessibility.
- Alternatives considered:
  - Static action area at end of content: rejected because it can be pushed off-screen.
  - Floating action button only: rejected because multiple actions are required and need clear labels.

## Decision 4: Lazy-render non-core panel content

- Decision: Render heavier sections only when expanded, while preserving values once entered.
- Rationale: Improves perceived responsiveness and avoids unnecessary initial render work in PWA mobile contexts.
- Alternatives considered:
  - Render all sections but hide visually: rejected because it still incurs initial render complexity and does not optimize mobile performance.

## Decision 5: Preserve section and form state for session continuity

- Decision: Maintain section expanded/collapsed state and edited values during orientation changes and panel toggles.
- Rationale: Prevents accidental data loss and supports reliable PWA use patterns.
- Alternatives considered:
  - Reset all on close/open: acceptable only across sessions, not within one edit session.

## Decision 6: Group target implementation around BookingDetailsModal

- Decision: Implement layout behavior in BookingDetailsModal and keep business logic in existing hooks.
- Rationale: Minimizes risk and follows constitution principles for reusability and separation of concerns.
- Alternatives considered:
  - Build a separate mobile-only modal component: rejected due to duplication and drift risk.

## Decision 7: Use simple panel primitives from existing stack

- Decision: Use existing React plus Tailwind and local state with lightweight panel toggles, avoiding new dependencies.
- Rationale: Existing UI stack already supports this without extra package overhead.
- Alternatives considered:
  - Add dedicated accordion package: rejected due to unnecessary dependency addition.

## Decision 8: Validate success with interaction-based QA metrics

- Decision: Measure reduction in scroll interactions and action reachability across common mobile breakpoints and PWA mode.
- Rationale: These directly map to the feature’s user pain and success criteria.
- Alternatives considered:
  - Visual-only review: rejected as insufficiently measurable.
