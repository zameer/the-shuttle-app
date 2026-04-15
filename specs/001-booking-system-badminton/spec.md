# Feature Specification: Badminton Court Booking System

**Feature Branch**: `001-booking-system-badminton`  
**Created**: 2026-04-12  
**Status**: Draft  
**Input**: User description: "booking system badminton court, admin users will do the booking and players can check available slots. admin console is high priority... one court, support setting unavailability... calendar view. hourly payment specified in LKR (configurable default and options, no hardcoding). partial hourly booking, paid amount tracking, and comprehensive dashboard."

## User Scenarios & Testing *(mandatory)*

### User Story 0 - Authentication & Access Control (Priority: P1)

As a system owner, I want admin access protected by a password-only login screen where the admin email is pre-configured and hidden, so the admin only needs to type their password to gain access.

**Why this priority**: Simplifies the login UX — the admin console belongs to a single known operator; showing an email field is unnecessary friction.

**Independent Test**: Visit the login screen and verify only a password field is shown. Enter the wrong password (should be rejected). Enter the correct password (should grant access to admin console).

**Acceptance Scenarios**:

1. **Given** an unauthenticated user navigates to the admin console, **Then** they see a password-only login screen (no email field visible).
2. **Given** the admin enters the wrong password, **Then** an error is shown and access is denied.
3. **Given** the admin enters the correct password, **Then** they are redirected to the admin dashboard.
4. **Given** an unauthenticated player navigates to the player calendar URL, **Then** the page loads the read-only availability view without any login prompts.

---

### User Story 1 - Admin Calendar Management (Priority: P1)

As an admin, I want to use an interactive calendar view (supporting both Week and Month views) to see all slots for our single court, so that I can easily view, add, cancel, and confirm bookings in one unified interface.

**Why this priority**: The admin console is the core focal point of the feature. Visual management is critical to operations.

**Independent Test**: Load the calendar view with mock data covering all states. The admin should be able to click on a time slot to invoke the booking creation workflow or click an existing booking to view/edit it.

**Acceptance Scenarios**:

1. **Given** the admin is logged in, **When** they view the calendar, **Then** all slots are clearly visible and color-coded based on their status (e.g., Open, Pending, Confirmed, Unavailable).
2. **Given** an existing booking, **When** the admin clicks on it within the calendar, **Then** a modal opens allowing them to cancel or confirm it.

---

### User Story 2 - Admin Booking & Payments (Priority: P1)

As an admin, I want to create a booking (including partial hours, e.g., 1.5 hours) and set the hourly payment rate so that the total price is automatically calculated. In order to handle future changes flexibly, the system should pull the default and alternative rates (currently 600 LKR default, 500 LKR option) from a configurable settings source rather than hardcoded values. Once payment is received, I want to mark the payment amount as "Paid".

**Why this priority**: Required for creating the reservations, supporting flexible durations, and accurately tracking expected vs. received revenue without requiring code changes when prices change.

**Independent Test**: Create a 1.5-hour booking with the dynamic default rate (e.g., 600 LKR). Verify the total price is calculated as 900 LKR. Mark the booking as paid and verify the state changes.

**Acceptance Scenarios**:

1. **Given** the admin creates a 1.5-hour booking, **When** the hourly rate from settings is applied (e.g., 600 LKR), **Then** the system calculates the total price dynamically.
2. **Given** an unpaid booking, **When** the admin confirms payment is received, **Then** the payment status changes to "Paid".
3. **Given** the admin creates a booking, **When** the booking form opens, **Then** the hourly rate defaults to the current active rate defined in the system settings rather than a hardcoded number.
4. **Given** the admin creates a booking, **When** assigning a player, **Then** they can type the player's phone number into a combobox/autocomplete field to instantly filter existing players, and easily save it as a new player if the phone number doesn't exist, directly inside the same form.

---

### User Story 3 - Admin Sets Court Unavailability (Priority: P1)

As an admin, I want to mark specific slots on the calendar as "unavailable" (e.g., for maintenance or closed hours), so that no one incorrectly assumes the court can be booked.

**Why this priority**: Protects the schedule during off-hours or unexpected closures.

**Independent Test**: Block out a time slot as "unavailable". Attempt to book another session during this time. The system should reject the overlapping request.

**Acceptance Scenarios**:

1. **Given** an open slot, **When** the admin marks it as unavailable, **Then** the calendar updates its color to the "unavailable" status.
2. **Given** an unavailable slot, **When** another booking is attempted over the same time period, **Then** the system rejects it.
3. **Given** an admin visits settings, **When** they configure recurring unavailable hours (e.g., every Monday 2 PM – 4 PM), **Then** these blocks appear automatically on the calendar as unavailable each week.

---

### User Story 6 - Court Hours Management (Priority: P1)

As an admin, I want to configure the court's open hours (start and end times) from a settings screen so that the calendar only displays bookable slots within operational hours.

**Why this priority**: Without defined operating hours the calendar shows all 24 hours, making the UI unwieldy and confusing.

**Independent Test**: Set court hours to 8 AM – 10 PM. Verify the calendar only shows rows for 8 AM to 10 PM.

**Acceptance Scenarios**:

1. **Given** the admin sets court start time to 8 AM and end time to 10 PM, **When** the calendar renders, **Then** only slots from 8 AM to 10 PM are shown.
2. **Given** the admin creates a recurring unavailable block, **When** viewing the weekly calendar, **Then** every affected day shows that time as unavailable automatically.

---

### User Story 7 - Cancel Removes Booking (Priority: P1)

As an admin, when I cancel a booking, the booking record should be permanently removed from the database so the slot is immediately freed and historical clutter is avoided.

**Acceptance Scenarios**:

1. **Given** an existing booking, **When** the admin clicks Cancel and confirms, **Then** the booking is hard-deleted from the database and disappears from the calendar instantly.

---

### User Story 8 - Terms & Conditions (Priority: P2)

As an admin, I want a dedicated screen to write and update the court's Terms & Conditions. As a player, I want to view the Terms & Conditions in a public read-only screen.

**Acceptance Scenarios**:

1. **Given** the admin navigates to the T&C management screen, **When** they write and save content, **Then** it is persisted.
2. **Given** a player navigates to the public T&C URL, **When** the page loads, **Then** the latest Terms & Conditions are displayed read-only.

---

### User Story 4 - Player Checks Available Slots (Priority: P2)

As a player, I want to check available badminton court slots using a simple calendar view, so that I can easily navigate dates and see when the court is free before requesting a booking from the admin.

**Why this priority**: Required for players to see availability, but secondary to getting the admin console functioning according to priorities.

**Independent Test**: Player accesses the system and views the calendar. They can only see slots as "Available" or "Unavailable/Booked", without seeing other players' details or rates.

**Acceptance Scenarios**:

1. **Given** the player navigates to their simple, read-only calendar view, **When** they look at any date/slot, **Then** the availability status (e.g., "Available" or "Unavailable") is displayed directly within the calendar itself without requiring any click or daily view navigation.

---

### User Story 5 - Comprehensive Admin Dashboard (Priority: P1)

As an admin, I want a comprehensive dashboard overview so that I can see at-a-glance metrics like today's total bookings, upcoming reservations, court utilization, and total revenue collected/pending.

**Why this priority**: While the calendar is great for scheduling, a dashboard is essential for high-level business oversight and daily operations management.

**Independent Test**: Log into the admin console. An overview dashboard should load displaying key summary stats (revenue, total bookings) derived correctly from existing booking data.

**Acceptance Scenarios**:

1. **Given** the admin logs in, **When** they land on the dashboard, **Then** they see a summary of today's bookings (count and list).
2. **Given** there are pending payments, **When** reviewing the dashboard, **Then** the total pending vs. collected revenue is accurately displayed.

---

### Edge Cases

- How does the system handle improperly formatted phone numbers entered quickly by an admin (e.g., standardizing format or stripping spaces)?
- What happens if an admin tries to change the price of an already confirmed and paid booking?
- Pricing rounding logic if a partial booking results in fractions of an LKR (e.g., booking for 1 hour and 10 minutes at 500 LKR/hr).
- Timezone issues if an admin manages the calendar from a different geographical region (system should always enforce local time for the court).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an interactive calendar view (supporting both Week and Month views) for admins to manage slots, as well as a simplified read-only calendar view for players to check availability.
- **FR-001b**: The calendar MUST display data correctly in Month view, ensure the time-axis remains sticky when scrolling horizontally, and ensure action buttons remain fully visible on small mobile screens.
- **FR-002**: System MUST use color coding on the calendar to reflect booking statuses (e.g., Available, Confirmed, Unconfirmed/Pending, Unavailable).
- **FR-002b**: System MUST represent bookings spanning 2 or more hours as a single vertically merged continuous visual block on the Week view (rather than isolated hourly cells).
- **FR-003**: System MUST support creating new bookings directly from calendar interactions.
- **FR-003b**: Booking creation workflow MUST allow admins to search for an existing player by phone number (acting as the User ID) using an autocomplete/combobox field, and natively save it as a new player without navigating to a separate screen if the number is unrecognized.
- **FR-004**: System MUST read hourly rates (default and options) from a configurable system setting, rather than hardcoding them, allowing them to be changed in the future.
- **FR-005**: System MUST calculate total price dynamically based on booking duration (including partial hours) and the selected hourly rate.
- **FR-006**: System MUST track payment status and allow an admin to update the payment amount to "Paid".
- **FR-007**: System MUST allow admins to block off time slots as strictly "Unavailable".
- **FR-008**: System MUST enforce that only a single court exists; no multi-court logic is required.
- **FR-009**: System MUST provide a comprehensive dashboard summarizing daily bookings, upcoming schedules, court utilization, and financial metrics (collected vs. pending payments).
- **FR-010**: System MUST enforce email + password authentication for all admin console routes, restricting access exclusively to emails listed in the `admin_users` table.
- **FR-011**: System MUST allow public, unauthenticated access to the player's read-only calendar view.
- **FR-012**: Admin MUST be able to configure court operating start and end times from a settings screen. The calendar MUST only render time slots within those hours.
- **FR-013**: Admin MUST be able to set recurring unavailable time blocks from the settings screen. These MUST appear automatically on the calendar.
- **FR-014**: Cancelling a booking MUST permanently delete the booking record from the database (hard delete).
- **FR-015**: Admin MUST have a dedicated Terms & Conditions management screen to write and update the court's T&C content.
- **FR-016**: Players MUST have access to a public, read-only Terms & Conditions page displaying the latest T&C content without requiring authentication.

### Key Entities *(include if feature involves data)*

- **Player**: Represents a user.
  - Attributes: `phoneNumber` (Primary Key / Player ID), `name`, `address`
- **Booking**: Represents a time reservation.
  - Attributes: `startTime`, `endTime`, `playerPhoneNumber` (Foreign Key), `status` (Pending, Confirmed, Blocked/Unavailable)
  - Payment Attributes: `hourlyRate` (Decimal/Float, references configurable setting), `totalPrice` (Decimal/Float), `paymentStatus` (Pending, Paid)
  - Cancelled bookings are **hard-deleted** from the database.
- **CourtSettings**: Stores system-level configuration.
  - Attributes: `courtOpenTime` (time), `courtCloseTime` (time), `defaultHourlyRate` (number), `availableRates` (array), `termsAndConditions` (text)
- **RecurringUnavailableBlock**: Stores recurring court closures.
  - Attributes: `id`, `dayOfWeek` (0=Sun–6=Sat), `startTime` (time), `endTime` (time), `label` (e.g., "Maintenance")

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can complete a primary workflow (add, verify calendar color, confirm booking) entirely within the calendar UI in under 30 seconds.
- **SC-002**: 100% prevention of overlapping bookings on the single court.
- **SC-003**: Players can view slot availability in under 2 seconds.
- **SC-004**: Dashboard metrics must calculate and render accurately based on booking states within 3 seconds of load.

## Assumptions

- There is strictly one physical court.
- The 600 LKR and 500 LKR rates apply purely as metadata/record keeping on the booking, rather than integrated payment processing (like Stripe).
- Calendar coloring conventions will be defined during the design phase (e.g., Green = Available, Red = Confirmed, Yellow = Pending, Grey = Unavailable).
