# Feature Specification: Enhanced Calendar Status & Admin Booking Details

**Feature Branch**: `002-admin-booking-details`  
**Created**: April 15, 2026  
**Status**: Draft  
**Input**: User request: Enhanced calendar with persistent status visibility and admin-only booking details display

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Calendar with Name & Status Labels (Priority: P1)

As an admin, I need to see both booking status and player name displayed directly on calendar cells so I can quickly identify who booked which slot without clicking.

**Current State**: Status is shown via color-coding; player names not visible without clicking.

**Desired State**: Admin calendar cells display player name + booking status (e.g., "John Smith - Reserved") as persistent labels. Public calendar shows status only (no names).

**Why this priority**: Admin needs quick visual scanning of bookings; player identification is critical for daily operations.

**Independent Test**: Admin loads calendar and can read player name + status on every reserved booking cell without clicking. Public user sees status only (no names visible).

---

### User Story 2 - Admin-Only Detailed Player Information (Priority: P1)

As an admin, when I click on a reserved booking in the calendar, I need to see the player's details (name, mobile number, address) so that I can contact them or verify their information for payment/cancellation.

**Current State**: Click shows booking status and confirm/cancel buttons, but limited player information.

**Desired State**: Booking details modal displays player name, mobile number, and address (if available) alongside confirmation/cancellation options.

**Why this priority**: Admins need easy access to player contact details to manage reservations and customer communication.

**Independent Test**: Admin logs in, clicks on a reserved slot, and can read player name, mobile number, and address in the modal. Regular player role does NOT see these details (access restricted).

---

### User Story 3 - Read-Only Public Calendar with Slot Status (Priority: P2)

As a player, I need a read-only calendar that shows which slots are Open vs. Reserved vs. Unavailable so I can find available times to request without seeing sensitive admin or player data.

**Current State**: Public calendar exists but may show limited information or allow unintended interactions.

**Desired State**: Public calendar is strictly read-only, shows slot status clearly, and displays no player information or admin-only data.

**Why this priority**: Public players must have visibility into availability while protecting admin data and other player privacy. This is secondary to admin features (P2) but critical for user experience.

**Independent Test**: Unauthenticated user/player navigates `/` (public calendar), sees slot status indicators for Open/Reserved/Unavailable, cannot click to book or see player details, and cannot access admin features.

---

## Functional Requirements *(mandatory)*

### Requirement F1: Admin Calendar Display with Name & Status
- Admin calendar cells must display **player name + booking status** (e.g., "John Smith - Reserved") as persistent text labels.
- Status values: "Reserved" (CONFIRMED/PENDING), "Unavailable" (UNAVAILABLE).
- Display format: Player name on first row, status on second row (or combined if space allows: "John Smith (Reserved)").
- Visual indicators: Background color still applied (Green=Open, Blue=Reserved, Grey=Unavailable).
- Status text label must be readable on mobile (375px) and desktop (1920px).

### Requirement F1b: Public Calendar Display with Status Only
- Public calendar cells display **status only** (e.g., "Reserved", "Open", "Unavailable")—no player names visible.
- Same background colors and text formatting as admin calendar for consistency.
- Public calendar is strictly read-only; no click handlers.

### Requirement F2: Admin Modal for Full Booking Details (Admin Only)
- When admin clicks on a reserved booking cell in the calendar, a modal opens showing:
  - Player name, mobile number, address
  - Booking status, time/court information
  - Confirm/Cancel/Delete buttons (existing)
- Non-admin users cannot click booking cells; cells are non-interactive (read-only).

### Requirement F3: Admin Role Access Control
- Admin (`isAdmin` check) can see player name on calendar cells.
- Admin can click to view full details (phone, address) in modal.
- Non-admin/public players cannot see player names; only see status.
- Database RLS policies must enforce this (no data leakage in API queries).

### Requirement F4: Data Visibility Rules
- **Admin calendar**: Displays player name + status on all booking cells. Admin can click to see phone + address in modal.
- **Public calendar**: Displays status only (no player names). Cells are non-interactive; no modal.
- **API enforcement**: RLS policies prevent public users from accessing player names, phone, or address. Public API returns only status without player data.

---

## Success Criteria *(mandatory)*

- **Quick ID**: Admin can identify player name + status on calendar cells within 1 second (mobile or desktop).
- **Admin Details**: Admin can click reserved booking and read full player details (name, phone, address) in under 3 seconds.
- **Privacy Compliance**: Unauthenticated users see 0 player names or details; API returns only status.
- **Responsive Design**: Calendar cells display name + status readable on 375px (mobile) to 1920px (desktop) widths.
- **Role-Based Access**: Admin sees names on calendar; non-admin sees status only; API enforces RLS.
- **No Performance Impact**: Calendar loads within 2 seconds even with 50+ bookings; name rendering adds <100ms.
- **Read-Only Enforcement**: Public and non-admin users cannot click or interact with any calendar cells.

---

## Key Entities *(optional but recommended)*

| Entity | Attributes | Notes |
|--------|-----------|-------|
| Booking | `id`, `status` (PENDING/CONFIRMED/UNAVAILABLE), `player_id`, `player_name`, `player_phone`, `player_address`, `timeslot`, `court` | Links to Player; status drives UI rendering |
| Player | `id`, `name`, `phone`, `address` | Fetched for admin modal; not exposed to public API |
| Timeslot | `start_time`, `end_time`, `court_id`, `booking_status` | Computed from Booking table; acts as calendar grid cell |

---

## Assumptions *(optional)*

- Player phone and address are already fields in the Player/Booking tables (if not, they will be added).
- The system already has role-based access control (`isAdmin` flag in auth context).
- Current calendar component can be extended with conditional rendering based on role and view type.
- RLS policies are properly configured to prevent data leakage to public users.
- Status badge/indicator style is flexible (color, text, icon—design choice in planning phase).

---

## Dependencies & Constraints *(optional)*

- **Dependencies**: Existing booking system, auth context with role info, Supabase RLS policies.
- **Constraints**: Must not break existing admin or public calendar flows; mobile responsiveness must maintain; API data exposure must remain minimal.
- **Out of Scope**: Creating new booking/reservation flows; modifying player data entry; payment processing; email notifications.

---

## Next Steps

1. ✅ **Specification Review**: Confirm all requirements capture the calendar enhancements.
2. ✅ **Clarifications**: Answered design questions (status display: background color + text; address: full capture).
3. ⬜ **Planning**: Run `/speckit.plan` to generate implementation tasks and design decisions.
4. ⬜ **Implementation**: Execute tasks from plan.md.
