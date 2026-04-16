# Implementation Plan: Calendar Range and Payment Status

**Branch**: `005-calendar-range-payment-status` | **Date**: 2026-04-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-calendar-range-payment-status/spec.md`

## Summary

Add optional admin date-range filtering to the calendar while keeping an unfiltered multi-day default view, and surface payment status indicators (with fallback labels) across admin calendar views and booking details.

## Technical Context

**Language/Version**: TypeScript 6 + React 19 + Vite 8  
**Primary Dependencies**: React Query, date-fns, Tailwind CSS, Supabase client  
**Storage**: Supabase PostgreSQL (existing `bookings` and `players` data)  
**Testing**: `npm run lint` + manual UI smoke checks  
**Target Platform**: Web (desktop + mobile admin view)  
**Project Type**: Single-page frontend app  
**Performance Goals**: Keep filter/apply/clear interactions sub-second in normal local usage  
**Constraints**: No schema migration required for this feature; maintain current admin/public access rules  
**Scale/Scope**: Admin calendar workflows for date-range monitoring and payment visibility

## Constitution Check

- Feature remains in existing frontend architecture.
- No new backend service or database migration required.
- Scope is limited to admin calendar UX/query behavior and documentation validation.

## Project Structure

### Documentation (this feature)

```text
specs/005-calendar-range-payment-status/
|- plan.md
|- spec.md
|- tasks.md
|- quickstart.md
`- checklists/
   `- requirements.md
```

### Source Code (repository root)

```text
src/
|- components/shared/calendar/
|  |- CalendarContainer.tsx
|  |- DateRangeFilter.tsx
|  |- MonthView.tsx
|  |- WeekView.tsx
|  `- CalendarSlot.tsx
|- features/admin/
|  `- AdminCalendarPage.tsx
|- features/booking/
|  |- useBookings.ts
|  |- BookingDetailsModal.tsx
|  `- paymentStatus.ts
`- hooks/
   `- useDateRangeFilter.ts
```

**Structure Decision**: Keep single-project frontend structure and implement range filtering/payment normalization as small focused modules reused in admin calendar views.

## Implementation Notes

- Added `useDateRangeFilter` hook for date input validation and apply/clear state.
- Added `DateRangeFilter` component in admin calendar toolbar.
- Added shared payment status normalization/label utilities and reused across slot, week, and modal views.
- Updated booking queries to normalize range boundaries and payment status values.
- Added quickstart validation log and requirement traceability checklist updates.

## Risks and Follow-ups

- Repository-wide lint currently reports pre-existing violations in unrelated files (`ui/badge`, `ui/button`, `AdminSettingsPage`, `useAuth`, and legacy `any` usages). These are not introduced by this feature.
- If strict lint-as-gate is required, a cleanup pass should be planned as a separate task.