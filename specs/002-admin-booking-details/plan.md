# Implementation Plan: Enhanced Calendar Status & Admin Booking Details

**Feature**: Enhanced Calendar Status & Admin Booking Details  
**Feature Branch**: `002-admin-booking-details`  
**Specification**: [spec.md](./spec.md)  
**Created**: April 15, 2026  
**Status**: Planning Phase Complete

---

## 1. Technical Context

### Project Architecture Overview
- **Frontend Framework**: React 19.2 + Vite 8.0 + TypeScript 6.0
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
  - Available UI components: `Button`, `Dialog`, `Badge` (from `src/components/ui/`)
  - Layout system: Flexbox + Tailwind grid responsive utilities
- **State Management**: React Query (@tanstack/react-query 5.99)
- **Authentication**: Supabase Auth with custom `isAdmin` flag via `admin_users` table
- **Date/Time**: date-fns 4.1 for formatting and manipulation
- **Backend Database**: Supabase PostgreSQL with RLS policies
- **Icons**: lucide-react 1.8

### Existing Components
#### Calendar Components
- **`MonthView.tsx`** (`src/components/shared/calendar/MonthView.tsx`)
  - Renders month grid with date-based booking display
  - Props: `currentDate`, `onDateClick`, `bookings`, `onSlotClick`, `readOnly`
  - Current implementation shows bookings with status badges (colored by status: CONFIRMED/PENDING/UNAVAILABLE)
  - Already supports `readOnly` prop (prevents click handlers when true)
  - Status coloring: Green=CONFIRMED, Yellow=PENDING, Gray=UNAVAILABLE

- **`WeekView.tsx`** (`src/components/shared/calendar/WeekView.tsx`)
  - Renders week grid with hourly time slots
  - Props: `currentDate`, `onTimeSlotClick`, `bookings`, `readOnly`
  - Integrates `useCourtSettings()` and `useRecurringBlocks()` hooks
  - Already supports `readOnly` prop for public calendar
  - Booking rendering currently shows status badges at fixed positions

#### Booking Management Components
- **`BookingDetailsModal.tsx`** (`src/features/booking/BookingDetailsModal.tsx`)
  - Props: `booking`, `isOpen`, `onClose`, `onUpdateStatus`
  - Current fields displayed:
    - Player phone number (from `booking.player_phone_number`)
    - Booking status badge (CONFIRMED/PENDING/UNAVAILABLE)
    - Time, Date
    - Financials (hourly rate, total price, payment status)
    - Action buttons (Confirm, Cancel, Delete based on status)
  - No player lookup currently (uses phone number only)
  - **REQUIRES**: Enhancement to fetch and display player details

- **`BookingForm.tsx`** (`src/features/booking/BookingForm.tsx`)
  - Used for creating new bookings
  - Not directly relevant to this feature but may need reading to understand booking structure

#### Auth & Role Management
- **`useAuth.tsx`** (`src/features/auth/useAuth.tsx`)
  - Custom hook providing `useAuth()` context
  - Returns: `{ session, user, isAdmin, isLoading, signOut }`
  - `isAdmin` is boolean | null (null during loading)
  - Checks email in `admin_users` table to determine role
  - **Status**: Complete and ready for use

#### Layout Components
- **`AdminLayout.tsx`** (`src/layouts/AdminLayout.tsx`)
  - Wrapper for admin pages (AdminCalendarPage, AdminDashboardPage, AdminSettingsPage)
  - Likely includes admin-specific navigation/headers

- **`PublicLayout.tsx`** (`src/layouts/PublicLayout.tsx`)
  - Wrapper for public pages (PublicCalendarPage, PublicTermsPage)
  - Expected to be minimal/guest-friendly

### Data Layer

#### Database Schema (Relevant Tables)
- **bookings**
  - `id` (UUID)
  - `player_phone_number` (FK to players.phone_number)
  - `start_time`, `end_time` (TIMESTAMPTZ)
  - `status` (PENDING | CONFIRMED | UNAVAILABLE | **AVAILABLE** [appears to be unused])
  - `hourly_rate`, `total_price`
  - `payment_status` (PENDING | PAID)
  - `created_at`, `updated_at`
  - **RLS**: Admin can read/write; public can read only bookings filtered by view rules

- **players**
  - `phone_number` (PK, VARCHAR 20)
  - `name` (TEXT)
  - `address` (TEXT, added in migration 20260414000000)
  - `created_at`
  - **RLS**: Public read access limited (may not expose address to unauthenticated users)

- **admin_users** (for role checking)
  - `email` (PK)
  - `created_at`

#### React Query Hooks
- **`useBookings(startDate, endDate)`** (`src/features/booking/useBookings.ts`)
  - Fetches bookings within date range
  - Returns `Booking[]` with fields: `id`, `player_phone_number`, `start_time`, `end_time`, `status`, `hourly_rate`, `total_price`, `payment_status`
  - **LIMITATION**: Does NOT fetch player details (name, address) — only phone number reference
  - **REQUIRES**: Enhancement to optionally fetch player data or create new hook for player lookup

- **`useUpdateBookingStatus()`**
  - Mutation for updating booking status/payment status

- **`useDeleteBooking()`**
  - Mutation for hard-deleting bookings

- **`useCourtSettings()`** (new as of Phase 11)
  - Fetches single-row court configuration

- **`useRecurringBlocks()`** (new as of Phase 11)
  - Fetches recurring unavailable blocks

### Utility Functions & Constants
- **`cn()`** (`src/lib/utils.ts`)
  - Classname utility (likely `clsx` wrapper for conditional Tailwind classes)

- **Color Palette** (inferred from existing components):
  - Status colors: Green (CONFIRMED), Yellow (PENDING), Gray (UNAVAILABLE)
  - Primary: Blue-600
  - Neutral: Gray scale (50-900)

### External Libraries
- **shadcn/ui** components available:
  - Button, Dialog, Badge (and possibly more in `src/components/ui/`)
  - Standard props: className, disabled, onClick, variant, size, etc.

### RLS Policy Enforcement
- Bookings table:
  - Admin users (checked via auth metadata or admin_users table): SELECT/INSERT/UPDATE/DELETE all rows
  - Public/Unauthenticated: SELECT only, potentially filtered results
- Players table:
  - Admin: Full access to all player info (name, address, phone)
  - Public: **Should NOT** access sensitive fields (address, phone)
  - **DECISION**: Data filtering must occur at RLS layer or query layer (hooks)

### Existing Routes/Pages
- **`/admin/calendar`** (AdminCalendarPage) - Admin calendar view
- **`/admin/dashboard`** (AdminDashboardPage) - Admin metrics
- **`/admin/settings`** (AdminSettingsPage) - Court hours, rates, blocks
- **`/`** (PublicCalendarPage) - Public calendar view
- **`/terms`** (PublicTermsPage) - Terms and conditions

---

## 2. Phase 0: Research & Clarifications

### ✅ Clarifications Resolved (from Specification)

| Unknown | Resolution | Evidence |
|---------|------------|----------|
| Status display format | **Background color + text label** decided | Spec F1 requirement |
| Address visibility | Full address shown to admin in modal | Spec F2, F5 |
| Public player data exposure | None — status only visible to public | Spec F4, F5 |
| Calendar component capability | Both MonthView and WeekView support `readOnly` prop | Code review of components |
| Auth context availability | `useAuth()` hook exists with `isAdmin` flag | Code review of useAuth.tsx |
| Player address field | Already exists in database (`players.address`) | Migration 20260414000000 |
| API data fetching | useBookings hook available; player data NOT currently fetched | Code review of useBookings.ts |

### No Additional Research Required
- All technical unknowns resolved via code inspection
- Technology stack and architecture confirmed
- Existing implementations validate feasibility

---

## 3. Phase 1: Design Artifacts

### 3.1 Data Model & Contracts

#### Enhanced Booking Data Model
```typescript
// Current Booking interface (existing)
interface Booking {
  id: string
  player_phone_number: string | null
  start_time: string
  end_time: string
  status: BookingStatus // 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'
  hourly_rate: number | null
  total_price: number | null
  payment_status: PaymentStatus | null // 'PENDING' | 'PAID'
}

// NEW: Player data interface (to be fetched separately or joined)
interface PlayerDetails {
  phone_number: string
  name: string | null
  address: string | null
}

// NEW: Enhanced booking with player context (for admin view)
interface BookingWithPlayer extends Booking {
  player?: PlayerDetails
}
```

#### Status Display Contract

```typescript
// Status-to-UI mapping constants
const STATUS_CONFIG = {
  OPEN: {
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    badgeColor: 'bg-green-100',
    displayText: 'Open'
  },
  RESERVED: {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    badgeColor: 'bg-blue-100',
    displayText: 'Reserved'
  },
  UNAVAILABLE: {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    borderColor: 'border-gray-200',
    badgeColor: 'bg-gray-100',
    displayText: 'Unavailable'
  },
} as const
```

**Mapping Rule**: Booking status → Display status
- `CONFIRMED` → "Reserved" (blue)
- `PENDING` → "Reserved" (blue)
- `UNAVAILABLE` → "Unavailable" (gray)
- (No booking on slot) → "Open" (green)

#### Calendar Slot Component Contract

```typescript
interface CalendarSlotProps {
  status: 'OPEN' | 'RESERVED' | 'UNAVAILABLE'  // Computed from booking data
  displayText: string                            // "Open", "Reserved", etc.
  time?: string                                  // HH:mm format for time slots
  onClick?: () => void                          // Handler (null if readOnly)
  readOnly?: boolean                            // Disable interaction
  isAdmin?: boolean                             // Show full badge for admin
}
```

### 3.2 Component Structure & Modifications

#### New Components To Create

1. **`StatusBadge.tsx`** - Reusable status display component
   - File: `src/components/shared/StatusBadge.tsx`
   - Props: `status`, `displayText`, `size` (optional)
   - Renders: Colored badge with status text
   - Used by: MonthView, WeekView

2. **`CalendarSlot.tsx`** - Grid cell for calendar booking display
   - File: `src/components/shared/calendar/CalendarSlot.tsx`
   - Props: `booking`, `status`, `isAdmin`, `readOnly`, `onSlotClick`
   - Renders: Status indicator with text, handles click logic
   - Used by: MonthView, WeekView (refactored)

#### Existing Components To Modify

1. **`BookingDetailsModal.tsx` (ENHANCEMENT)**
   - Add player lookup logic (fetch player details by phone)
   - New fields: Player name, phone, address
   - Conditional rendering: Admin sees all details; public sees nothing (no modal shown)
   - Add loading state (if fetching player data)
   - Add error handling (if player lookup fails)

2. **`MonthView.tsx` (REFACTOR)**
   - Use new `CalendarSlot` component for consistent rendering
   - Ensure `readOnly` prop prevents click handlers on all bookings
   - Apply `STATUS_CONFIG` for color consistency
   - Display status text label on booking badges

3. **`WeekView.tsx` (REFACTOR)**
   - Use new `CalendarSlot` component for consistent rendering
   - Ensure `readOnly` prop prevents click handlers on all slots
   - Apply `STATUS_CONFIG` for color consistency

#### Existing Pages To Modify

1. **`AdminCalendarPage.tsx`** (`src/features/admin/AdminCalendarPage.tsx`)
   - May already render calendar with admin features
   - Ensure BookingDetailsModal integration calls enhanced version
   - No readOnly mode (admin has full access)

2. **`PublicCalendarPage.tsx`** (`src/features/players/PublicCalendarPage.tsx`)
   - Pass `readOnly={true}` to calendar components
   - Prevent modal display (use `isAdmin` check before showing modal)
   - Status indicators still visible to all

### 3.3 API/Hook Enhancements

#### New React Query Hook: `usePlayerDetails`
- File: `src/features/booking/useBookings.ts` (add to existing file)
- Purpose: Fetch player details by phone number
- Returns: `PlayerDetails | null`
- Used by: `BookingDetailsModal`
- RLS consideration: Must be admin-only query (RLS policy enforces read access)

#### Enhanced Hook: `useBookings` (Optional Future)
- Current implementation: Returns only booking fields
- Future enhancement: Add `includePlayerData?: boolean` option
- Trade-off: May increase payload; consider if many bookings+players needed

### 3.4 Database RLS Policy Review (Validation Only)

**Current RLS Assumption** (no changes needed unless verified as insufficient):
- Bookings table:
  - Admin: `SELECT * FROM bookings WHERE auth.uid() IN (SELECT user_id FROM admin_users WHERE email = auth.jwt()->>'email')`
  - Public: `SELECT * FROM bookings WHERE player_phone_number = auth.jwt()->>'phone'` OR public read limited to availability
- Players table:
  - Admin: Full access to name, address, phone
  - Public: **Currently may expose address via API** — need to verify RLS policy

**Action**: Confirm RLS policy for players table prevents public access to address/phone (or filter in React hook)

### 3.5 Responsive Design Considerations

#### Mobile (375px - 640px)
- Status text must remain visible on compact badge (reduce font size if needed)
- MonthView: Min-height 80px per cell OK; adjust if cramped
- WeekView: May need horizontal scroll; ensure time labels sticky
- Modal: Full-width dialog with padding on mobile

#### Desktop (1024px+)
- Status badges display comfortably
- Modal centered, max-width 500px
- MultiColumn layout OK

#### Tailwind Utilities to Use
- `text-xs`, `text-sm`, `px-2`, `py-1` for compact badges
- `md:px-4`, `md:py-2` for desktop expansion
- `max-w-md` for modal responsive sizing

---

## 4. Phase 2: Implementation Tasks (Ordered)

### Phase 2.1: Data Layer & Hooks (Foundation)

#### Task T001: Enhance useBookings Hook with Player Data
- **File**: `src/features/booking/useBookings.ts`
- **Scope**:
  - Add new `usePlayerDetails(phoneNumber: string)` hook
  - Query: `SELECT name, address FROM players WHERE phone_number = ?`
  - Handle: Admin-only access (RLS enforced)
  - Error handling: Return null if not found or access denied
  - Caching: Use React Query's queryKey `['player', phoneNumber]`
- **Dependencies**: None (uses existing Supabase client)
- **Testing**: Manually test with admin credentials, verify data fetched

#### Task T002: Verify RLS Policies for Players Address Field
- **File**: `supabase/migrations/` (review only, no modification unless needed)
- **Scope**:
  - Review current RLS policy for `players` table
  - Confirm: Admin can read address; public cannot
  - If gap found: Create migration to add RLS policy
  - If OK: Document policy assumption in code comment
- **Dependencies**: None
- **Testing**: Query players table as admin (expect address); as public (expect error or null)

---

### Phase 2.2: Shared Components (UI Building Blocks)

#### Task T003: Create StatusBadge Component
- **File**: `src/components/shared/StatusBadge.tsx`
- **Scope**:
  - Accept props: `status` (OPEN|RESERVED|UNAVAILABLE), optional `size` (sm|md|lg)
  - Implement: Use `STATUS_CONFIG` constant to apply colors
  - Render: Badge with status text (e.g., "Open", "Reserved")
  - Export: Default component
  - TypeScript: Full type safety for status enum
- **Dependencies**: Tailwind CSS, `cn` utility
- **Testing**: Storybook or manual component test with all statuses

#### Task T004: Create CalendarSlot Component
- **File**: `src/components/shared/calendar/CalendarSlot.tsx`
- **Scope**:
  - Accept props: `booking?: Booking`, `status` (OPEN|RESERVED|UNAVAILABLE), `isAdmin`, `readOnly`, `onSlotClick`, `timeDisplay?`
  - Implement:
    - Render status background + text label
    - Show time if provided (month view: start time; week view: row time)
    - Click handler: Calls `onSlotClick(booking)` if not `readOnly` and admin
    - Accessibility: Proper button role if clickable
  - Export: Default component
- **Dependencies**: StatusBadge component, cn utility
- **Testing**: Test with all status values, readOnly=true/false, admin=true/false

---

### Phase 2.3: Calendar Component Refactoring

#### Task T005: Refactor MonthView to Use CalendarSlot
- **File**: `src/components/shared/calendar/MonthView.tsx`
- **Scope**:
  - Import new `CalendarSlot` component
  - Refactor booking rendering: Replace inline badge spans with `<CalendarSlot />`
  - Ensure `readOnly` prop is passed through to CalendarSlot
  - Update status mapping logic to compute "OPEN"|"RESERVED"|"UNAVAILABLE" from booking status
  - Verify: All existing functionality preserved (styling, click handlers, filtering)
  - Style consistency: Apply `STATUS_CONFIG` colors
- **Dependencies**: CalendarSlot component (T004)
- **Testing**: Visual regression test on month view with various bookings and status values

#### Task T006: Refactor WeekView to Use Status Display
- **File**: `src/components/shared/calendar/WeekView.tsx`
- **Scope**:
  - Review current booking rendering (appears to be overlaid on time slots)
  - Ensure status text is clearly visible (may be partial text currently, e.g., "PENDING")
  - Apply `STATUS_CONFIG` for color consistency
  - Update booking click handler: Only call `onTimeSlotClick` if not `readOnly`
  - Test: Ensure recurring blocks and court hours integration still works
- **Dependencies**: STATUS_CONFIG constants (may extract to shared file)
- **Testing**: Visual regression with various bookings, verify responsive behavior

---

### Phase 2.4: Booking Details Modal Enhancement

#### Task T007: Add Player Data Lookup to BookingDetailsModal
- **File**: `src/features/booking/BookingDetailsModal.tsx`
- **Scope**:
  - Import `usePlayerDetails` hook (from T001)
  - On mount/when `booking.player_phone_number` changes: Trigger player data fetch
  - State: Add loading, error states for player lookup
  - Render:
    - Player name (if available, else "—")
    - Phone number (already shown)
    - Address (if available and admin, else "—" or hidden)
  - Only show modal if `isAdmin` is true (prevent non-admin access)
  - Error UI: Show error message if player lookup fails
- **Dependencies**: usePlayerDetails hook (T001), useAuth hook (existing)
- **Testing**: Manually test with admin account, verify player data displays

#### Task T008: Add Admin-Only Access Control to BookingDetailsModal
- **File**: `src/features/booking/BookingDetailsModal.tsx`
- **Scope**:
  - wrap modal display in: `if (!isAdmin) return null`
  - Alternatively: Return empty on non-admin (depends on where modal is called)
  - Ensure public/non-admin users cannot trigger or see modal
  - Review: How modal is opened (from calendar click handler)
- **Dependencies**: useAuth hook (existing)
- **Testing**: Test with non-admin account; verify modal does not show

---

### Phase 2.5: Page-Level Integration

#### Task T009: Update AdminCalendarPage to Use Enhanced Modal
- **File**: `src/features/admin/AdminCalendarPage.tsx`
- **Scope**:
  - Review current calendar integration (imports, props, modal trigger)
  - Ensure calendar passes `isAdmin={true}` to viewing components
  - Ensure `readOnly={false}` (admin can interact)
  - Ensure click handler opens enhanced BookingDetailsModal
  - Verify: All existing admin features (confirm, cancel, delete) still work
- **Dependencies**: Enhanced BookingDetailsModal (T007, T008)
- **Testing**: Admin workflow: Load admin calendar, click booking, verify modal shows player details

#### Task T010: Update PublicCalendarPage to Use Read-Only Mode
- **File**: `src/features/players/PublicCalendarPage.tsx`
- **Scope**:
  - Import calendar component (MonthView or WeekView, or both)
  - Pass props: `readOnly={true}`, `isAdmin={false}`
  - Ensure no modal opens on slot click (calendar prevents interaction)
  - Verify: Status indicators are visible to public users
  - Test: Mobile and desktop responsive layout
- **Dependencies**: Refactored calendar components (T005, T006)
- **Testing**: Public workflow: Load public calendar, verify read-only, see status but no modal

---

### Phase 2.6: Responsive Design & Polish

#### Task T011: Audit Responsive Design (Mobile - 375px)
- **File**: All modified components (CalendarSlot, MonthView, WeekView, BookingDetailsModal)
- **Scope**:
  - Test on 375px width (mobile):
    - Status text readability on badges
    - Modal layout (full width, centered)
    - Calendar grid not cramped
  - Adjust Tailwind classes if needed (e.g., `text-xs` for small badges)
  - Verify: No overflow, all interactive elements reachable
- **Dependencies**: All refactored components
- **Testing**: BrowserStack or Chrome DevTools mobile view

#### Task T012: Audit Responsive Design (Desktop - 1920px)
- **File**: All modified components
- **Scope**:
  - Test on 1920px width (desktop):
    - Modal not too wide (max-width 500-600px recommended)
    - Calendar grid utilizes space efficiently
    - Status text clear and prominent
  - Adjust Tailwind classes if needed (e.g., `md:text-sm` for desktop expansion)
- **Dependencies**: All refactored components
- **Testing**: Manual testing on large monitors or Chrome DevTools

#### Task T013: Visual Polish & Style Consistency
- **File**: All modified components + `tailwind.config.js` (if new colors needed)
- **Scope**:
  - Review color palette: Ensure status colors match design system
  - Check typography: Consistent font sizes, weights
  - Icons: Verify lucide-react icons match status (if used)
  - Spacing: Consistent padding/margin across components
  - Hover states: Ensure interactive elements have hover feedback (except read-only)
  - Dark mode: Verify Tailwind dark mode classes if applicable
- **Dependencies**: All refactored components
- **Testing**: Manual visual inspection, cross-browser testing (Chrome, Safari, Firefox)

---

### Phase 2.7: Testing & Validation

#### Task T014: Functional Testing - Admin Workflow
- **File**: Manual/automated tests (optional: create test file `src/features/admin/__tests__/AdminCalendarPage.test.tsx`)
- **Scope**:
  - Scenario A: Admin loads calendar, sees booking with status
  - Scenario B: Admin clicks booking, modal opens, shows player details (name, phone, address)
  - Scenario C: Admin can still confirm/cancel/delete (existing features)
  - Scenario D: Calendar loads within 2 seconds with 50+ bookings
  - Acceptance: All actions succeed, no errors
- **Dependencies**: Enhanced AdminCalendarPage (T009)
- **Testing**: Manual QA or Playwright/Cypress automated tests

#### Task T015: Functional Testing - Public Workflow
- **File**: Manual/automated tests (optional: create test file `src/features/players/__tests__/PublicCalendarPage.test.tsx`)
- **Scope**:
  - Scenario A: Public user loads calendar, sees booking status (Open/Reserved/Unavailable)
  - Scenario B: Public user clicks booking, NO modal opens (readOnly enforced)
  - Scenario C: Public user sees NO player details (phone, address, admin info)
  - Scenario D: Calendar is fully responsive (mobile 375px, desktop 1920px)
  - Acceptance: All scenarios pass, no access to admin data
- **Dependencies**: Enhanced PublicCalendarPage (T010)
- **Testing**: Manual QA on public route

#### Task T016: Privacy & Security Validation
- **File**: RLS policies (supabase/migrations/ - review only)
- **Scope**:
  - Verify: Unauthenticated users cannot fetch player address via API (RLS enforced)
  - Verify: Non-admin users cannot see booking details modal
  - Verify: Player phone/address only visible in admin modal (not in public page)
  - Attempted exploit: Try to call player API as public user → Should fail with RLS error
- **Dependencies**: RLS policies (existing), usePlayerDetails hook (T001)
- **Testing**: Supabase console direct query test, Postman API tests as public user

#### Task T017: Accessibility Testing
- **File**: All modified components
- **Scope**:
  - Keyboard navigation: Tab through calendar slots, modal buttons
  - Screen reader: Verify status text read aloud (e.g., "Reserved slot, 2:00 PM to 3:00 PM")
  - Color contrast: Ensure status badges meet WCAG AA standard
  - Focus states: Visible focus ring on interactive elements
- **Dependencies**: All refactored components
- **Testing**: Lighthouse audit, manual keyboard navigation, screen reader (NVDA/JAWS)

---

### Phase 2.8: Documentation & Deployment

#### Task T018: Update Component Documentation
- **File**: Inline JSDoc comments + optional README
- **Scope**:
  - Add JSDoc to new components: `StatusBadge`, `CalendarSlot`
  - Document: Parameters, return types, usage examples
  - Add: Prop type definitions clearly visible
  - Update: Existing component docs (MonthView, WeekView, BookingDetailsModal)
- **Dependencies**: All new/modified components
- **Testing**: Verify IDE shows docstrings on hover

#### Task T019: Update API/Hook Documentation
- **File**: Inline JSDoc + comments in `useBookings.ts`
- **Scope**:
  - Document new `usePlayerDetails` hook: Purpose, params, return, RLS note
  - Add: Examples of usage
  - Add: Notes on error handling and null checks
- **Dependencies**: usePlayerDetails hook (T001)
- **Testing**: Verify docstring clarity

#### Task T020: Test Against Success Criteria
- **File**: Manual verification checklist
- **Scope**:
  - **Accessibility**: Users identify slot status within 1 second ✓
  - **Admin Efficiency**: Admin can read player details in <3 seconds ✓
  - **Privacy Compliance**: Unauthenticated users see 0 player details ✓
  - **Responsive Design**: Status indicators clear on 375px-1920px ✓
  - **Role-Based Access**: Admin has full access; non-admin cannot click ✓
  - **Performance**: Calendar loads <2 seconds with 50+ bookings ✓
- **Dependencies**: All tasks above
- **Testing**: Live/staging environment verification

#### Task T021: Deploy to Production
- **File**: branch merge + deployment pipeline (if CI/CD exists)
- **Scope**:
  - Final code review: All changes meet standards
  - Final testing: All user stories pass acceptance tests
  - Merge: Feature branch to main/release branch
  - Deploy: To production environment
  - Monitor: Error logs, user feedback
- **Dependencies**: All tasks above
- **Testing**: Smoke test post-deployment

---

## 5. Summary

### Feature Overview
- **P1 Stories**: Always-Visible Status (US1), Admin Booking Details (US2)
- **P2 Story**: Public Read-Only Calendar (US3)

### Key Changes
1. **New Components**: `StatusBadge`, `CalendarSlot` (reusable, consistent)
2. **Enhanced Components**: `MonthView`, `WeekView` (refactored for status display), `BookingDetailsModal` (player data + admin-only access)
3. **New Hooks**: `usePlayerDetails` (admin player lookup)
4. **Enhanced Pages**: `AdminCalendarPage` (uses enhanced modal), `PublicCalendarPage` (read-only mode)

### Acceptance Criteria
- ✅ Status (Open/Reserved/Unavailable) visible on all calendar views
- ✅ Admin can click reserved booking → see player name, phone, address in modal
- ✅ Public users cannot click to interact; see status only
- ✅ All layouts responsive (375px-1920px)
- ✅ Admin efficiency: <3 seconds to read player details
- ✅ Privacy: Public users see 0 player data
- ✅ Performance: <2 seconds load with 50+ bookings

### Risk Mitigation
| Risk | Mitigation |
|------|-----------|
| Performance impact with large booking sets | Implement React Query caching, lazy load player data on demand |
| RLS policy gaps allow data leakage | Validate policies before deployment (T002) |
| Mobile layout broken | Responsive design audits (T011, T012) |
| Regression in existing admin/public features | Functional testing walkthroughs (T014, T015) |
| Accessibility compliance missed | Formal accessibility testing (T017) |

### Timeline Estimate
- **Phase 2.1-2.5**: 3-4 days (core implementation)
- **Phase 2.6-2.7**: 1-2 days (polish + testing)
- **Phase 2.8**: 0.5 days (documentation + deployment)
- **Total**: ~5 days of focused development

---

## Appendix: Decision Log

| Decision | Rationale | Alternative Considered |
|----------|-----------|----------------------|
| Status display: Background color + text label | Spec requirement F1; improves visibility over color alone | Icon-only, badges without text |
| Fetch player data on modal open (not preload all) | Reduces initial query payload; admin may not view all bookings | Preload all player data with bookings query |
| Use existing `useAuth().isAdmin` for access control | Already implemented, no new queries needed | Custom RLS policy check |
| Create reusable `StatusBadge` component | Consistency across MonthView and WeekView | Inline status rendering in each component |
| Status values: map `CONFIRMED/PENDING` → "Reserved" | Spec requirement (display distinction); simplifies UI contract | Show actual status values (PENDING vs CONFIRMED) |

---

**Document Version**: 1.0  
**Last Updated**: April 15, 2026  
**Next Review**: Upon task completion or as clarifications emerge
