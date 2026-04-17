# UI Contract: Mobile Booking Manage Sections

Feature: 015 - Mobile Booking Manage Sections

## 1. Surface

Component surface primarily affected:
- src/features/booking/BookingDetailsModal.tsx

Supporting integration surfaces:
- src/features/admin/AdminCalendarPage.tsx
- existing booking hooks and status metadata modules

## 2. Default Visibility Contract

On initial screen render:
- MUST show player name and identity context.
- MUST show status control.
- MUST show contact details when present.
- MUST keep primary action controls reachable.

## 3. Section Interaction Contract

For non-core panels:
- MUST support expand on tap.
- MUST support collapse on second tap.
- MUST preserve panel state during active editing session.
- MUST preserve already entered values across panel toggles.

## 4. Action Reachability Contract

- Primary action area MUST remain visible while content scrolls.
- Save action state:
  - disabled when no changes.
  - disabled when validation fails.
  - enabled when changed and valid.

## 5. Responsive Contract

Required behavior:
- mobile >= 375px: action controls reachable and no clipping.
- tablet >= 768px: panel layout remains readable.
- desktop >= 1280px: behavior remains functionally equivalent.

PWA behavior:
- orientation changes must not clear in-session edit values.
- repeated panel toggles should not degrade interaction responsiveness.

## 6. Failure Handling Contract

- If optional panel data fails to load, core summary and action area remain usable.
- Errors in one panel must not block visibility or operation of other panels.

## 7. Accessibility Contract

- Panel toggles are keyboard reachable.
- Expanded/collapsed state is programmatically conveyed.
- Contrast and focus visibility meet existing project accessibility baseline.
