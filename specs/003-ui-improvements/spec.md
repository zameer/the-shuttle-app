# Feature Specification: UI Improvements and Search Enhancements

**Feature Branch**: `003-ui-improvements`  
**Created**: April 15, 2026  
**Status**: Draft  
**Input**: User description: "01. Player entry and search should support name as well 02. when scrolling calendar headers should not move 03. Admin calendar show payment status as well 04. Entry form, mobile button not visible down + Additional: 05. Mobile admin menu items not showing when screen size small 06. Provide admin with a facility to increase or decrease the time"

## Clarifications

### Session 2026-04-15

- **Q**: Why do new user stories (US5 & US6) not include tech stack planning aligned with previous features?
  **A**: All user stories in this feature leverage the **established tech stack** from 002-admin-booking-details for consistency. Implementation approach documented in "Tech Stack Alignment" section below requirements. All stories use React 19.2 + Tailwind CSS 3.4 + shadcn/ui + React Query 5.99 + Supabase, building on existing components and hooks.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player Search by Name and Mobile Number (Priority: P1)

Admin users create bookings and need to quickly locate players in the system. Currently, the player selection supports searching by mobile number only. This story extends the search capability to also support player name, allowing admins to find players using either their name or mobile number—whichever is more readily available or convenient.

**Why this priority**: P1 - Core functionality that directly improves admin booking creation workflow. Admins may not always have mobile numbers readily available but often know player names, making dual search critical for efficiency.

**Independent Test**: Can be fully tested by opening the admin booking form, accessing the player select/search component, and verifying both name and mobile number searches work independently. Delivers specific value: ability to find players using two different search criteria without memorizing specific information.

**Acceptance Scenarios**:

1. **Given** the admin is creating a booking, **When** they access the player search field and enter a player name (partial or full), **Then** matching player results appear in the dropdown
2. **Given** the admin is creating a booking, **When** they enter a mobile number, **Then** the matching player(s) with that number are displayed
3. **Given** the player search has results from name search, **When** the admin selects a result, **Then** the booking form is populated with the correct player details
4. **Given** a search (name or mobile) returns no results, **When** the search completes, **Then** a "no results" message is shown

---

### User Story 2 - Sticky Calendar Headers (Priority: P1)

Users scroll through the calendar view to see more booking slots. When scrolling vertically, the calendar header (showing dates/time slots) moves out of view, making it unclear which time slot each row represents.

**Why this priority**: P1 - Directly improves usability across all user types (players and admins). Significantly enhances the calendar UX by maintaining context while scrolling.

**Independent Test**: Can be fully tested by opening the calendar view and scrolling vertically. The header should remain visible and functional while content scrolls underneath.

**Acceptance Scenarios**:

1. **Given** the calendar view is displayed, **When** a user scrolls down through booking slots, **Then** the calendar header remains fixed at the top of the viewport
2. **Given** the header is fixed, **When** a user scrolls horizontally, **Then** both header and content scroll together maintaining alignment
3. **Given** the user is on a mobile device, **When** they scroll the calendar, **Then** the header remains visible without affecting touch interactions

---

### User Story 3 - Payment Status in Admin Calendar (Priority: P2)

Admin users review booking details in the calendar to manage court usage and revenue. Currently, payment status is not visible in the calendar view, requiring admins to click into booking details to see payment information.

**Why this priority**: P2 - Valuable for admin workflow but not critical for public users. Improves efficiency of admin dashboard/calendar review by surfacing payment status information.

**Independent Test**: Can be fully tested by viewing the admin calendar and verifying payment status indicators are displayed on booking slots. Delivers value by reducing clicks needed to assess payment status.

**Acceptance Scenarios**:

1. **Given** the admin calendar view is displayed, **When** viewing booking slots, **Then** payment status indicators are visible (e.g., "Paid", "Pending", "Unpaid")
2. **Given** multiple bookings are visible, **When** the admin scans the calendar, **Then** they can quickly identify unpaid or pending bookings by visual cues
3. **Given** a booking's payment status changes, **When** the calendar view updates, **Then** the payment status indicator reflects the current state

---

### User Story 4 - Mobile Form Button Visibility (Priority: P2)

Users on mobile devices fill out the booking entry form. The submit button becomes hidden below the mobile viewport when the form is long or keyboard is open, making it impossible to complete the booking.

**Why this priority**: P2 - Important for mobile users attempting to complete bookings, but can be worked around (scrolling/dismissing keyboard). Improves mobile user experience significantly.

**Independent Test**: Can be fully tested on mobile devices (or mobile viewport) by opening the entry form and verifying the submit button remains accessible without requiring additional scrolling.

**Acceptance Scenarios**:

1. **Given** the booking entry form is open on a mobile device, **When** the form is filled out completely, **Then** the submit button is visible without requiring downward scrolling
2. **Given** the mobile keyboard is open on a small screen, **When** the user completes form entry, **Then** the submit button is accessible (scrollable or fixed position)
3. **Given** the form has multiple fields, **When** the user navigates to the last field, **Then** the submit button becomes visible and clickable

---

### User Story 5 - Mobile Admin Menu Visibility (Priority: P1)

Admin users access the application on mobile devices to manage bookings and settings. When the screen size is small, the admin navigation menu becomes hidden or inaccessible, preventing admins from navigating between different admin sections (calendar, settings, bookings, etc.).

**Why this priority**: P1 - Critical blocker for admin usability on mobile. Without accessible navigation, admins cannot use the admin features on smaller screens, limiting the app's functionality.

**Independent Test**: Can be fully tested on mobile devices or mobile viewport by verifying all admin menu items are visible, accessible, and functional without requiring special interactions (scrolling or collapsing).

**Acceptance Scenarios**:

1. **Given** the admin application is viewed on a small screen (mobile sized), **When** the page loads, **Then** all primary admin menu items are visible and accessible
2. **Given** multiple menu items exist, **When** the admin scans the screen, **Then** menu items are displayed using appropriate mobile patterns (collapsible menu, horizontal scroll, or responsive layout)
3. **Given** admin menu items are accessed on mobile, **When** the admin clicks a menu item, **Then** navigation works correctly to the intended admin section

---

### User Story 6 - Time Adjustment Facility for Admin (Priority: P2)

Admin users manage court bookings and occasionally need to adjust booking times when unexpected schedule changes occur. Currently, there is no facility to modify the duration or time of existing bookings without creating a new booking.

**Why this priority**: P2 - Valuable operational feature that improves admin flexibility in managing bookings, but can be worked around by cancelling and rebooking. Improves admin efficiency significantly.

**Independent Test**: Can be fully tested by viewing a booking in admin context and verifying the ability to adjust booking time (increase or decrease duration) with visual feedback and confirmation.

**Acceptance Scenarios**:

1. **Given** the admin is viewing a booking in the admin calendar or booking details, **When** they access the edit/time adjustment option, **Then** they can increase or decrease the booking time/duration
2. **Given** an admin adjusts a booking time, **When** they confirm the change, **Then** the system validates that the new time doesn't conflict with other bookings
3. **Given** a booking time adjustment conflicts with existing bookings, **When** the admin attempts to save, **Then** a clear conflict message is displayed and the change is prevented
4. **Given** a booking time is successfully adjusted, **When** the calendar refreshes, **Then** the booking displays with the updated time/duration

---

### Edge Cases

- What happens when a search (name or mobile) returns no results (empty state handling)?
- What happens if multiple players share the same name or mobile number exists duplicated?
- How does the sticky header behave in narrow viewports or when content is limited?
- How does payment status display when a booking is cancelled or refunded?
- What happens on mobile when the form has required validation errors that need to be addressed?
- How are admin menu items displayed on various mobile screen sizes (375px, 480px, 600px)?
- What happens when adjusting a booking time creates a scheduling conflict with another booking?
- Can booking start time and duration be adjusted independently or only duration?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Admin booking form MUST support searching for players by name (partial or full match)
- **FR-002**: Admin booking form MUST support searching for players by mobile number
- **FR-003**: Player search results MUST display matching players with both name and mobile number identification
- **FR-004**: Calendar header row (dates/time labels) MUST remain fixed in viewport when user scrolls calendar content vertically
- **FR-005**: Calendar MUST maintain proper alignment between fixed header and scrolling content
- **FR-006**: Admin calendar view MUST display payment status indicator for each booking (Paid, Pending, Unpaid)
- **FR-007**: Payment status indicator MUST update when booking payment state changes
- **FR-008**: Booking entry form submit button MUST be visible and accessible on mobile devices without requiring viewport scrolling
- **FR-009**: Form MUST remain fully functional on mobile including validation and submission
- **FR-010**: Admin navigation menu MUST be visible and accessible on mobile devices (screens 375px and larger)
- **FR-011**: Admin navigation menu items MUST use responsive patterns (e.g., collapsible menu, mobile navigation) on small screens
- **FR-012**: Admin MUST be able to adjust booking time/duration in the admin section
- **FR-013**: System MUST validate that adjusted booking times do not conflict with existing bookings
- **FR-014**: System MUST prevent booking time changes that create scheduling conflicts and display clear conflict messages

### Key Entities

- **Player**: Identified by name and mobile number; searchable by either name or mobile number during admin booking creation
- **Booking**: Contains payment status (Paid, Pending, Unpaid) and time/duration; editable for time adjustments with conflict detection
- **Calendar Header**: Fixed UI element showing dates/times; remains anchored while content scrolls
- **Form**: Admin booking entry form with player search capability; mobile-responsive with accessible submit button
- **Admin Navigation Menu**: Mobile-responsive navigation providing access to admin sections; adapts to small screen sizes with responsive patterns

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Player search (by name or mobile) returns relevant results within 500ms
- **SC-002**: 95% of admin users successfully locate desired player using either name or mobile number search on first attempt
- **SC-003**: Calendar header remains visible and properly aligned during all scrolling operations (vertical and horizontal)
- **SC-004**: Admin users can identify payment status of any visible booking without clicking for details
- **SC-005**: 100% of mobile users can access and click the form submit button without additional scrolling or viewport manipulation
- **SC-006**: Form submission success rate on mobile devices matches desktop/tablet success rate
- **SC-007**: 100% of admin navigation menu items are accessible and functional on mobile devices (375px+ screens) without requiring horizontal scrolling
- **SC-008**: Admin users can modify booking times with 95% completion rate without errors
- **SC-009**: Time conflict detection prevents 100% of scheduling conflicts and displays clear error messages to users

## Assumptions

- Current system supports searching by mobile number only; this feature adds name search capability
- Player names may not be unique; mobile numbers are used as secondary identifier for disambiguation
- The existing player database contains both name and mobile number information for all active players
- Admin users have access to both player names and mobile numbers when creating bookings
- Mobile devices targeted include screens 375px wide and larger (modern smartphone minimum)
- Payment status has 3 states (Paid, Pending, Unpaid) and does not change frequently during a session
- Sticky header positioning is supported by the current CSS framework (Tailwind CSS)
- Form validation and submission logic remains unchanged; only button visibility/accessibility and search capability are adjusted
- Calendar scrolling behavior uses native browser scroll (not custom scroll implementation) unless already implemented
- Admin navigation menu currently exists but is not responsive; this feature makes it mobile-friendly
- Booking time adjustments can be made without requiring a full rebooking process
- Only admins (not players) can adjust booking times via the new time adjustment facility
- Time validation occurs against the existing booking database to prevent conflicts
- Both booking start time and duration can be adjusted independently

## Tech Stack Alignment

All user stories in this feature utilize the **established project tech stack** for consistency with previous features (002-admin-booking-details):

### Frontend Technology Stack
- **Framework**: React 19.2 + Vite 8.0 + TypeScript 6.0
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
- **State Management**: React Query (@tanstack/react-query 5.99)
- **Date/Time Handling**: date-fns 4.1
- **Icons**: lucide-react 1.8
- **UI Components**: Button, Dialog, Badge, Combobox (from `src/components/ui/`)

### Implementation Approach Per Story
- **US1 (Player Search)**: Extend `PlayerSelectCombobox.tsx` using React Query for dual search (name + mobile)
- **US2 (Sticky Headers)**: Add CSS sticky positioning to `MonthView.tsx` and `WeekView.tsx` headers using Tailwind
- **US3 (Payment Status)**: Add payment_status badge to calendar cells using existing Badge component
- **US4 (Mobile Form)**: Enhance `BookingForm.tsx` with responsive layout using Tailwind mobile utilities
- **US5 (Mobile Menu)**: Make `AdminLayout.tsx` navigation responsive using Tailwind breakpoints and shadcn components
- **US6 (Time Adjustment)**: Create new time adjustment UI in `BookingDetailsModal.tsx` using date-fns for time calculations

### Backend Integration
- All features integrate with existing Supabase backend and RLS policies
- No new database schema changes required
- Uses existing `useBookings()`, `useAuth()`, and other established React Query hooks
