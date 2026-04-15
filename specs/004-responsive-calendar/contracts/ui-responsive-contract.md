# Contract: UI Responsive Behavior

## Scope
Defines observable UI contract for responsive calendar behavior in public/admin calendar views.

## Inputs
- View mode: `week | month`
- Viewport width (CSS px)
- Booking data array (existing contract)

## Expected Outputs/Behavior
1. Layout adaptation
- Calendar container adapts across breakpoints without fixed desktop-only width constraints.
- Mobile widths can use internal horizontal scrolling where necessary to preserve readability.

2. Scrolling contract
- Primary page should not rely on full-page scrolling for dense calendar navigation.
- Calendar body provides internal scrolling behavior.

3. Sticky header contract
- In week and month views, date header row remains visible while scrolling calendar content vertically.

4. Touch usability contract
- Mobile tap targets in interactive controls are at least 44px on primary controls.

## Non-Goals
- No API response/schema changes.
- No changes to booking business rules.

## Compatibility
- Must remain backward-compatible with existing booking data hooks and read-only public rendering.
