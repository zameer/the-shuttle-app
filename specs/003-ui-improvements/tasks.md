# Tasks: UI Improvements and Search Enhancements

**Feature**: 003-ui-improvements  
**Branch**: `003-ui-improvements`  
**Date Generated**: April 15, 2026  
**Total Tasks**: 30  
**Estimated Effort**: 24-32 hours  
**Status**: Ready for implementation  

---

## Overview

This document breaks down Feature 003 (6 user stories, 14 functional requirements) into **30 actionable tasks** organized across **10 implementation phases**:

- **Phase 1 (Setup)**: Feature initialization and documentation
- **Phase 2 (Foundational)**: Prerequisites and dependency verification
- **Phase 3 (US1)**: Player Search by Name and Mobile Number (P1)
- **Phase 4 (US2)**: Sticky Calendar Headers (P1)
- **Phase 5 (US5)**: Mobile Admin Menu Visibility (P1)
- **Phase 6 (US3)**: Payment Status in Admin Calendar (P2)
- **Phase 7 (US4)**: Mobile Form Button Visibility (P2)
- **Phase 8 (US6)**: Time Adjustment Facility (P2)
- **Phase 9 (Testing & Validation)**: Integration and cross-story testing
- **Phase 10 (Polish)**: Documentation and final review

### Task Format

Each task follows: `- [ ] [TaskID] [P] [StoryLabel] Description with file paths`

- `[TaskID]`: Sequential identifier (T001, T002, etc.)
- `[P]`: Parallelizable task marker (can run independently)
- `[StoryLabel]`: User story reference ([US1], [US2], etc.)
- **File paths**: Exact location of implementation

### Dependency Graph

```
Phase 1: Setup (T001-T002)
   ↓
Phase 2: Foundational (T003-T004)
   ↓
┌─ Phase 3: US1 (T005-T008)     ─┐
├─ Phase 4: US2 (T009-T011) [P]─┤
├─ Phase 5: US5 (T012-T014) [P]─┼─ Phase 9: Testing (T026-T029)
├─ Phase 6: US3 (T015-T017) [P]─┤      ↓
├─ Phase 7: US4 (T018-T020) [P]─┤  Phase 10: Polish (T030)
└─ Phase 8: US6 (T021-T025) [P]─┘
```

**Parallelization Opportunities**:
- **Batch 1 (Sequential)**: T001-T004 (Setup & prerequisites)
- **Batch 2 (Parallel)**: T005-T025 (All feature phases run independently after T004)
  - Developer 1: US1 (T005-T008)
  - Developer 2: US2 (T009-T011)
  - Developer 3: US5 (T012-T014)
  - Developer 4: US3 (T015-T017)
- **Batch 3 (Sequential after Batch 2)**: T026-T030 (Testing & polish)

**Estimated Timeline with Parallelization**:
- Sequential only: 24-32 hours
- With 2-developer parallelization (Batch 2 split): 16-20 hours
- With 4-developer parallelization: 12-16 hours

---

## Phase 1: Setup (2 tasks)

### Setup & Documentation

- [x] T001 Create implementation checklist and documentation structure for Feature 003 tasks
- [x] T002 Verify spec.md, plan.md, data-model.md, research.md, and contracts/ directory completeness

---

## Phase 2: Foundational (2 tasks)

### Prerequisites & Dependencies

- [x] T003 [P] Verify React 19.2, Tailwind CSS 3.4, shadcn/ui, React Query 5.99 are installed in package.json
- [x] T004 [P] Verify existing UI components in src/components/ui/ (Button, Badge, Combobox, Dialog) are functional

---

## Phase 3: User Story 1 - Player Search by Name and Mobile Number (4 tasks)

### Story Goal
Enable admins to search for players by both name and mobile number in the booking form, replacing the existing mobile-number-only search.

**Story Components**: `src/features/booking/PlayerSelectCombobox.tsx`, `src/hooks/usePlayerSearch.ts` (new)

**Independent Test Criteria**:
- Player search returns results for both name and mobile number inputs
- Results display with clear labeling (name + phone)
- Search responds within 500ms with debouncing
- No results state handled gracefully
- Admin booking form still integrates correctly

**Success Criteria (from spec.md)**: SC-001, SC-002

---

- [X] T005 [P] [US1] Create `src/hooks/usePlayerSearch.ts` hook with client-side filtering for name OR mobile search with 300ms debounce  
  - Implement PlayerSearchQuery interface from contracts/PlayerSearch.ts
  - Support searchMode: 'name' | 'mobile' | 'both'
  - Return filtered results array with loading state
  - File: `src/hooks/usePlayerSearch.ts` (NEW)

- [X] T006 [P] [US1] Extend PlayerSelectCombobox.tsx component props to support dual-field search and update search logic
  - Update component to use new usePlayerSearch hook
  - Accept searchMode prop (default: 'both')
  - Remove old mobile-number-only filter logic
  - Render results with name AND phone_number displayed
  - File: `src/features/booking/PlayerSelectCombobox.tsx`

- [X] T007 [P] [US1] Update BookingForm.tsx to pass searchMode='both' prop to PlayerSelectCombobox
  - Ensure player selection updates form state correctly
  - Verify form still submits with correct player_phone_number
  - File: `src/features/booking/BookingForm.tsx`

- [X] T008 [P] [US1] Test player search functionality in admin booking form
  - Verify search by name returns matching players
  - Verify search by mobile returns matching players
  - Verify partial matches work for both fields
  - Test case sensitivity handling
  - Verify no results state displays correctly
  - Test response time (<500ms with debounce)

---

## Phase 4: User Story 2 - Sticky Calendar Headers (3 tasks)

### Story Goal
Keep calendar headers (dates/time labels) visible during scrolling to maintain context of which time slot each row represents.

**Story Components**: `src/components/shared/calendar/MonthView.tsx`, `src/components/shared/calendar/WeekView.tsx`

**Independent Test Criteria**:
- Calendar header remains fixed at viewport top during vertical scrolling
- Header and content maintain proper alignment during scroll
- Sticky positioning works correctly on mobile and desktop
- No layout shift or misalignment issues
- Header properly styled (background color, border)

**Success Criteria (from spec.md)**: SC-003

---

- [X] T009 [P] [US2] Add sticky positioning to MonthView.tsx calendar header
  - Add `sticky top-0 z-10` Tailwind classes to header container
  - Ensure proper background color (white or contrasting) to prevent content bleed-through
  - Add border-bottom for header separation
  - Verify z-index doesn't conflict with other UI elements
  - File: `src/components/shared/calendar/MonthView.tsx`

- [X] T010 [P] [US2] Add sticky positioning to WeekView.tsx calendar header
  - Add `sticky top-0 z-10` Tailwind classes to header container
  - Match styling from MonthView for consistency
  - Verify horizontal alignment with content during scroll
  - File: `src/components/shared/calendar/WeekView.tsx`

- [X] T011 [P] [US2] Test sticky header functionality across view sizes and devices
  - Test vertical scrolling on desktop (1920x1080, 1366x768)
  - Test vertical scrolling on tablet (768x1024)
  - Test vertical scrolling on mobile (375x667, 414x896)
  - Verify no visual glitches or misalignment
  - Test with long calendar content (full month view)
  - Verify header is readable with proper contrast

---

## Phase 5: User Story 5 - Mobile Admin Menu Visibility (3 tasks)

### Story Goal
Make admin navigation menu accessible on small screens (mobile devices 375px+) by implementing responsive menu patterns.

**Story Components**: `src/layouts/AdminLayout.tsx`

**Independent Test Criteria**:
- Admin menu visible and accessible on mobile screens
- Menu uses responsive pattern (hamburger menu or responsive layout)
- All menu items navigable without requiring horizontal scroll
- Menu items properly sized (≥44px touch targets on mobile)
- Navigation works correctly across different screen sizes

**Success Criteria (from spec.md)**: SC-007

---

- [x] T012 [P] [US5] Refactor AdminLayout.tsx to implement responsive mobile menu
  - Add hamburger menu toggle for screens <md breakpoint (≤768px)
  - Create mobile menu state (useState for menu open/close)
  - Implement hamburger icon button using lucide-react
  - Ensure all admin menu items are accessible in mobile layout
  - File: `src/layouts/AdminLayout.tsx`

- [x] T013 [P] [US5] Implement responsive navigation using Tailwind CSS breakpoints
  - Use `hidden md:flex` for desktop menu on screens ≥768px
  - Use `md:hidden` for mobile hamburger button
  - Add `fixed` or `absolute` positioning for mobile menu overlay
  - Style menu items as full-width buttons on mobile (≥44px height)
  - File: `src/layouts/AdminLayout.tsx`

- [x] T014 [P] [US5] Test responsive admin menu on multiple screen sizes
  - Test menu visibility on desktop (1920x1080)
  - Test hamburger menu on tablet (768x1024)
  - Test hamburger menu on mobile (375x667, 414x896, 360x640)
  - Verify all menu items from AdminCalendarPage, AdminSettingsPage, AdminDashboardPage are accessible
  - Test menu toggle animation/transitions
  - Verify no overlapping content

---

## Phase 6: User Story 3 - Payment Status in Admin Calendar (3 tasks)

### Story Goal
Display payment status indicators on the admin calendar view to enable quick identification of paid/pending/unpaid bookings without clicking into details.

**Story Components**: `src/components/shared/calendar/MonthView.tsx`, `src/features/admin/AdminCalendarPage.tsx`

**Independent Test Criteria**:
- Payment status badge visible on admin calendar bookings
- Badge displays correct status (Paid=green, Pending=yellow, Unpaid=red)
- Badge not visible to public users
- Status updates reflect in calendar when payment state changes
- Admin can quickly scan calendar to identify unpaid bookings

**Success Criteria (from spec.md)**: SC-004

---

- [x] T015 [P] [US3] Extend MonthView.tsx to display payment_status badge on bookings
  - Add conditional Badge component rendering for admin users
  - Map payment_status values to Badge variants: PAID→default, PENDING→secondary, UNPAID→destructive
  - Include payment status in booking cell display alongside date/time
  - Use Contract: CalendarUI.ts PaymentStatusBadgeVariant mapping
  - File: `src/components/shared/calendar/MonthView.tsx`

- [x] T016 [P] [US3] Verify payment status badge visibility is admin-only
  - Add `isAdmin` prop check before rendering badge component
  - Confirm public users do NOT see payment status information
  - Verify RLS policies enforce admin-only visibility at database level
  - Test with both admin and public user roles
  - File: `src/components/shared/calendar/MonthView.tsx`, `src/features/auth/useAuth.ts`

- [x] T017 [P] [US3] Test payment status display in admin calendar across payment states
  - Create test bookings with PAID, PENDING, UNPAID payment_status values
  - Verify badges display correct colors and labels
  - Test payment status update (change from PENDING to PAID) reflects in calendar
  - Verify no payment status visible when signed in as public user
  - Test on desktop and mobile viewports

---

## Phase 7: User Story 4 - Mobile Form Button Visibility (3 tasks)

### Story Goal
Ensure the booking form submit button is visible and accessible on mobile devices without requiring downward scrolling or keyboard dismissal.

**Story Components**: `src/features/booking/BookingForm.tsx`

**Independent Test Criteria**:
- Submit button visible in mobile viewport when form is displayed
- Submit button accessible without requiring scroll on common mobile screen sizes
- Button remains clickable with keyboard visible/dismissed
- Form validation still works on mobile
- Submit still processes correctly on mobile

**Success Criteria (from spec.md)**: SC-005, SC-006

---

- [x] T018 [P] [US4] Refactor BookingForm.tsx to implement sticky footer button on mobile
  - Restructure form layout with form fields in scrollable container
  - Add sticky footer positioning for submitter button using Tailwind `sticky bottom-0`
  - Ensure button is always visible and clickable on mobile
  - Maintain button visibility on desktop as well
  - Use responsive spacing (p-2 md:p-4)
  - File: `src/features/booking/BookingForm.tsx`

- [x] T019 [P] [US4] Apply responsive button sizing and spacing for mobile accessibility
  - Ensure button height ≥44px on mobile for touch target accessibility
  - Add responsive padding around button
  - Verify submit button text/icon is readable on small screens
  - Test button doesn't get obscured by mobile keyboard
  - File: `src/features/booking/BookingForm.tsx`

- [x] T020 [P] [US4] Test mobile form submission on multiple devices
  - Test on iPhone 12 (390x844)
  - Test on Samsung Galaxy S21 (360x800)
  - Test on iPad/tablet (768x1024)
  - Verify submit button visible throughout form filling
  - Test with virtual keyboard open/closed
  - Verify form still validates and submits correctly
  - Test on portrait and landscape orientations

---

## Phase 8: User Story 6 - Time Adjustment Facility (5 tasks)

### Story Goal
Provide admin with ability to adjust booking times/durations directly from the admin interface, with validation to prevent scheduling conflicts.

**Story Components**: `src/features/admin/BookingDetailsModal.tsx`, `src/hooks/useTimeAdjustment.ts` (new)

**Independent Test Criteria**:
- Admin can open booking details and access time adjustment interface
- Time adjustment UI displays current start_time and end_time clearly
- Admin can modify times with date-time picker
- System validates new time doesn't conflict with other bookings
- Conflict detection prevents save with clear error message
- Successful time adjustment updates calendar immediately
- Only admins can adjust times (not public players)

**Success Criteria (from spec.md)**: SC-008, SC-009

---

- [x] T021 [P] [US6] Create `src/hooks/useTimeAdjustment.ts` hook with conflict validation logic
  - Implement TimeAdjustmentRequest interface from contracts/BookingTime.ts
  - Create function to validate new times against existing bookings
  - Use date-fns for time arithmetic and comparison (addMinutes, isBefore, etc.)
  - Return TimeValidationResult with conflict detection
  - Include ConflictingBooking details in validation response
  - File: `src/hooks/useTimeAdjustment.ts` (NEW)

- [x] T022 [P] [US6] Extend BookingDetailsModal.tsx with time adjustment UI
  - Add conditional UI section for time adjustment (admin-only)
  - Create date-time input fields for start_time and end_time
  - Use Tailwind responsive layout for clarity
  - Display current times clearly
  - Add "Calculate Duration" display (end_time - start_time in minutes)
  - Include visual feedback for duration validation (min 30 mins, max 480 mins)
  - File: `src/features/admin/BookingDetailsModal.tsx`

- [x] T023 [P] [US6] Implement real-time conflict validation in time adjustment form
  - On time input change, call useTimeAdjustment hook
  - Display conflict warning if new time overlaps existing bookings
  - Show conflicting booking details (player name, current time range)
  - Disable submit button if conflict detected
  - Display clear error message with conflict reason
  - File: `src/features/admin/BookingDetailsModal.tsx`

- [x] T024 [P] [US6] Add time adjustment submission and update logic
  - Create mutation using React Query to update booking times
  - Call Supabase: UPDATE bookings SET start_time, end_time WHERE id=booking_id
  - Validate no conflicts before submitting to database
  - Show success notification after update
  - Refresh calendar/booking list after successful update
  - File: `src/features/admin/BookingDetailsModal.tsx`, `src/services/supabase.ts`

- [x] T025 [P] [US6] Test time adjustment functionality with conflict scenarios
  - Test valid time adjustment (no conflicts)
  - Test adjusting start_time earlier (expanding booking)
  - Test adjusting end_time later (expanding booking)
  - Test reducing duration (shortening booking)
  - Test conflict detection (overlapping with existing booking)
  - Test multiple consecutive conflicts
  - Test minimum duration constraint (30 mins)
  - Test maximum duration constraint (480 mins)
  - Verify calendar updates immediately after change
  - Verify only admins can adjust times

---

## Phase 9: Testing & Validation (4 tasks)

### Cross-Story Integration & Quality Assurance

- [x] T026 [P] Integration test: Verify all 6 user stories work together in admin workflow
  - Create booking with name/mobile search (US1) → verify sticky headers visible (US2) → check menu navigation (US5) → view payment status (US3)
  - Test on desktop and mobile viewports
  - Verify no component conflicts or styling issues
  - File: Reference all modified files

- [x] T027 [P] Mobile device testing across all viewports (375px-1920px)
  - Test all 6 features on: iPhone (375px), Android (360px), Tablet (768px), Laptop (1366px), Desktop (1920px)
  - Verify responsive layouts work correctly at each breakpoint
  - Check touch-friendly sizing (≥44px targets)
  - Verify form submission and navigation on mobile
  - File: All components

- [x] T028 [P] Performance testing for search functionality
  - Verify player search responds within 500ms with 1000+ player database
  - Verify no lag on form submission with new components
  - Check for memory leaks in usePlayerSearch hook with rapid search changes
  - Profile component rendering with React DevTools
  - File: `src/hooks/usePlayerSearch.ts`, `src/features/booking/PlayerSelectCombobox.tsx`

- [x] T029 [P] Browser compatibility testing
  - Test on: Chrome (latest), Safari (latest), Firefox (latest), Edge (latest)
  - Verify sticky positioning works across browsers
  - Test form inputs and date-time pickers on all browsers
  - Verify mobile menu works on all browser versions
  - File: All components

---

## Phase 10: Polish & Documentation (1 task)

### Final Review and Documentation

- [x] T030 Update README.md and feature documentation with UI Improvements summary
  - Document all 6 user stories in feature overview
  - Add player search usage examples
  - Document mobile responsiveness support (375px+)
  - Include time adjustment facility admin guide
  - Add testing checklist for QA
  - File: `README.md`, `docs/FEATURES.md` (if exists), `specs/003-ui-improvements/IMPLEMENTATION_COMPLETE.md` (NEW)

---

## Implementation Notes

### Components Modified

| Component | Story | Changes |
|-----------|-------|---------|
| `PlayerSelectCombobox.tsx` | US1 | Dual name+mobile search with debounce |
| `MonthView.tsx` | US2, US3 | Sticky header + payment status badge |
| `WeekView.tsx` | US2 | Sticky header positioning |
| `BookingForm.tsx` | US4 | Sticky footer button for mobile |
| `AdminLayout.tsx` | US5 | Responsive hamburger menu |
| `BookingDetailsModal.tsx` | US6 | Time adjustment UI + validation |

### New Files

| File | Story | Purpose |
|------|-------|---------|
| `src/hooks/usePlayerSearch.ts` | US1 | Search hook with debounce |
| `src/hooks/useTimeAdjustment.ts` | US6 | Time validation and conflict detection |

### Key Dependencies

- React Query 5.99: For async player search and time adjustment mutations
- date-fns 4.1: For time arithmetic (addMinutes, isBefore, formatters)
- Tailwind CSS 3.4: For responsive utilities (sticky, md:, lg: breakpoints)
- shadcn/ui: Button, Badge, Dialog, Combobox components
- lucide-react 1.8: Hamburger menu icon

### Database Queries (No schema changes required)

- **US1**: SELECT from `players` table (filter on client-side by name or phone_number)
- **US2-US3**: Calendar grid queries unchanged; filter existing booking data
- **US4**: BookingForm submission unchanged; form handling only
- **US5**: Navigation unchanged; layout only
- **US6**: UPDATE `bookings` table SET start_time, end_time (after validation); READ bookings for conflict detection

### Success Metrics

After implementation, the feature will deliver:

✅ **Player Search**: 95% of admins successfully find players using name or mobile (SC-002)  
✅ **Sticky Headers**: Calendar header always visible during scroll (SC-003)  
✅ **Payment Status**: Admin can identify unpaid bookings at a glance (SC-004)  
✅ **Mobile Form**: 100% form submission success on mobile without scrolling (SC-005)  
✅ **Admin Menu**: 100% menu item accessibility on 375px+ screens (SC-007)  
✅ **Time Adjustment**: 95% admin booking adjustment completion with conflict prevention (SC-008, SC-009)

---

## Execution Strategy

### Recommended Sequence

**Sprint 1 (Day 1-2)**: Setup + P1 Stories (16-20 hours)
- T001-T004: Setup and prerequisites (1-2 hours)
- T005-T008: US1 Player Search (4-5 hours)
- T009-T011: US2 Sticky Headers (2-3 hours)
- T012-T014: US5 Mobile Menu (3-4 hours)

**Sprint 2 (Day 3)**: P2 Stories + Testing (8-12 hours)
- T015-T017: US3 Payment Status (2-3 hours)
- T018-T020: US4 Mobile Form Button (2-3 hours)
- T021-T025: US6 Time Adjustment (4-5 hours)
- T026-T030: Testing & Polish (2-3 hours)

**Parallel Approach** (Recommended for teams with 2+ developers):
- Developer 1: T001-T008 (Setup + US1)
- Developer 2: T009-T011 (US2)
- Developer 1 (continued): T012-T014 (US5)
- Developer 2 (continued): T015-T017 (US3)
- Developer 1 (continued): T018-T020 (US4)
- Developer 2 (continued): T021-T025 (US6)
- Both: T026-T030 (Testing & Polish)

**Estimated Timeline with 2 developers**: 12-16 hours total (2-3 days)

---

## Task Validation Checklist

- [x] All 6 user stories represented
- [x] Each story has independent test criteria
- [x] Tasks mapped to specific files with exact paths
- [x] Contract types referenced where applicable
- [x] Parallelization opportunities identified
- [x] Success criteria linked to spec.md requirements
- [x] Setup and foundational phases precede story phases
- [x] Testing and polish phases follow implementation
- [x] Task IDs sequential (T001-T030)
- [x] Format validation (checkboxes, IDs, labels, paths)
- [x] Effort estimates provided per phase
- [x] No duplicate or redundant tasks

---

## Next Steps

1. **Review & Approve**: Stakeholder review of tasks and prioritization
2. **Assign Tasks**: Map tasks to developers (parallelization recommended)
3. **Execute**: Follow execution strategy above
4. **Track Progress**: Use this checklist as real-time progress tracker
5. **Validate**: Run T026-T029 quality checks before marking complete
6. **Deploy**: Merge branch `003-ui-improvements` after T030 completion

---

*Last updated: April 15, 2026 | Next review: Upon task completion*
