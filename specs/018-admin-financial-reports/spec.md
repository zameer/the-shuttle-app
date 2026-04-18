# Feature Specification: Admin Financial Reporting

**Feature Branch**: `018-enforce-player-endtime`  
**Created**: 2026-04-18  
**Status**: Draft  
**Input**: User description: "Admin need comprehensive reports for following scenarios with date range support NOR player selection 01. PAID vs PENDING, hours and amount 02. Breakdown PAID and PENDING 03. List of players with outstading pending, includes slot information as well 04 No Show/Cancellation Financial impact, revenue lost"

## Clarifications

### Session 2026-04-18

- Q: Should User Story 2 breakdown include player information? → A: Yes, include player information in the PAID and PENDING breakdown.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Date-Range Payment Summary (Priority: P1)

As an admin, I want a date-range report that compares PAID vs PENDING by total hours and total amount so I can quickly understand collected and outstanding revenue.

**Why this priority**: This is the primary financial-control view needed for daily and period-end monitoring.

**Independent Test**: Select a date range and verify the report shows separate PAID and PENDING totals for both booked hours and monetary amount without requiring player selection.

**Acceptance Scenarios**:

1. **Given** the admin opens the report page, **When** a date range is applied, **Then** the system shows PAID and PENDING totals for hours and amount for that range.
2. **Given** no player filter is selected, **When** the report is generated, **Then** results include all players in the selected date range.
3. **Given** the selected range has no bookings, **When** the summary is shown, **Then** PAID and PENDING totals display as zero values.

---

### User Story 2 - Detailed Paid/Pending Breakdown with Player Information (Priority: P1)

As an admin, I want a breakdown view for PAID and PENDING values with player information so I can analyze where receivables and collections are concentrated.

**Why this priority**: A summary alone is insufficient for operational follow-up and accounting review.

**Independent Test**: Generate the report for a date range and verify detailed PAID/PENDING breakdown entries include player information and maintain consistent totals matching the summary section.

**Acceptance Scenarios**:

1. **Given** a valid date range, **When** the report loads, **Then** PAID and PENDING breakdown sections are shown separately.
2. **Given** breakdown sections are shown, **When** their values are aggregated, **Then** they reconcile with the overall PAID and PENDING totals.
3. **Given** a breakdown entry is shown, **When** the admin reviews it, **Then** player information is visible for that entry.
4. **Given** one payment state has no matching bookings, **When** the breakdown is rendered, **Then** that section still appears with zero values.

---

### User Story 3 - Outstanding Pending by Player with Slot Details (Priority: P1)

As an admin, I want a list of players with outstanding pending payments including slot details so I can perform targeted follow-up.

**Why this priority**: Collections workflow depends on knowing exactly who owes payment and for which slots.

**Independent Test**: Run the report for a date range and verify each pending player entry includes outstanding amount and associated slot information.

**Acceptance Scenarios**:

1. **Given** there are pending bookings in the selected date range, **When** the outstanding list is displayed, **Then** each listed player includes pending amount and slot information.
2. **Given** a player has multiple pending slots, **When** their row is viewed, **Then** all relevant slot details are visible or accessible in that row.
3. **Given** there are no pending bookings, **When** the section is displayed, **Then** an empty-state message is shown with zero outstanding total.

---

### User Story 4 - No-Show/Cancellation Financial Impact (Priority: P2)

As an admin, I want a financial impact report for no-show and cancelled bookings so I can quantify revenue lost for a selected period.

**Why this priority**: This improves business decision-making by exposing avoidable revenue leakage.

**Independent Test**: Select a date range containing no-show and cancelled bookings and verify the report shows lost revenue totals and hours for each category.

**Acceptance Scenarios**:

1. **Given** no-show and cancelled bookings exist in the selected date range, **When** the impact report is shown, **Then** lost revenue is reported separately for no-show and cancellation.
2. **Given** impacted bookings exist, **When** totals are displayed, **Then** lost hours and lost amount are both shown.
3. **Given** no impacted bookings exist, **When** the section renders, **Then** lost revenue and lost hours are shown as zero.

### Edge Cases

- Date range start and end are the same day.
- Date range is very large and includes high booking volume.
- Bookings that cross midnight are counted consistently based on the existing reporting date policy.
- A booking changes payment status during the selected period; report reflects latest persisted status at query time.
- No-show or cancellation records with missing rate information still produce a stable, clearly marked fallback value.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow admins to generate financial reports using a selected date range.
- **FR-002**: The system MUST show PAID and PENDING totals for both booked hours and amount within the selected range.
- **FR-003**: The system MUST generate reports without requiring player selection, defaulting to all players in scope.
- **FR-004**: The system MUST provide a detailed breakdown view for PAID and PENDING values that includes player information and reconciles with summary totals.
- **FR-005**: The system MUST provide a list of players with outstanding pending payments.
- **FR-006**: Each outstanding pending entry MUST include associated slot information.
- **FR-007**: The system MUST report no-show and cancellation financial impact as revenue lost for the selected range.
- **FR-008**: The no-show/cancellation section MUST show both lost hours and lost amount.
- **FR-009**: The system MUST show explicit zero-value states for report sections when no matching records exist.
- **FR-010**: The system MUST limit access to these financial reports to admin-authorized users only.

### Key Entities *(include if feature involves data)*

- **Report Date Range**: Start and end dates used to scope all report calculations.
- **Payment Summary Totals**: Aggregated PAID and PENDING hours and amounts for the selected range.
- **Payment Breakdown Entry**: Detailed row contributing to PAID or PENDING totals, including player information.
- **Outstanding Pending Player Record**: Player-level pending balance with related slot details.
- **Revenue Loss Record**: No-show or cancellation entry contributing to lost hours and lost amount.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In QA, 100% of generated reports for sampled date ranges return PAID and PENDING totals for both hours and amount.
- **SC-002**: In QA, 100% of breakdown totals reconcile with summary totals for sampled date ranges.
- **SC-003**: In QA, 100% of pending-player report entries include slot information.
- **SC-004**: In QA, no-show/cancellation lost revenue totals are correctly shown for 100% of sampled impacted date ranges.
- **SC-005**: In UAT, admins can complete end-to-end financial review for a selected date range without applying player filters in at least 95% of sampled sessions.

## Assumptions

- Existing booking, payment, booking status, and pricing data are sufficient to derive all requested report outputs.
- Player selection is intentionally not required for report generation in this feature scope.
- Existing admin authorization controls are reused for report access.
- Report values are based on persisted system records at the time the report is generated.
