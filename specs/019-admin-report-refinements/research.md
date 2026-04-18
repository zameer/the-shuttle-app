# Research: Admin Report Refinements

Feature: 019 - Admin report refinements
Date: 2026-04-18
Branch: 019-admin-report-refinements

## Decision 1: Remove standalone pending breakdown and rely on existing pending-focused views

- Decision: Eliminate the dedicated pending breakdown section from the admin financial report while retaining pending summary totals and the outstanding pending-by-player section.
- Rationale: The pending breakdown duplicates part of the information already represented by summary totals and the actionable outstanding pending list. Removing it simplifies the page without reducing collections visibility.
- Alternatives considered:
  - Keep both pending breakdown and outstanding pending list (rejected: redundant detail on the main page).
  - Replace pending breakdown with a second pending modal (rejected: adds a new interaction the request did not ask for).

## Decision 2: Keep paid detail in the report payload and move access into a modal

- Decision: Continue generating paid breakdown entries from the shared report service/hook, but present them only when the admin explicitly opens a paid-detail modal.
- Rationale: This preserves reconciliation with summary totals and avoids extra fetch paths while removing visual crowding from the main report surface.
- Alternatives considered:
  - Inline paid section with collapse/expand state (rejected: still competes for vertical space on the report page).
  - Separate route for paid detail (rejected: more navigation overhead and loses report context).

## Decision 3: Use client-side pagination for paid entries

- Decision: Paginate the already-loaded paid entry array in the UI layer rather than issuing additional paged Supabase queries.
- Rationale: The report query already returns the paid dataset for the selected range, and slicing it client-side keeps pagination deterministic, low-complexity, and reconciliation-safe.
- Alternatives considered:
  - Server-side pagination via query params (rejected: unnecessary complexity for current scale and would complicate summary/detail consistency).
  - No pagination (rejected: large date ranges would make the modal difficult to scan).

## Decision 4: Default admin booking displayMode to list only on initial load

- Decision: Change the initial admin booking `displayMode` state from `calendar` to `list` and keep all existing toggle and date-sharing behavior intact.
- Rationale: The request is about the default starting layout, not a redesign of admin booking navigation. Changing only the initial state is the smallest valid refinement.
- Alternatives considered:
  - Persist the last-used view in storage (rejected: not requested and changes behavior beyond the stated scope).
  - Remove calendar as a primary mode (rejected: conflicts with explicit requirement to keep view switching available).

## Decision 5: Modal layout must preserve responsive scanability

- Decision: Use a responsive paid-detail modal that renders a stacked card/list presentation on mobile and a denser row layout on tablet and desktop, with pagination controls reachable without horizontal scrolling.
- Rationale: Financial detail review must remain usable at the constitution’s three required breakpoints.
- Alternatives considered:
  - Fixed-width desktop-style modal table (rejected: poor mobile usability).
  - Full-screen page takeover for all devices (rejected: loses the report-page context the modal is intended to preserve).