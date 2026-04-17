# Feature Specification: Admin Booking Controls and Past Slot Visibility

**Feature Branch**: `014-admin-booking-calendar-fixes`  
**Created**: 2026-04-17  
**Status**: Draft  
**Input**: User description: "As admin should be able manage booking that confirmed but unable make it. Admin should be able revert pricing. Player and Admin Calendar past days, Available slots not required to show"

## Clarifications

### Session 2026-04-17 (Batch 1)

- Q: Should status change in US2 be available for all booking states, or only when reverting pricing? → A: Status change and pricing revert are independent actions, both always available.
- Q: What are the canonical booking status values admins should be able to change between? → A: Admins can change between CONFIRMED ↔ CANCELLED, CONFIRMED ↔ PENDING, and CONFIRMED ↔ NO_SHOW (admins choose from all three).
- Q: Are US1 (manage confirmed booking) and US2 (revert pricing + status change) separate user stories, or should they merge? → A: Merge into one combined "Admin Booking Management" story.

### Session 2026-04-17 (Batch 2)

- Q: Should "add past bookings" capability be added to Feature 014 or created as separate Feature 015? → A: Add as US3 to Feature 014 (expand scope to include retroactive past booking creation).
- Q: How far back in time should admins be allowed to create past bookings? → A: Unlimited historical window (admins can create bookings for any past date).
- Q: Should past bookings created by admins be marked as "admin-created" or "retroactive"? → A: No special flag—treat past bookings identically to normal bookings.

### Session 2026-04-17 (Batch 3)

- Q: What does each booking status mean and when should admins use each? → A: CONFIRMED = booking expected / player attended; CANCELLED = player or admin cancelled due to unavailability; PENDING = awaiting player confirmation (not yet confirmed); NO_SHOW = player did not attend a confirmed booking (admin marks after the fact).
- Q: What is the initial (default) status when an admin creates a new past booking? → A: Admin chooses status at creation time via a dropdown in the booking form (no forced default).

### Session 2026-04-17 (Batch 4)

- Q: Should manual price editing be available for all booking statuses or only specific ones? → A: All statuses — any booking's price can be manually edited regardless of status.
- Q: Should there be a minimum/maximum constraint on the manually entered price? → A: No constraint — admins can enter any value including zero (e.g., complimentary sessions, waived fees, error corrections).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Booking Management (Manage State & Pricing) (Priority: P1)

As an admin, I want to manage a booking's status (when player cannot attend) and pricing (manually edit to any value or revert to system value) in one unified interface so I can quickly correct booking data and keep the schedule accurate.

**Why this priority**: This directly affects day-to-day operations and prevents stale or mispriced bookings from occupying court time or affecting reconciliation.

**Independent Test**: Open a confirmed booking in admin booking management, change its status to CANCELLED (or PENDING or NO_SHOW), manually enter a custom price or revert to system pricing, and verify all updates are saved and reflected consistently in booking views.

**Acceptance Scenarios**:

1. **Given** a booking with any status, **When** the admin changes its status to CONFIRMED, CANCELLED, PENDING, or NO_SHOW, **Then** the booking is updated and the new status is reflected consistently across admin views.
2. **Given** a booking with any status, **When** the admin manually enters a custom price (including zero), **Then** the price is accepted and saved without validation errors or status-based restrictions.
3. **Given** a booking has a manually edited price, **When** the admin chooses revert pricing, **Then** the booking price resets to the system-calculated value (independent of status change).
4. **Given** status and pricing changes are made together, **When** the admin saves changes, **Then** both the new status and updated price are stored.
5. **Given** a booking state or price has been updated, **When** the admin reviews booking history or auditable logs, **Then** all changes (status change and/or pricing edits/revert) remain visible and auditable.
6. **Given** no manual pricing change exists, **When** the admin opens pricing controls, **Then** revert pricing is either disabled or has no effect (independent of status-change capability).

---

### User Story 2 - Hide Past-Day Available Slots in Player and Admin Calendars (Priority: P2)

As a player or admin, I want past-day available slots hidden so the calendars focus on meaningful historical bookings and current/future availability.

**Why this priority**: Past availability has no booking value and creates noise in calendar and list views.

**Independent Test**: Open player and admin calendar/list for a past date and verify only non-available entries appear; open a current/future date and verify available slots still appear normally.

**Acceptance Scenarios**:

1. **Given** a selected date is in the past, **When** calendar or list view is shown for player or admin, **Then** rows marked available are not shown.
2. **Given** a selected date is in the past, **When** bookings exist for that date, **Then** those booking rows remain visible.
3. **Given** a selected date is today or future, **When** calendar or list view is shown, **Then** available slots continue to display as expected.

---

### User Story 3 - Admin Add Past Bookings for Missed or Retroactive Recording (Priority: P2)

As an admin, I want to create bookings for past dates so I can record missed bookings or retroactively document court usage that occurred but was not initially captured in the system.

**Why this priority**: Admins need the ability to correct historical records when a booking occurred but was forgotten or not recorded at the time; this maintains accurate historical data for reconciliation and audit purposes.

**Independent Test**: Navigate to a past date in admin calendar/list, create a new booking (select player, time, pricing), and verify it is saved and visible in both admin and player views for that date.

**Acceptance Scenarios**:

1. **Given** an admin is viewing a past date, **When** the admin chooses to create a new booking, **Then** a booking form is available with the date pre-selected and a status dropdown allowing selection of CONFIRMED, CANCELLED, PENDING, or NO_SHOW.
2. **Given** an admin creates a past booking, **When** the booking is saved, **Then** it appears in admin calendar/list with the chosen status and the same appearance as any other booking of that status (no "retroactive" flag visible to end users).
3. **Given** a past booking has been created, **When** the relevant player views their calendar for that date, **Then** the booking is visible in their booking history.
4. **Given** an admin creates a past booking, **When** the system records the action, **Then** the admin's identity and timestamp are preserved in audit logs for accountability.
5. **Given** an admin is on a far-past date (e.g., 6 months ago), **When** a booking is created, **Then** the system allows the action without restriction.

### Edge Cases

- When a confirmed booking in the past is marked as not proceeding, historical display still shows the final managed status.
- When an admin reverts pricing after multiple manual edits, the value always resolves to the latest system-calculated amount.
- When a past date has no bookings, player and admin views show no available-slot rows.
- When timezone boundaries are crossed near midnight, a slot is treated as past or non-past based on the system’s effective calendar date.
- When a booking spans from a non-past period into a past boundary, visibility rules are evaluated using the booking date context shown to the user.- When an admin creates a booking for a date far in the past, the booking is treated as historical and remains visible; no arbitrary time limit exists.
## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Admins MUST be able to change a confirmed booking to CANCELLED, PENDING, or NO_SHOW status (canonical status transitions).
- **FR-002**: A booking state change MUST be reflected consistently across admin booking views and maintained in audit logs.
- **FR-003**: Status change, manual price editing, and pricing revert MUST each be independently available actions (any combination may be performed without requiring the others).
- **FR-003a**: Admins MUST be able to manually enter any custom price value (including zero) for any booking regardless of its current status; no minimum, maximum, or status-based price restriction applies.
- **FR-004**: Admins MUST be able to revert manually edited booking pricing to the system-calculated value.
- **FR-005**: Reverted pricing MUST remain in effect when the booking is saved.
- **FR-006**: Revert pricing controls MUST not cause unintended pricing changes when no manual override exists.
- **FR-007**: For past dates, available slots MUST be hidden in player calendar/list views.
- **FR-008**: For past dates, available slots MUST be hidden in admin calendar/list views.
- **FR-009**: For past dates, existing booking entries MUST remain visible.
- **FR-010**: For current and future dates, existing available-slot behavior MUST remain unchanged.
- **FR-011**: Admins MUST be able to create new bookings for any past date without arbitrary time-window restrictions.
- **FR-012**: When an admin creates a past booking, the action MUST be recorded in audit logs with admin identity and timestamp for accountability; the booking itself MUST appear identical to other bookings of the same status (no "retroactive" or "admin-added" flag visible to users).
- **FR-013**: When creating a past booking, admins MUST be able to choose the initial booking status (CONFIRMED, CANCELLED, PENDING, or NO_SHOW) from a dropdown at creation time; no status is forced as a default.

### Key Entities *(include if feature involves data)*

- **Booking Status (Canonical Values & Semantics)**:
  - **CONFIRMED**: Booking is expected to proceed or has proceeded; player is/was attending.
  - **CANCELLED**: Booking was cancelled by the player or admin due to unavailability or other reason.
  - **PENDING**: Booking is created but awaiting player confirmation; not yet in a confirmed state.
  - **NO_SHOW**: Player did not attend a confirmed booking; admin marks this after the scheduled time.
  - Admins can transition any booking to any of these four statuses; when creating a past booking the status is chosen at creation time via dropdown.
- **Booking Price Source**: The distinction between manually entered booking price (any value ≥ 0 including zero, set freely by admin regardless of booking status) and system-calculated booking price (used as the revert target); both coexist as independent pricing modes.
- **Calendar Slot Visibility Rule**: The rule set that determines whether available slots should be shown based on whether the viewed date is past, present, or future.
- **Past Booking Creation Context**: The capability and audit trail for admin-created historical bookings; includes admin identity, timestamp, and internal flagging for accountability (but no user-visible "retroactive" label).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In QA testing, 100% of attempted admin status changes (CONFIRMED → CANCELLED/PENDING/NO_SHOW) are saved and reflected correctly in booking views.
- **SC-002**: In QA testing, 100% of revert-pricing actions restore the booking price to the expected system-calculated value (independently of status change).
- **SC-003**: In QA testing, 0 past-date available slots are visible in both player and admin calendar/list views.
- **SC-004**: In QA testing, 100% of current/future date views continue to show available slots as expected.
- **SC-005**: In QA testing, 100% of past bookings created by admins are saved and visible in both admin and player views without time-window restrictions or retroactive flags.
- **SC-006**: In QA testing, 100% of admin-created past bookings are recorded in audit logs with admin identity and timestamp preserved.
- **SC-007**: In QA testing, 100% of manually entered prices (including zero) are accepted and saved without validation errors, regardless of booking status.

## Assumptions

- The existing booking model already supports all four statuses: CONFIRMED, CANCELLED, PENDING, and NO_SHOW, with the semantics defined above (CONFIRMED = attended/attending, CANCELLED = cancellation, PENDING = awaiting confirmation, NO_SHOW = absent from confirmed booking).
- System-calculated pricing logic already exists and can be reused by the revert-pricing action.
- Status change, manual price entry, and pricing revert all share the same booking form/modal but operate as fully independent form fields; no field depends on or triggers another.
- The feature applies to both calendar and list displays where availability rows are currently shown.
- Past-date determination follows the application’s existing date and timezone handling rules.
- No new user roles or permission tiers are required for this feature.- The booking creation form is accessible from admin calendar/list views and supports past date selection.
- Audit logging infrastructure exists and can track admin-created bookings (admin identity, timestamp, booking details).
- Past bookings created by admins are treated identically to normal bookings in all views and calculations (no visual distinction or retroactive flag).