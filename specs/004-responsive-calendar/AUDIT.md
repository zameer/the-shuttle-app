# Calendar Responsiveness Audit (T001-T002)

## Scope
- src/components/shared/calendar/CalendarContainer.tsx
- src/components/shared/calendar/MonthView.tsx
- src/components/shared/calendar/WeekView.tsx
- src/components/shared/calendar/CalendarSlot.tsx
- src/features/players/PublicCalendarPage.tsx

## Findings (Before Changes)
1. MonthView had a hard minimum width:
- Class `min-w-[700px]` forced horizontal scrolling on small screens.

2. WeekView had a hard minimum width:
- Class `min-w-[800px]` and fixed side rail widths reduced usable space on mobile.

3. Public page used fixed viewport assumptions:
- `h-[80vh]` and fixed loading skeleton `h-[600px]` could over/under-size content depending on device.

4. Calendar slot touch area was too small:
- `px-1.5 py-0.5` could produce taps smaller than recommended 44x44 touch target on mobile.

5. Navigation controls needed explicit mobile sizing:
- Arrow buttons lacked enforced 44x44 target size on mobile.

## Root-Cause Summary
The responsiveness issue was primarily caused by fixed min-width classes and small interaction targets rather than data or rendering logic.

## Refactor Strategy
- Remove hard min-width constraints from month/week layouts.
- Use mobile-first responsive widths and spacing (`w-full`, `sm:`, `md:`, `lg:`).
- Enforce minimum tap targets on interactive elements.
- Keep internal scrolling in calendar content area only.
- Keep typography >= 12px baseline on mobile (`text-xs` with responsive scaling).
