# Feature Specification: Admin Expense Balance

**Feature Branch**: `[031-create-feature-branch]`  
**Created**: 2026-05-06  
**Status**: Draft  
**Input**: User description: "Admin should be able to enter expenses with date, description, amount. very simple form.

add a navigation below PAID BREAKDOWN, and provide an option to calculate the balance amount. it should show after a button click"

## Clarifications

### Session 2026-05-06

- Q: Should Expenses and Balance stay inline on Reports or be a separate page? -> A: Separate page, similar to View Paid Detail.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record Expense Items (Priority: P1)

As an admin, I can enter an expense with date, description, and amount using a simple form so I can track costs alongside booking revenue.

**Why this priority**: Without expense capture, balance calculation is not meaningful.

**Independent Test**: Can be fully tested by opening the expense area, submitting valid values for all three fields, and confirming the expense is saved and visible in the expense records.

**Acceptance Scenarios**:

1. **Given** an admin is viewing the financial area, **When** they submit a valid expense date, description, and amount, **Then** the expense is saved and shown in the expense records.
2. **Given** an admin leaves one or more required fields empty, **When** they attempt to submit, **Then** the system prevents submission and shows clear validation guidance.
3. **Given** an admin enters a non-positive amount, **When** they attempt to submit, **Then** the system rejects the value and requests a valid positive amount.

---

### User Story 2 - Navigate from Paid Breakdown (Priority: P2)

As an admin, I can use a navigation option below PAID BREAKDOWN to open a dedicated expense and balance page quickly.

**Why this priority**: Fast access ensures the new workflow is discoverable in the existing reporting flow.

**Independent Test**: Can be fully tested by viewing PAID BREAKDOWN, activating the new navigation option below it, and confirming the dedicated expense and balance page opens.

**Acceptance Scenarios**:

1. **Given** an admin is on the page containing PAID BREAKDOWN, **When** they view the controls directly below PAID BREAKDOWN, **Then** they can see a navigation option for expenses and balance.
2. **Given** the navigation option is selected, **When** the action completes, **Then** a dedicated expense and balance page is opened without requiring unrelated steps.

---

### User Story 3 - Calculate Balance On Demand (Priority: P3)

As an admin, I can click a calculate action on the expense and balance page to show the balance amount (paid total minus expense total) only when requested.

**Why this priority**: On-demand display reduces visual noise while keeping the metric available when needed.

**Independent Test**: Can be fully tested by entering at least one expense, clicking the calculate action, and confirming the displayed balance equals paid total minus expenses for the active reporting scope.

**Acceptance Scenarios**:

1. **Given** expense and paid totals exist for the active reporting scope, **When** the admin clicks the calculate balance button, **Then** the system displays the computed balance amount.
2. **Given** the admin has not clicked the calculate balance button yet, **When** they are viewing the expense and balance page, **Then** the balance amount is not displayed.
3. **Given** there are no expenses yet, **When** the admin clicks calculate balance, **Then** the system displays a balance equal to the paid total.

---

### Edge Cases

- How does the system behave when the admin submits a very long description (for example, pasted notes)?
- What happens when expense total exceeds paid total and the resulting balance is negative?
- What happens when the paid total for the active reporting scope is zero?
- How does the system handle duplicate-looking entries (same date, description, and amount submitted twice)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an expense entry form for admins with exactly these required fields: date, description, and amount.
- **FR-002**: System MUST validate that all expense form fields are completed before allowing submission.
- **FR-003**: System MUST validate that amount is a positive numeric value before accepting an expense.
- **FR-004**: System MUST save each submitted expense as a distinct expense record with its entered values.
- **FR-005**: System MUST provide a visible navigation option located below PAID BREAKDOWN that opens a dedicated expense and balance page.
- **FR-006**: System MUST provide a calculate balance action on the dedicated expense and balance page.
- **FR-007**: System MUST compute balance as total paid amount minus total expense amount for the active reporting scope.
- **FR-008**: System MUST only display the balance amount after the admin explicitly clicks the calculate balance action.
- **FR-009**: System MUST show clear feedback when expense submission fails validation.
- **FR-010**: System MUST retain submitted expenses so they remain available for subsequent balance calculations in the same reporting scope.

### Key Entities *(include if feature involves data)*

- **Expense Entry**: A cost record entered by an admin with date, description, and amount.
- **Paid Total**: The existing total collected amount shown in PAID BREAKDOWN for the active reporting scope.
- **Balance Summary**: The calculated outcome of paid total minus summed expenses, displayed only after calculation is requested.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of admins can submit a valid expense entry in under 30 seconds on first attempt.
- **SC-002**: 100% of balance calculations match the expected formula (paid total minus expense total) for tested scenarios.
- **SC-003**: At least 90% of admins can find and use the navigation option below PAID BREAKDOWN without assistance.
- **SC-004**: In user acceptance testing, at least 90% of admins confirm that balance appears only after using the calculate action.

## Assumptions

- The feature is available only to admin users who already have access to PAID BREAKDOWN.
- An existing paid total is already available in the current reporting context and can be reused for balance calculation.
- The active reporting scope follows the same period/filter context used by PAID BREAKDOWN.
- Expense records entered through this feature are intended to be included immediately in future balance calculations for the same reporting scope.
- The dedicated expense and balance page follows the same admin route protection model as other report detail pages.
