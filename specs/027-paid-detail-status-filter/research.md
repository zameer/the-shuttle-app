# Phase 0 Research: Paid Detail Status + Booking-Status Filters

## Decision 1: Status Scope Model

- Decision: Introduce a two-value status scope filter with values `PAID` and `OUTSTANDING`, defaulting to `PAID` on first load.
- Rationale: Matches clarified requirement and preserves existing user expectation of paid-first behavior.
- Alternatives considered:
  - Single `OUTSTANDING`-only mode (rejected: would remove existing paid-focused workflow).
  - More than two scope options (rejected: unnecessary complexity for current spec).

## Decision 2: Booking-Status Multi-Select Applicability

- Decision: Show booking-status multi-select only when scope is `OUTSTANDING`; defaults include `CONFIRMED`, `CANCELLED`, and `NO_SHOW` all selected.
- Rationale: Clarified requirement explicitly targets outstanding review while avoiding additional controls in paid mode.
- Alternatives considered:
  - Always-visible booking-status filter for both scopes (rejected: adds cognitive load for PAID mode with no stated need).
  - Preset tabs (All/Confirmed/Cancelled/No Show) instead of multi-select (rejected: less flexible than explicit multi-select).

## Decision 3: Filter-State Location and Validation

- Decision: Keep scope + date + outstanding booking-status selections in page-level state and validate boundary inputs with Zod schemas.
- Rationale: Existing page already manages date state; co-locating filter state simplifies synchronization and pagination reset rules.
- Alternatives considered:
  - Store filter state in global context (rejected: unnecessary scope for one route-level page).
  - Rely on implicit casting without schemas (rejected: violates type-safety principle for boundary data).

## Decision 4: Service-Layer Filtering and Summary Computation

- Decision: Apply scope and booking-status filtering in service/hook layer before returning rows and summary values.
- Rationale: Preserves data-integrity principle by avoiding business logic inside UI rendering components.
- Alternatives considered:
  - UI-level post-filtering after fetch (rejected: duplicates logic and risks inconsistent summary calculations).
  - Separate backend endpoint/RPC (rejected: no schema/API changes needed for this feature).

## Decision 5: Outstanding Semantics

- Decision: Treat `OUTSTANDING` as rows not bucketed as `PAID` in existing payment-bucket logic, then apply selected booking-status filters.
- Rationale: Aligns with current financial-report normalization and avoids introducing new payment-state taxonomy.
- Alternatives considered:
  - Restrict OUTSTANDING to only `PENDING` booking status (rejected: conflicts with clarified requirement to include confirmed/cancelled/no-show outcomes when unpaid).

## Decision 6: UX Behavior on Filter Changes

- Decision: Reset pagination to page 1 when scope, booking-status selection, or date range changes.
- Rationale: Prevents invalid page indices and stale result windows after filter narrowing.
- Alternatives considered:
  - Preserve current page number always (rejected: can produce empty pages and confusing UX).
