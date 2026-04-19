# Feature Specification: Route Callback Requests

**Feature Branch**: `021-route-callback-requests`  
**Created**: 2026-04-19  
**Status**: Draft  
**Input**: User description: "extend current availability check to show call icon, them players check availability to make a call and admins manage the reservations. You want to handle multiple admins with varying availability and route requests intelligently. If an admin is busy, the request goes to the next available admin. If none are free, you'd store it in a queue table with a status like pending, and use Supabase real-time subscriptions so admins get notified instantly when there's a waiting request. They can then claim it. For the player side, they could select a callback option during slot checking, which creates that request. You could use Supabase functions or a simple webhook to handle the routing logic server-side, keeping it secure."

## Clarifications

### Session 2026-04-19

- Q: Which available admin phone number should the mobile call button dial when multiple admins are available at click time? → A: Use the next available admin in the same routing order as callback assignment.
- Q: What should happen when the player taps call but no admin is available? → A: Show no-admin-available feedback and offer one-tap Request Callback.
- Q: What routing order should define next-available admin selection? → A: ~~Round-robin~~ **Corrected (same session)**: One or two designated primary contacts always receive calls first, before any other available admin.
- Q: What defines whether an admin is available for routing and call targeting? → A: Admin must explicitly set status to Available using a manual toggle.
- Q: Which phone number type can be used for direct mobile call initiation? → A: Use admin work contact numbers only, never personal numbers.
- Q: What information does the callback request form capture? → A: Player name, phone number, slot time from and to, preferred callback time (optional), player location, optional note.

### Session 2026-04-19 (pre-call gates)

- Q: How is the time slot selection gate enforced before the call option is activated? → A: Call option is always visible and enabled; player enters slot time in the callback form after tapping call.
- Q: How should court rules acknowledgement work before the player submits the callback form? → A: Show a non-blocking informational message reminding the player to read the court rules before submitting.

### Session 2026-04-19 (call icon placement)

- Q: Where exactly does the call icon appear in the player-facing availability UI? → A: Persistent floating action button (FAB) fixed at the bottom of the availability/calendar screen, always in view.

- Q: Where are admin work phone number and availability toggle managed? → A: Super-admin only — a dedicated config area only a super-admin can edit.
- Q: What is the canonical name for the admin who attends and handles a call or callback request? → A: Booking Agent.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Request a Callback During Availability Check (Priority: P1)

As a player checking court availability, I want a visible call option that lets me request a callback about a slot so I can ask for help without directly managing the reservation myself.

**Why this priority**: This creates the player-facing entry point for the entire feature. Without it, no callback workflow can begin.

**Independent Test**: Open the player availability experience, choose a slot or time context, use the call option, and verify a callback request is created without requiring direct admin contact.

**Acceptance Scenarios**:

1. **Given** the player is on the availability/calendar screen, **When** they view any state of the screen, **Then** a persistent floating call button (FAB) is fixed at the bottom of the screen and always in view.
2. **Given** one or more Booking Agents are available, **When** the player taps the call option, **Then** the device initiates a mobile call to the next available Booking Agent determined by the primary-contact-first routing order.
3. **Given** no Booking Agent is available at call-click time, **When** the player taps the call option, **Then** the UI shows no-agent-available feedback and offers a one-tap Request Callback action.
4. **Given** the player opens the callback request form, **When** the form is displayed, **Then** a non-blocking informational message is shown reminding the player to read the court rules before submitting.
5. **Given** the callback request is accepted by the system, **When** the player finishes the action, **Then** they receive clear confirmation that their request is waiting for Booking Agent follow-up.

---

### User Story 2 - Route Requests to an Available Admin (Priority: P1)

As the reservation operation, I want callback requests to be routed to an available admin automatically so player requests reach staff who can respond right away.

**Why this priority**: Smart routing is the core operational value. It reduces missed requests and avoids dependence on a single admin.

**Independent Test**: Create callback requests while multiple admins have different availability states and verify each request is assigned to the next available admin when one exists.

**Acceptance Scenarios**:

1. **Given** multiple admins exist and at least one is available, **When** a player submits a callback request, **Then** the system assigns the request to an available admin.
2. **Given** one admin is busy and another is available, **When** a callback request is created, **Then** the system skips the busy admin and routes to the available admin.
3. **Given** an admin receives a routed request, **When** they review their active work, **Then** the request appears as assigned to them for follow-up.

---

### User Story 3 - Queue and Claim Requests When No Admin Is Free (Priority: P1)

As an admin team, we want unassigned callback requests to wait in a visible queue and notify admins immediately when they can be claimed so no player request is lost when everyone is busy.

**Why this priority**: Busy periods are the operational edge case most likely to drop player contact requests. Queueing preserves service continuity.

**Independent Test**: Mark all admins unavailable, create a callback request, verify it enters a pending queue, then restore availability and confirm admins are notified and can claim the waiting request.

**Acceptance Scenarios**:

1. **Given** no admins are available, **When** a player submits a callback request, **Then** the request is stored as pending in the queue.
2. **Given** a pending request exists, **When** an admin becomes available or checks the queue, **Then** they receive immediate visibility that a waiting request can be claimed.
3. **Given** multiple pending requests are waiting, **When** an admin claims one, **Then** that request becomes assigned and is no longer shown as unclaimed to other admins.
4. **Given** a request is claimed, **When** other admins receive updates, **Then** they see the current claim state without stale queue information.

---

### User Story 4 - Manage Callback Requests as Reservation Work (Priority: P2)

As an admin handling reservations, I want to review, claim, and manage callback requests as part of reservation operations so player follow-up is organized and accountable.

**Why this priority**: Routing and queueing are only useful if admins can act on the resulting requests in a reservation-management workflow.

**Independent Test**: Open the admin request-management view, inspect assigned or queued callback requests, and verify admins can claim and manage them as part of reservation handling.

**Acceptance Scenarios**:

1. **Given** callback requests exist, **When** an admin opens the management area, **Then** they can distinguish assigned requests from waiting requests.
2. **Given** an admin claims a waiting request, **When** the claim succeeds, **Then** the request is shown under that admin’s managed workload.
3. **Given** an admin is managing a callback request, **When** they use the reservation workflow, **Then** the request remains linked to that follow-up process.

### Edge Cases

- A player submits a callback request while all admins are busy; the request must still be accepted and queued.
- Two admins try to claim the same waiting request at nearly the same time; only one claim should succeed.
- An admin’s availability changes while routing is in progress; the request should end in one clear state: assigned or queued.
- A player creates a callback request for a slot that later becomes unavailable; the request should still remain manageable for follow-up.
- An admin receives updates for waiting requests while already managing other reservations; the queue information should remain current and not duplicate claims.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a visible callback or call option during the player availability-check experience.
- **FR-001a**: The call option MUST be rendered as a persistent floating action button (FAB) fixed at the bottom of the availability/calendar screen, remaining visible at all scroll positions.
- **FR-002**: Players MUST be able to create a callback request from the availability-check experience.
- **FR-002a**: Players MUST be able to initiate a mobile call from the availability-check experience when at least one admin is available.
- **FR-002b**: The callback request form MUST capture: player name, player phone number, slot time from, slot time to, player location, preferred callback time (optional), and an optional free-text note.
- **FR-002c**: The callback request form MUST display a non-blocking informational message reminding the player to read the court rules before submitting; this message MUST NOT block or require acknowledgement to proceed.
- **FR-003**: The system MUST confirm to the player that a callback request has been received.
- **FR-004**: The system MUST evaluate Booking Agent availability when a new callback request is created.
- **FR-004a**: The system MUST treat a Booking Agent as available only when that Booking Agent explicitly sets status to Available via manual toggle.
- **FR-005**: If one or more Booking Agents are available, the system MUST route the request to an available Booking Agent rather than a busy one.
- **FR-005a**: The system MUST designate one or two Booking Agents as primary contacts who always receive incoming calls and callback assignments before any other available Booking Agent.
- **FR-005b**: When multiple Booking Agents are available at call-click time, the system MUST try primary contacts first; if none are available, it routes to the next available non-primary Booking Agent.
- **FR-006**: If no Booking Agents are available, the system MUST store callback requests in a pending queue.
- **FR-006a**: If no Booking Agent is available at call-click time, the system MUST show a no-agent-available message and provide a one-tap Request Callback action.
- **FR-007**: Booking Agents MUST receive immediate visibility when queued requests are waiting to be claimed.
- **FR-008**: Booking Agents MUST be able to claim an unassigned queued request.
- **FR-009**: The system MUST prevent the same queued request from being claimed by more than one Booking Agent.
- **FR-010**: Booking Agents MUST be able to distinguish assigned callback requests from pending unclaimed requests.
- **FR-011**: Callback requests MUST remain associated with Booking Agent reservation handling after assignment or claim.
- **FR-012**: Access to callback request management MUST remain limited to authorized Booking Agents.
- **FR-012a**: Direct mobile call initiation MUST use Booking Agent work contact numbers only and MUST NOT expose personal phone numbers.
- **FR-012b**: Booking Agent work phone numbers and availability toggles MUST be configurable only by a super-admin through a dedicated admin config area.
- **FR-013**: Callback request routing and assignment decisions MUST be enforced through a secure server-controlled process.

### Key Entities *(include if feature involves data)*

- **Callback Request**: A player-initiated request for admin follow-up created from the availability-check flow, including request status and assignment state.
- **Booking Agent**: The admin role responsible for attending, answering, and handling incoming calls and callback requests on behalf of the court operation.
- **Primary Contact**: One or two designated Booking Agents who receive calls and callback assignments before other available Booking Agents.
- **Callback Form Submission**: The data record created when a player submits a callback request, containing player name, phone number, slot time from, slot time to, player location, optional preferred callback time, and optional note.
- **Call FAB**: The persistent floating action button fixed at the bottom of the availability/calendar screen through which a player initiates a direct call or callback request at any time.
- **Rules Reminder**: A non-blocking informational message shown on the callback form prompting the player to read court rules before submitting; requires no action to proceed.
- **Admin Availability State**: The manually controlled status where only explicit Available state qualifies an admin to receive routed callbacks or direct call targeting.
- **Queued Request**: A callback request waiting for assignment because no admin was available at creation time.
- **Claimed Request**: A formerly queued request that has been actively taken by a specific Booking Agent.
- **Reservation Follow-Up Record**: The operational context linking callback handling to admin reservation management.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In QA, 100% of sampled player callback requests created from availability check are accepted and confirmed to the player.
- **SC-001a**: In QA, 100% of sampled mobile call actions made while a primary contact Booking Agent is available dial a primary contact, not a non-primary Booking Agent.
- **SC-001b**: In QA, 100% of sampled call-click attempts when no admin is available show no-admin-available feedback and a working one-tap Request Callback option.
- **SC-002**: In QA, 100% of sampled requests created while at least one Booking Agent is available are routed to an available Booking Agent without being assigned to a busy one.
- **SC-002a**: In QA, 100% of sampled routing decisions prioritise primary contact Booking Agents when at least one primary contact is available.
- **SC-002b**: In QA, 100% of sampled routing decisions include only Booking Agents with explicit manual Available status as eligible targets.
- **SC-003**: In QA, 100% of sampled requests created while no admins are available enter the pending queue successfully.
- **SC-004**: In QA, 100% of sampled claim attempts on the same pending request result in only one successful claim.
- **SC-005**: In UAT, at least 95% of Booking Agents can identify waiting versus assigned callback requests without ambiguity.
- **SC-006**: In UAT, at least 95% of players who request a callback understand that their request has been submitted for follow-up.
- **SC-007**: In QA, 100% of sampled direct mobile call actions use only configured Booking Agent work contact numbers.
- **SC-008**: In QA, 100% of sampled callback form submissions persist all required fields (player name, phone number, slot from, slot to, player location) and accept optional preferred callback time and note.
- **SC-009**: In QA, 100% of sampled callback form renders show the court rules reminder message without blocking form interaction.
- **SC-010**: In QA, the Call FAB is visible at the bottom of the availability/calendar screen in all tested scroll positions and screen sizes.

## Assumptions

- The existing player availability-check experience is the entry point for the callback request action.
- Booking Agent availability is represented by an explicit manual status toggle, and only explicit Available status is eligible for routing.
- One or two Booking Agents are designated as primary contacts; primary contacts are always tried first for calls and callback routing.
- Callback requests are operational follow-up items and do not themselves create or confirm a reservation automatically.
- Reservation handling continues to be performed by authorized Booking Agents after request assignment or claim.
- Real-time Booking Agent visibility is in scope, but the player does not require live tracking of assignment progress in this feature.