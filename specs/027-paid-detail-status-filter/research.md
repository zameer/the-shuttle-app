# Phase 0 Research: Paid Detail Manual Load Trigger

## Decision 1: Load Trigger Strategy

- Decision: Result data loads only when the admin clicks a dedicated Load Details action.
- Rationale: Satisfies clarified requirement to avoid auto-loading on page open and filter edits.
- Alternatives considered:
  - Auto-load on every filter change (rejected: causes unnecessary fetches and conflicts with clarified expectation).
  - Auto-load on page open only (rejected: still conflicts with explicit manual trigger requirement).

## Decision 2: Draft vs Applied Filter State

- Decision: Keep two filter states in the page: draft filters (editable controls) and applied filters (last loaded values).
- Rationale: Enables admins to adjust filters without mutating currently displayed results until load is clicked.
- Alternatives considered:
  - Single shared state for both editing and data query (rejected: always causes immediate refresh coupling).

## Decision 3: Query Enablement

- Decision: Gate query execution by an explicit load intent flag or applied-filter availability, not by component mount alone.
- Rationale: Prevents initial fetch before user clicks Load Details.
- Alternatives considered:
  - Keep query always enabled and ignore data until load click (rejected: still performs unwanted fetch).

## Decision 4: Pagination Reset Timing

- Decision: Reset pagination to page 1 only when a new load action is executed.
- Rationale: Matches clarified behavior and keeps current result navigation stable while editing filters.
- Alternatives considered:
  - Reset page on each filter input change (rejected: inconsistent with no-auto-load behavior).

## Decision 5: Empty and Pre-Load States

- Decision: Distinguish between pre-load guidance state and true empty-result state after load.
- Rationale: Avoids confusing users with "no data" when no query has been executed yet.
- Alternatives considered:
  - Single empty state for both cases (rejected: ambiguous and potentially misleading).

## Decision 6: Outstanding Booking-Status Filtering

- Decision: Under OUTSTANDING scope, booking-status multi-select remains available and is applied only when load action is triggered.
- Rationale: Preserves existing clarified filtering behavior while aligning with manual-load trigger.
- Alternatives considered:
  - Apply status selection instantly while postponing other filters (rejected: inconsistent interaction model).
