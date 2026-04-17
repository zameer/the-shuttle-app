# Quickstart: Mobile Booking Manage Sections

Feature: 015 - Mobile Booking Manage Sections  
Branch: 015-init-speckit-feature

## Goal

Refactor the booking manage screen into mobile-first sections so:
- player info, status, and contact details are visible immediately.
- secondary sections open on demand.
- primary actions remain reachable in PWA mobile usage.

## Planned File Touch Points

Primary:
- src/features/booking/BookingDetailsModal.tsx
- src/features/booking/bookingManageSections.ts
- src/features/booking/components/BookingManageSectionPanel.tsx

Supporting:
- src/features/admin/AdminCalendarPage.tsx
- src/features/booking/useBookings.ts
- src/features/booking/bookingStatusMeta.ts

## Implementation Outline

1. Define panel state model in BookingDetailsModal.
2. Render core summary as always visible block.
3. Convert secondary blocks into expand/collapse sections.
4. Keep save and critical actions in sticky action bar.
5. Preserve edits across section toggles and orientation changes.

## Manual Validation Steps

### US1: Primary actions reachable

1. Open admin booking details on mobile viewport 375x812.
2. Scroll through sections.
3. Confirm save/primary actions stay reachable without traversing all content.

### US2: Progressive section disclosure

1. Open booking details.
2. Verify default visible blocks: player, status, contact details.
3. Expand time or financial section and validate content appears.
4. Collapse section and confirm screen shortens.
5. Reopen section and confirm previously entered values remain.

### US3: PWA mobile reliability

1. Run in installed PWA mode.
2. Open booking details in portrait, edit fields, rotate to landscape.
3. Confirm edited values and section states remain in session.
4. Toggle sections repeatedly and confirm no interaction lag.

## Quality Gate

Run before marking implementation tasks complete:
- npm run lint

Feature-file lint validation command:
- npx eslint src/features/booking/BookingDetailsModal.tsx src/features/booking/components/BookingManageSectionPanel.tsx src/features/booking/bookingManageSections.ts

## Implementation Validation Notes (2026-04-17)

- Implemented progressive disclosure sections with a default-visible core summary block.
- Added sticky action area with safe-area padding and viewport-height resilient container sizing.
- Added session-persisted section state and edit values for orientation/session continuity.
- Added section-level error boundary fallback so core actions remain usable if a non-core section fails.
- Project-wide npm run lint still reports pre-existing unrelated issues in non-feature files.
- Feature-file scoped eslint run reports no issues for new/updated feature files.

## Recommended Approach Summary

- Use progressive disclosure via local state panels.
- Keep core summary always visible.
- Keep primary actions sticky.
- Lazy-render non-core panels for responsiveness.
- Reuse existing hooks for all data and mutations.
