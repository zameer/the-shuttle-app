# Contract: Admin Report Refinement Interface

Feature: 019
Scope: Refined admin financial reporting UI and admin booking default-view behavior

## 1. Access Contract

- Financial reporting remains available only inside the existing admin-protected route tree.
- Admin booking view default behavior remains within the existing admin-only booking interface.

## 2. Input Contract

Report request input remains:

- `startDate`: ISO date string, required
- `endDate`: ISO date string, required
- No player filter input is required or added

Input rules:

- `startDate <= endDate`
- Invalid date ranges must present controlled validation or error UI without crashing the report page

## 3. Reporting Output Contract

The refined report surface must expose:

- `summary`
  - `paidHours`
  - `paidAmount`
  - `pendingHours`
  - `pendingAmount`
- `paidBreakdown`
  - `entries[]` with player information
  - `totalEntries`
- `outstandingPending`
  - `players[]` with pending totals and slot details
  - `totalOutstandingAmount`
- `revenueLoss`
  - `noShow`
  - `cancelled`
  - `fallbackAmountCount`

The refined report surface must not render a standalone pending breakdown section.

## 4. Paid Detail Modal Contract

- Paid detail is opened by an explicit user action from the main report page.
- The paid detail appears in a modal, not as an always-visible inline section.
- Modal content supports pagination over paid entries.
- Pagination updates the visible paid-entry subset without triggering a second report query.
- If there are zero paid entries, the modal entry point or modal body must communicate an explicit empty state.

## 5. Reconciliation Contract

- Sum of all paid breakdown entries across all modal pages equals `summary.paidAmount`.
- Sum of all paid breakdown entry hours across all modal pages equals `summary.paidHours`.
- Removing the pending breakdown section must not change `summary.pendingAmount` or `summary.pendingHours` calculations.

## 6. Outstanding Pending Contract

- Outstanding pending by player remains visible on the main report page.
- Each outstanding record includes player-identifying information and slot-level detail for follow-up.
- If no pending balances exist, the section renders an explicit empty or zero state.

## 7. Responsive UI Contract

- Mobile (>=375): report cards remain stacked; paid modal uses a vertically readable list/card layout with reachable pagination controls.
- Tablet (>=768): paid modal may increase row density while keeping actions and page indicators visible without clipping.
- Desktop (>=1280): paid modal supports denser row/table presentation and summary context remains preserved beneath the overlay.

## 8. Admin Booking Default-View Contract

- Opening the admin booking page from a fresh navigation session shows list view first.
- Calendar view remains reachable through the existing toggle.
- Switching between list and calendar modes preserves the currently selected date context.

## 9. Non-Goals

- No new database schema or reporting tables.
- No new pending-detail modal.
- No persistent per-user view-preference storage.
- No change to existing admin authorization model.