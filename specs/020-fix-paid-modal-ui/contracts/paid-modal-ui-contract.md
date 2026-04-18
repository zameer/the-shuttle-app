# Contract: Paid Modal UI Behavior

Feature: 020
Scope: Paid-details modal UX and report section ordering

## 1. Access Contract

- Paid modal is only reachable from the existing admin financial report route.
- Existing admin authorization boundaries remain unchanged.

## 2. Modal Open Contract

- Triggering paid details opens a modal anchored within the current report context.
- On open, the first visible paid entry must not be clipped at the top edge.
- For empty datasets, a clear empty-state message is shown without clipping.

## 3. Modal Close Contract

- Modal renders a visible close icon button.
- Close icon dismisses modal in one interaction.
- Existing close behaviors (escape/backdrop) may remain but do not replace the icon requirement.

## 4. Pagination Visibility Contract

- Pagination controls are fully visible and actionable in modal layout.
- Page indicator is visible in one-page and multi-page states.
- Boundary disabled states are represented clearly and do not break layout.

## 5. Scroll and Layout Contract

- Header and pagination control area remain visually stable while content region scrolls.
- Entry rows do not render beneath hidden or overlapping chrome.
- Layout remains usable at mobile (>=375), tablet (>=768), and desktop (>=1280) breakpoints.

## 6. Report Ordering Contract

- Report sections render in this effective sequence for 020:
  - Summary
  - Outstanding pending section
  - Revenue impact section
  - Paid breakdown section (last)

## 7. Non-Goals

- No changes to report aggregation algorithms or reconciliation math.
- No new backend pagination endpoints.
- No database schema changes.