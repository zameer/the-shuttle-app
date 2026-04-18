# Research: Fix Paid Modal UI

Feature: 020 - paid modal UI fixes
Date: 2026-04-18
Branch: 020-fix-paid-modal-ui

## Modal top-content visibility

- Decision: Use a modal structure with explicit header spacing and an independently scrolling content region so the first paid entry is fully visible on open.
- Rationale: The current composition combines custom zero-padding with overflow constraints, which can cause visual clipping at the top edge.
- Alternatives considered:
  - Increase global dialog top offset only (rejected because it does not guarantee internal content layout correctness).
  - Remove overflow control entirely (rejected because large datasets would break viewport fit).

## Close icon visibility and usability

- Decision: Ensure close icon rendering is explicit and remains inside visible modal chrome on all supported breakpoints.
- Rationale: Closing is a primary modal action and must always be discoverable.
- Alternatives considered:
  - Rely only on backdrop click or keyboard close (rejected: insufficient discoverability).
  - Footer-only close action with no icon (rejected: does not satisfy requested UX behavior).

## Pagination area layout reliability

- Decision: Keep pagination controls in a stable footer region that does not overlap or clip against scrollable body content.
- Rationale: Pagination is actionable UI and must remain consistently visible in both short and long data states.
- Alternatives considered:
  - Place pagination inside scroll body (rejected: can scroll out of view and degrade navigation flow).
  - Render floating pagination overlay (rejected: risks overlap with data rows and accessibility issues).

## Paid section render order

- Decision: Reorder report sections so PAID breakdown renders after outstanding pending and revenue impact.
- Rationale: The requested reading flow is summary first, operations-oriented sections second, and paid drill-down action last.
- Alternatives considered:
  - Keep current position and only restyle (rejected: does not satisfy explicit ordering request).
  - Add user-configurable ordering (rejected: out of scope for this fix feature).

## Data and security scope

- Decision: Preserve existing report service and admin route guard behavior; this feature is UI-only.
- Rationale: Current issue is layout/interaction, not data correctness or access rules.
- Alternatives considered:
  - Add server-driven pagination (rejected: unnecessary for identified issue and expands scope).
  - Introduce new permissions for modal actions (rejected: no requirement and no security gap identified).