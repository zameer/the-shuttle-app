# Quickstart: UI Improvements Implementation Guide

**Date**: April 15, 2026  
**Feature**: [spec.md](./spec.md)  
**Status**: Ready for implementation

---

## Implementation Overview

This guide provides step-by-step implementation approach for each of the 6 user stories.

**Before Starting**: Review [research.md](./research.md) and [data-model.md](./data-model.md) for technical context.

---

## US1: Player Search by Name and Mobile Number

**Priority**: P1  
**Estimated Effort**: 2-3 hours  
**Component**: `src/features/booking/PlayerSelectCombobox.tsx`

### Requirements

- ✅ Search by player name (partial match, case-insensitive)
- ✅ Search by mobile number (exact or partial match)
- ✅ Display results with both name and phone number
- ✅ Return results within 500ms

### Implementation Steps

1. **Extend component props**:
   ```typescript
   interface PlayerSelectComboboxProps {
     value?: string;
     onChange: (value: string, player: PlayerSearchResult) => void;
     searchMode?: 'name' | 'mobile' | 'both'; // NEW
     disabled?: boolean;
   }
   ```

2. **Create usePlayerSearch hook**:
   - Accept searchTerm as input
   - Filter players array: `players.filter(p => name.includes(term) || phone.includes(term))`
   - Debounce with 300ms delay
   - Return filtered results with loading state

3. **Update search logic**:
   - Replace existing exact match with fuzzy/partial match
   - Support both name and mobile number in same input field
   - Show "No results" state when search returns empty

4. **Test cases**:
   - Search by partial name: "joh" → "John Smith"
   - Search by mobile: "98765" → "9876543210"
   - Search with no matches → show "No results"
   - Rapid searches → debounce to latest query only

### Code Example

```typescript
// In PlayerSelectCombobox.tsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedTerm = useDebounce(searchTerm, 300);

const filteredPlayers = useMemo(() => {
  if (!debouncedTerm) return players;
  
  return players.filter(p =>
    p.name.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
    p.phone_number.includes(debouncedTerm)
  );
}, [players, debouncedTerm]);
```

---

## US2: Sticky Calendar Headers

**Priority**: P1  
**Estimated Effort**: 1-2 hours  
**Components**: `src/components/shared/calendar/MonthView.tsx`, `WeekView.tsx`

### Requirements

- ✅ Calendar header (dates/times) remains visible when scrolling content
- ✅ Proper z-index management (header stays above content)
- ✅ Alignment maintained between header and content
- ✅ Works on mobile (375px+) and desktop

### Implementation Steps

1. **Add Tailwind sticky utilities to header**:
   ```jsx
   // In MonthView.tsx header row
   <thead className="sticky top-0 z-10 bg-white border-b">
     {/* Header cells */}
   </thead>
   ```

2. **Wrap content in scrollable container**:
   ```jsx
   <div className="overflow-y-auto max-h-[600px]">
     <table>
       <thead className="sticky top-0 z-10">...</thead>
       <tbody>...</tbody>
     </table>
   </div>
   ```

3. **Verify alignment**:
   - Test horizontal and vertical scrolling
   - Ensure header columns align with content rows
   - Check on mobile viewport (DevTools)

4. **Z-index management**:
   - Use `z-10` for header (sufficient for overlap)
   - Use `z-0` or no z-index for content
   - Adjust if overlays (modals) appear behind header

5. **Test cases**:
   - Scroll down → header stays visible
   - Scroll right → header and content scroll together
   - Mobile (375px) → header visible without crowding content
   - Content < viewport height → no scrolling, header looks normal

### Code Example

```tsx
// In WeekView.tsx
<div className="overflow-y-auto">
  <table className="w-full border-collapse">
    <thead className="sticky top-0 z-10 bg-white">
      <tr>
        <th className="p-2 border">Time</th>
        {/* Date columns */}
      </tr>
    </thead>
    <tbody>
      {/* Time slot rows */}
    </tbody>
  </table>
</div>
```

---

## US3: Payment Status in Admin Calendar

**Priority**: P2  
**Estimated Effort**: 1-2 hours  
**Components**: `src/components/shared/calendar/MonthView.tsx`, `src/features/booking/BookingDetailsModal.tsx`

### Requirements

- ✅ Display payment status (Paid/Pending/Unpaid) on calendar cells
- ✅ Admin-only visibility (public doesn't see payment status)
- ✅ Visual cues (color-coded badges)
- ✅ Status updates when payment changes

### Implementation Steps

1. **Import Badge component**:
   ```typescript
   import { Badge } from '@/components/ui/badge';
   ```

2. **Add payment status to booking display** (MonthView.tsx):
   ```jsx
   {isAdmin && booking.payment_status && (
     <Badge variant={mapPaymentStatusToVariant(booking.payment_status)}>
       {booking.payment_status}
     </Badge>
   )}
   ```

3. **Map payment status to Badge variant** (use helper from contracts/CalendarUI.ts):
   ```typescript
   const variant = {
     'PAID': 'default',      // green
     'PENDING': 'secondary', // yellow
     'UNPAID': 'destructive' // red
   }[booking.payment_status] || 'secondary';
   ```

4. **Update BookingDetailsModal** (show payment status):
   ```jsx
   {isAdmin && (
     <div>
       <Label>Payment Status</Label>
       <Badge variant={mapPaymentStatusToVariant(booking.payment_status)}>
         {booking.payment_status}
       </Badge>
     </div>
   )}
   ```

5. **Test cases**:
   - Admin sees payment status badges on calendar
   - Public user doesn't see payment status badges
   - Different colors for PAID (green), PENDING (yellow), UNPAID (red)
   - Status updates on calendar when payment changes

---

## US4: Mobile Form Button Visibility

**Priority**: P2  
**Estimated Effort**: 1.5-2 hours  
**Component**: `src/features/booking/BookingForm.tsx`

### Requirements

- ✅ Submit button accessible on mobile (375px+) without scrolling
- ✅ Works with virtual keyboard open
- ✅ Form validation still functional
- ✅ Desktop experience unchanged

### Implementation Steps

1. **Identify form structure**:
   - Review current BookingForm layout
   - Locate form fields and submit button

2. **Add padding to form**:
   ```jsx
   <form className="pb-20"> {/* Add bottom padding for button space */}
     {/* Form fields */}
   </form>
   ```

3. **Make submit button sticky or fixed** (choose one):

   **Option A: Sticky (recommended)**:
   ```jsx
   <button 
     className="sticky bottom-0 w-full py-3 bg-blue-600 text-white rounded"
     type="submit"
   >
     Book Now
   </button>
   ```

   **Option B: Fixed footer**:
   ```jsx
   <button 
     className="fixed bottom-0 left-0 right-0 w-full py-3 bg-blue-600 text-white"
     type="submit"
   >
     Book Now
   </button>
   ```

4. **Test on mobile**:
   - Open form on mobile viewport (DevTools)
   - Check at various screen sizes: 375px, 480px, 600px
   - With keyboard open (DevTools emulation)
   - Scroll form content → button remains accessible

5. **Maintain desktop experience**:
   - Button placement natural on large screens
   - No layout shift on desktop

---

## US5: Mobile Admin Menu Visibility

**Priority**: P1  
**Estimated Effort**: 2-3 hours  
**Component**: `src/layouts/AdminLayout.tsx`

### Requirements

- ✅ All admin menu items visible on mobile (375px+)
- ✅ Use responsive pattern (hamburger menu for small screens)
- ✅ Navigation works without horizontal scrolling
- ✅ All admin sections accessible (Calendar, Settings, Bookings, Dashboard)

### Implementation Steps

1. **Create responsive navigation structure**:
   ```jsx
   <nav className="bg-gray-100 p-4">
     {/* Hamburger button on mobile */}
     <button className="md:hidden">
       <Menu size={24} /> {/* lucide-react icon */}
     </button>
     
     {/* Full menu on desktop */}
     <div className="hidden md:flex gap-4">
       <NavLink href="/admin/calendar">Calendar</NavLink>
       <NavLink href="/admin/dashboard">Dashboard</NavLink>
       <NavLink href="/admin/settings">Settings</NavLink>
       {/* etc */}
     </div>
   </nav>
   ```

2. **Add mobile menu dropdown**:
   ```jsx
   const [isMenuOpen, setIsMenuOpen] = useState(false);
   
   <button 
     className="md:hidden"
     onClick={() => setIsMenuOpen(!isMenuOpen)}
   >
     <Menu size={24} />
   </button>
   
   {isMenuOpen && (
     <div className="md:hidden flex flex-col gap-2 p-4">
       <a href="/admin/calendar" className="py-2">Calendar</a>
       <a href="/admin/dashboard" className="py-2">Dashboard</a>
       {/* etc */}
     </div>
   )}
   ```

3. **Tailwind breakpoints**:
   - `hidden` + `md:flex` = hidden on mobile, visible on desktop (≥ 768px)
   - Use `md:` prefix for responsive display

4. **Test cases**:
   - Mobile (375px): Hamburger menu visible, menu items in dropdown
   - Tablet (600px): Check menu behavior at tablet size
   - Desktop (1024px+): Full horizontal menu visible
   - Menu toggling works on mobile

---

## US6: Time Adjustment Facility for Admin

**Priority**: P2  
**Estimated Effort**: 3-4 hours  
**Component**: `src/features/booking/BookingDetailsModal.tsx`

### Requirements

- ✅ Admin can increase or decrease booking duration
- ✅ System validates no time conflicts
- ✅ Clear error messages on conflict
- ✅ Update persists to database

### Implementation Steps

1. **Add time adjustment UI to modal**:
   ```jsx
   {isAdmin && (
     <div className="space-y-4 border-t pt-4">
       <Label>Adjust Booking Time</Label>
       <div className="flex gap-2">
         <Input 
           type="datetime-local"
           value={editedStartTime}
           onChange={(e) => setEditedStartTime(e.target.value)}
         />
         <Input 
           type="datetime-local"
           value={editedEndTime}
           onChange={(e) => setEditedEndTime(e.target.value)}
         />
       </div>
       <Button onClick={handleValidateTime}>Check Availability</Button>
     </div>
   )}
   ```

2. **Implement time validation**:
   ```typescript
   const validateTimeAdjustment = async (startTime: Date, endTime: Date) => {
     // Fetch all bookings for the date
     const existingBookings = await supabase
       .from('bookings')
       .select('*')
       .neq('id', booking.id) // Exclude current booking
       .gte('start_time', new Date(startTime.getTime() - 24*60*60*1000)) // 24h before
       .lte('end_time', new Date(endTime.getTime() + 24*60*60*1000)); // 24h after
     
     // Check for conflicts
     const hasConflict = existingBookings.data?.some(b => {
       // Use date-fns isOverlapping or manual check
       return isTimeConflict(startTime, endTime, b.start_time, b.end_time);
     });
     
     return { isValid: !hasConflict, conflicts: existingBookings.data || [] };
   };
   ```

3. **Implement time conflict detection** (use date-fns):
   ```typescript
   import { isBefore, isAfter, isWithinInterval } from 'date-fns';
   
   const isTimeConflict = (newStart: Date, newEnd: Date, existStart: string, existEnd: string): boolean => {
     const existingStart = new Date(existStart);
     const existingEnd = new Date(existEnd);
     
     return (
       (isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart))
     );
   };
   ```

4. **Save updated time**:
   ```typescript
   const handleSaveTimeAdjustment = async () => {
     // Validate first
     const { isValid, conflicts } = await validateTimeAdjustment(newStart, newEnd);
     
     if (!isValid) {
       setError(`Conflict with booking(s): ${conflicts.map(c => c.id).join(', ')}`);
       return;
     }
     
     // Update booking
     await supabase
       .from('bookings')
       .update({
         start_time: newStart.toISOString(),
         end_time: newEnd.toISOString(),
         updated_at: new Date().toISOString()
       })
       .eq('id', booking.id);
     
     // Refresh data
     onClose();
     onRefresh(); // Callback to refresh calendar
   };
   ```

5. **Test cases**:
   - Adjust duration: increase by 30 min → saves successfully
   - Adjust duration: decrease by 1 hour → saves successfully
   - Adjust conflicts: try to extend into another booking → error "Time conflict with booking ID: xxx"
   - Boundary cases: adjust to very early/late times → validates within operating hours
   - Mobile: time picker works on mobile (use `datetime-local` input)

---

## Implementation Sequence

**Recommended order** (by dependency and complexity):

1. **US2 (Sticky Headers)** - No dependencies; quick CSS change
2. **US1 (Player Search)** - No dependencies; small component change
3. **US3 (Payment Status)** - Depends on calendar rendering (can do with US2)
4. **US4 (Mobile Form Button)** - No dependencies; layout adjustment
5. **US5 (Mobile Menu)** - No dependencies; layout adjustment
6. **US6 (Time Adjustment)** - Highest complexity; last; enables full time management

---

## Common Utility Functions Needed

### Debounce Hook
```typescript
// In src/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export const useDebounce = (value: string, delayMs: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
};
```

### Time Conflict Checker
```typescript
// In src/lib/timeValidation.ts
import { isBefore, isAfter } from 'date-fns';

export const isTimeConflict = (
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date
): boolean => {
  return isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart);
};
```

---

## Testing Checklist

- [ ] US1: Name search works with partial text
- [ ] US1: Mobile number search works
- [ ] US1: Search debounces (no excessive queries)
- [ ] US2: Sticky header visible on scroll
- [ ] US2: Header columns align with content
- [ ] US3: Payment status visible to admin
- [ ] US3: Payment status NOT visible to public
- [ ] US3: Color-coded badges (green/yellow/red)
- [ ] US4: Submit button visible on mobile 375px
- [ ] US4: Submit button accessible with keyboard
- [ ] US5: Hamburger menu visible on mobile
- [ ] US5: Hamburger menu works (toggle)
- [ ] US5: Full menu visible on desktop
- [ ] US6: Time can be adjusted
- [ ] US6: Conflict detection shows error
- [ ] US6: Successful time adjustment saves to DB

---

## Status

🟢 **QUICKSTART COMPLETE**  
Ready for implementation Sprint.  
Estimated total effort: 11-16 hours.
