# Research: UI Improvements and Search Enhancements

**Date**: April 15, 2026  
**Feature**: [spec.md](./spec.md)  
**Status**: All clarifications resolved; research complete

---

## Resolved Clarifications

### Q1: Tech Stack Consistency for New User Stories

**Status**: ✅ RESOLVED  
**Answer**: All 6 user stories (including new US5 & US6) use the established tech stack from 002-admin-booking-details:
- React 19.2 + TypeScript 6.0
- Tailwind CSS 3.4 + shadcn/ui
- React Query 5.99 + date-fns 4.1
- Supabase backend

**Recommendation**: Proceed with implementation using existing components and hooks.

---

## Research Findings by Topic

### 1. Sticky Positioning in Tailwind CSS

**Question**: How to implement sticky table headers that remain visible during scroll?

**Finding**: 
- ✅ Tailwind 3.4 provides `sticky` utility class
- Combine with `top-0` to fix position at viewport top
- Z-index management required: use `z-10` or `z-20` for header to stay above content
- Parent container must have `overflow-y: auto` or similar

**Implementation Pattern**:
```tsx
<div className="overflow-y-auto max-h-[600px]">
  <thead className="sticky top-0 z-10 bg-white">
    {/* Header cells */}
  </thead>
  <tbody>
    {/* Content rows scroll underneath */}
  </tbody>
</div>
```

**References**:
- Tailwind CSS: `sticky`, `top-0`, `z-{index}` utilities
- Existing: `MonthView.tsx`, `WeekView.tsx`

**Status**: ✅ Ready for implementation

---

### 2. React Query Dual-Field Search

**Question**: How to implement efficient search by name OR mobile number using React Query?

**Finding**:
- ✅ Existing `useBookings()` hook returns booking objects with `player_phone_number` reference
- ✅ Existing `usePlayers()` hook (if available) can be extended for dual-field search
- ✅ Alternative: Extend `PlayerSelectCombobox.tsx` to accept custom filter function
- Client-side filtering recommended for search (mobile number and name both available locally)
- Server-side filtering via Supabase can implement via full-text search if needed

**Implementation Approach**:
1. Extend `PlayerSelectCombobox.tsx` props to accept `searchMode: 'name' | 'mobile' | 'both'`
2. Filter players array by matching `name.includes(searchTerm)` OR `phone_number.includes(searchTerm)`
3. Debounce search input (existing pattern in form components)

**Example**:
```typescript
const filteredPlayers = players.filter(p => 
  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  p.phone_number.includes(searchTerm)
);
```

**Status**: ✅ Ready for implementation

---

### 3. Payment Status Badge Styling

**Question**: How to display payment status (Paid/Pending/Unpaid) using shadcn/ui Badge component?

**Finding**:
- ✅ `Badge` component available in `src/components/ui/badge.tsx`
- Supports variants: `default`, `secondary`, `destructive`, `outline`
- Recommended variant mapping:
  - `PAID`: `default` (green/success)
  - `PENDING`: `secondary` (yellow/warning)
  - `UNPAID`: `destructive` (red/error)

**Implementation Pattern**:
```tsx
const paymentVariant = {
  'PAID': 'default',
  'PENDING': 'secondary',
  'UNPAID': 'destructive'
}[booking.payment_status];

<Badge variant={paymentVariant}>{booking.payment_status}</Badge>
```

**Status**: ✅ Ready for implementation

---

### 4. Mobile Form Button Accessibility

**Question**: How to ensure form submit button remains accessible on mobile devices with long forms?

**Finding**:
- ✅ Common patterns: Fixed footer button or sticky bottom bar
- Fixed position: `position: fixed bottom-0 left-0 right-0` (Tailwind: `fixed bottom-0 inset-x-0`)
- Sticky position: `sticky bottom-0` (less intrusive, scrolls with form content until reaches bottom)
- Add padding to form container to prevent button overlap: `pb-20` (or adjust based on button height)

**Recommended Pattern**: Sticky footer for forms
```tsx
<form className="pb-20">
  {/* Form fields */}
  <button className="sticky bottom-0 w-full" type="submit">
    Book Now
  </button>
</form>
```

**Status**: ✅ Ready for implementation

---

### 5. Admin Menu Responsive Patterns

**Question**: How to make admin navigation menu accessible on small mobile screens (375px)?

**Finding**:
- ✅ Tailwind responsive breakpoints: `sm` (640px), `md` (768px), `lg` (1024px)
- Below `md` (< 768px), use hamburger menu (common pattern)
- Above `md`, display full horizontal menu
- Use `hidden` and `md:flex` utilities

**Recommended Pattern**: Hamburger menu on mobile
```tsx
<nav>
  {/* Hamburger icon on mobile */}
  <button className="md:hidden">☰</button>
  
  {/* Full menu on desktop */}
  <div className="hidden md:flex gap-4">
    <a href="/admin/calendar">Calendar</a>
    <a href="/admin/settings">Settings</a>
    {/* etc */}
  </div>
</nav>
```

**Resources**:
- shadcn/ui has Menu/Dropdown components available
- lucide-react provides `Menu` icon (lucide-react 1.8)

**Status**: ✅ Ready for implementation

---

### 6. Date-fns Time Arithmetic & Conflict Detection

**Question**: How to validate time adjustments and detect booking conflicts using date-fns?

**Finding**:
- ✅ date-fns 4.1 provides utilities:
  - `addMinutes(date, minutes)` - Extend a booking by N minutes
  - `subMinutes(date, minutes)` - Reduce duration
  - `isBefore(dateA, dateB)` - Check time ordering
  - `isAfter(dateA, dateB)` - Check time ordering
  - `isWithinInterval({ start, end }, interval)` - Detect overlap

**Conflict Detection Algorithm**:
```typescript
function hasTimeConflict(startTime: Date, endTime: Date, existingBookings: Booking[]): boolean {
  return existingBookings.some(booking => {
    const bookingStart = new Date(booking.start_time);
    const bookingEnd = new Date(booking.end_time);
    
    // Check overlap: New interval intersects existing
    return isWithinInterval(startTime, { start: bookingStart, end: bookingEnd }) ||
           isWithinInterval(endTime, { start: bookingStart, end: bookingEnd }) ||
           (isBefore(startTime, bookingStart) && isAfter(endTime, bookingEnd));
  });
}
```

**Status**: ✅ Ready for implementation

---

## Dependency & Integration Analysis

### No New Dependencies Required

✅ All research topics covered by existing project dependencies:
- React 19.2 + TypeScript 6.0 (core framework)
- Tailwind CSS 3.4 (styling + responsive utilities)
- shadcn/ui (UI components)
- React Query 5.99 (data fetching + hooks)
- date-fns 4.1 (date manipulation)
- lucide-react 1.8 (icons)

### Supabase RLS Compatibility

✅ Existing RLS policies support all features:
- Admin read/write: Player names, mobile numbers, booking times, payment status
- Public read: Booking status only (no player data)
- No policy changes required

---

## Implementation Prerequisites

Before starting implementation:

1. ✅ Verify existing `PlayerSelectCombobox.tsx` structure (file location, props)
2. ✅ Verify existing `useBookings()` return shape (includes payment_status field)
3. ✅ Verify `MonthView.tsx` and `WeekView.tsx` header structure (wrapper element)
4. ✅ Verify `AdminLayout.tsx` navigation structure (menu items and layout)
5. ✅ Confirm Tailwind CSS version 3.4+ (includes sticky utility)

---

## Status

🟢 **ALL RESEARCH COMPLETE**  
No NEEDS CLARIFICATION markers remain in specification.  
Ready to proceed with data-model.md, contracts, and quickstart.md generation (Phase 1 complete).
