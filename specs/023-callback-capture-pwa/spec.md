# Feature Specification: Callback Capture PWA Upgrade

**Feature Branch**: `[023-new-speckit-spec]`  
**Created**: 2026-04-20  
**Status**: Draft  
**Input**: User description: "request callback form looks ordinary and missing PWA faetures, can you suggest a better approach to capture"

## Clarifications

### Session 2026-04-20

- Q: Should we remove court/rules wording across the whole spec or only in player-facing callback flow text and labels? → A: Remove it only in player-facing callback flow text and labels.
- Q: What should replace the Step 1 title "Who are you"? → A: Use "Could you please mention".
- Q: Where should preferred callback time be collected? → A: Step 2.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fast Guided Callback Capture (Priority: P1)

As a player, I want a guided callback request experience that feels quick and modern, so I can submit a request with minimal effort.

**Why this priority**: The callback form is currently perceived as ordinary and not compelling. Improving first-time completion directly affects lead capture.

**Independent Test**: A player can open the callback flow, complete it with minimal steps, and receive clear confirmation without confusion.

**Acceptance Scenarios**:

1. **Given** the player opens callback request from the public page, **When** the form is shown, **Then** the flow presents clear step-by-step guidance instead of a plain single block form, and Step 1 shows the title "Could you please mention".
2. **Given** the player is entering details, **When** each field is completed, **Then** the system provides immediate, clear validation and plain-language guidance, and Step 2 collects slot start, slot end, location, and preferred callback time.
3. **Given** required details are complete, **When** the player submits, **Then** the system confirms successful capture with a clear next-step message.

---

### User Story 2 - Reliable Capture in Weak or No Network (Priority: P1)

As a player on unstable mobile data, I want my callback request to be safely captured even when connectivity drops, so I do not lose my request.

**Why this priority**: Public players frequently use mobile networks; failed submissions create frustration and lost callbacks.

**Independent Test**: A player can complete a callback request while offline or with intermittent connectivity, and the request is submitted when connectivity returns.

**Acceptance Scenarios**:

1. **Given** the player has no connectivity, **When** they submit the callback request, **Then** the request is saved as pending and the player is informed it will be sent automatically when online.
2. **Given** a request is pending due to connectivity, **When** connectivity returns, **Then** the system submits the request without requiring the player to re-enter details.
3. **Given** pending requests exist, **When** the player reopens the app/page, **Then** they can see pending or sent status for their latest callback request.

---

### User Story 3 - App-Like Repeat Access for Returning Players (Priority: P2)

As a returning player, I want an app-like callback experience on mobile, so I can request a callback quickly on repeat visits.

**Why this priority**: Better repeat access improves conversion for players who check slot availability frequently.

**Independent Test**: A returning player can access callback capture from a home-screen style launch and submit with fewer interactions than first-time use.

**Acceptance Scenarios**:

1. **Given** a compatible device and browser, **When** the player revisits multiple times, **Then** they are offered a clear path to add the experience to their home screen.
2. **Given** the player launches from a home-screen shortcut, **When** they open callback capture, **Then** the flow loads quickly with app-like presentation and continuity.
3. **Given** previously entered non-sensitive preferences (such as preferred contact window), **When** the player starts a new request, **Then** those preferences are pre-filled with the option to edit.

### Edge Cases

- Player starts callback capture just before device time changes (timezone change or midnight rollover).
- Player submits multiple callback requests while offline; system must preserve order and status clarity.
- Player closes the app immediately after offline submission; pending request must persist.
- Duplicate submission attempts happen due to repeated taps during unstable connectivity.
- Player denies optional app-like prompts; callback capture must remain fully usable in browser mode.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a guided callback capture flow that feels structured and clearer than a plain static form.
- **FR-002**: The system MUST provide inline validation and field-level guidance before final submission.
- **FR-003**: The system MUST present a completion confirmation that explains what happens next and expected response timing.
- **FR-004**: The system MUST allow callback requests to be captured when the device is offline or network quality is poor.
- **FR-005**: The system MUST persist pending callback requests locally until they are successfully sent.
- **FR-006**: The system MUST automatically retry pending callback requests when connectivity returns.
- **FR-007**: The system MUST prevent duplicate callback creation caused by repeated submit actions.
- **FR-008**: The system MUST show player-visible status for the latest callback request (for example: pending, sent, failed and retrying).
- **FR-009**: The system MUST provide an app-like repeat access path for compatible devices, including a clear add-to-home-screen style entry point.
- **FR-010**: The system MUST keep callback capture fully functional for players who do not use app-like install prompts.
- **FR-011**: The system MUST pre-fill previously saved non-sensitive callback preferences for returning players while allowing edits before submit.
- **FR-012**: The system MUST preserve callback capture data across app/page reloads until request submission outcome is finalized.
- **FR-013**: The system MUST use callback-flow player-facing copy that avoids court/rules terminology, favoring slot/location phrasing.
- **FR-014**: The system MUST label Step 1 with the exact player-facing title "Could you please mention".
- **FR-015**: The system MUST collect preferred callback time in Step 2 (with scheduling/location fields), while Step 3 focuses on note, review, and final submission.

### Key Entities *(include if feature involves data)*

- **Callback Capture Draft**: A partially or fully completed callback request that has not yet been confirmed as sent.
- **Callback Submission Record**: A callback request instance with lifecycle status (pending, retrying, sent, failed).
- **Player Capture Preference**: Reusable non-sensitive preferences for faster repeat callback submission.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of players can complete callback capture in under 60 seconds on first attempt.
- **SC-002**: Callback capture completion rate improves by at least 25% versus the current baseline form within 30 days of release.
- **SC-003**: At least 95% of offline-captured callback requests are successfully submitted automatically once connectivity is restored.
- **SC-004**: Duplicate callback submissions from repeated tap behavior are reduced to under 1% of total callback requests.
- **SC-005**: At least 70% of repeat mobile players complete a callback request in fewer steps than first-time players.

## Assumptions

- Existing callback processing and admin queue behavior remain unchanged; this feature focuses on capture experience and resilience.
- Offline persistence applies only to callback capture data relevant to request submission and not to unrelated page content.
- Players may use either browser mode or installed app-like mode; both are supported in scope.
- Existing privacy and data handling rules for callback requests continue to apply without schema changes for this specification phase.
