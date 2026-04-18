# Feature Specification: Fix Paid Modal UI

**Feature Branch**: `020-fix-paid-modal-ui`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "view paid details modal built in 019 has UI/UX issues, first record hidden on top, there is no close icon button, pagination area is not properly showing. and also show PAID breakdown section last"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Read Paid Entries Clearly in Modal (Priority: P1)

As an admin, I want the paid-details modal content to be fully visible from the first record onward so I can review paid entries without losing data at the top of the list.

**Why this priority**: If the first entry is hidden or clipped, the primary purpose of the modal is compromised and report review becomes unreliable.

**Independent Test**: Open the paid-details modal on a date range with paid entries and verify the first record is fully visible immediately without requiring corrective scrolling tricks.

**Acceptance Scenarios**:

1. **Given** the admin opens paid details, **When** the modal appears, **Then** the first paid entry is fully visible and not cut off at the top.
2. **Given** there are multiple paid entries, **When** the admin scrolls within the modal, **Then** content remains within the visible viewport and does not overlap fixed areas.
3. **Given** there are no paid entries, **When** the modal opens, **Then** an empty-state message is fully visible and not clipped.

---

### User Story 2 - Close and Navigate Paid Modal Reliably (Priority: P1)

As an admin, I want a clear close icon and correctly presented pagination controls in the paid-details modal so I can quickly dismiss the modal and move across pages during financial review.

**Why this priority**: Review workflows depend on fast close and page navigation; missing or visually broken controls block practical use.

**Independent Test**: Open the modal on multi-page paid data, verify a visible close icon is present, then move between pages and confirm pagination controls and page indicators remain fully visible and usable.

**Acceptance Scenarios**:

1. **Given** the paid-details modal is open, **When** the admin checks modal actions, **Then** a visible close icon button is present and closes the modal.
2. **Given** paid entries span more than one page, **When** the admin uses pagination controls, **Then** previous/next actions and page indicator are visible and function correctly.
3. **Given** the admin is on the first or last page, **When** pagination controls are shown, **Then** disabled states are clearly communicated without layout breakage.
4. **Given** the modal is displayed on smaller viewports, **When** pagination is rendered, **Then** controls remain visible and actionable without clipping.

---

### User Story 3 - Keep Paid Breakdown Action at Bottom of Report (Priority: P2)

As an admin, I want the PAID breakdown section to appear last in the report layout so the detail action appears after summary and other operational sections.

**Why this priority**: This preserves a top-down review flow where core summary and pending follow-up are reviewed before deep paid detail.

**Independent Test**: Load the report page and verify the PAID breakdown section is positioned after the other report sections.

**Acceptance Scenarios**:

1. **Given** the report page is loaded, **When** sections are rendered in order, **Then** the PAID breakdown section is last.
2. **Given** report data updates for a different date range, **When** the page re-renders, **Then** the PAID breakdown section remains last.

### Edge Cases

- The paid modal contains only one page of entries; pagination area still renders clearly without crowding.
- The paid modal contains many pages; controls remain visible and stable while paging.
- The paid modal is opened on narrow mobile width; first row and action controls remain visible without overlap.
- The report has zero paid entries; the open action and modal empty state remain understandable.
- The report has mixed paid and pending data; section ordering still keeps PAID breakdown last.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render the paid-details modal so the first record is fully visible on open.
- **FR-002**: The paid-details modal MUST include a visible close icon button.
- **FR-003**: The close icon button MUST dismiss the modal reliably.
- **FR-004**: The paid-details modal MUST display pagination controls and page indicator in a fully visible, usable layout.
- **FR-005**: Pagination controls MUST preserve correct enabled/disabled behavior at page boundaries.
- **FR-006**: The paid-details modal MUST maintain a clear empty state when no paid entries exist.
- **FR-007**: The report page MUST place the PAID breakdown section after summary, outstanding pending, and revenue impact sections.
- **FR-008**: The PAID breakdown section order MUST remain stable across date-range changes.
- **FR-009**: Access control for the report and modal MUST remain limited to authorized admin users.

### Key Entities *(include if feature involves data)*

- **Paid Details Modal View State**: Open/closed state, current page, and visible entries for paid records.
- **Pagination Control State**: Current page, total pages, and boundary disable states.
- **Report Section Order**: The render order of summary, outstanding pending, revenue impact, and paid breakdown sections.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In QA, 100% of sampled paid-modal opens show the first record fully visible without clipping.
- **SC-002**: In QA, 100% of sampled modal sessions show a visible close icon button that closes the modal in one interaction.
- **SC-003**: In QA, pagination controls and page indicator render correctly and remain usable in 100% of sampled one-page and multi-page datasets.
- **SC-004**: In QA, the PAID breakdown section appears last in 100% of sampled report renders and date-range changes.
- **SC-005**: In UAT, at least 95% of admins can complete paid-detail review and close the modal without UI confusion.

## Assumptions

- The data and aggregation behavior from feature 019 remain unchanged; this feature targets presentation and layout issues.
- Existing report authorization and route protection continue to apply.
- Existing pagination logic remains functionally correct; only visibility/usability issues are addressed.
- No database schema or migration changes are required.