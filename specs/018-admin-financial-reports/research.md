# Research: Admin Financial Reporting

Feature: 018 - Admin financial reporting by date range
Date: 2026-04-18
Branch: 018-enforce-player-endtime

## Decision 1: Reuse bookings + players tables with no schema change

- Decision: Build reporting from existing `bookings` records (joined with `players` for names) and do not add new tables/views in this feature.
- Rationale: Requested outputs are derivable from existing `status`, `payment_status`, `start_time`, `end_time`, `hourly_rate`, and `total_price` fields, while keeping scope aligned to reporting UI and typed aggregation.
- Alternatives considered:
  - Create a dedicated materialized financial view (rejected for current scope and migration overhead).
  - Add denormalized reporting table (rejected: duplicates source-of-truth and increases sync risk).

## Decision 2: Date policy follows booking start_time day

- Decision: Group and filter by booking overlap in selected range, while day-level grouping references booking `start_time` date to match existing dashboard behavior.
- Rationale: Existing `dashboard_metrics` view already uses `DATE(start_time)`; matching policy avoids conflicting totals across admin views.
- Alternatives considered:
  - Group by end-time date (rejected: inconsistent with existing metrics).
  - Split cross-midnight bookings across days (rejected for this iteration due to complexity and unrequested schema/rule changes).

## Decision 3: One normalized source drives all sections

- Decision: Normalize query rows once in a report service and derive summary, breakdown, pending list, and loss-impact outputs from that shared set.
- Rationale: This guarantees reconciliation between summary totals and breakdown totals and avoids duplicate logic drift.
- Alternatives considered:
  - Separate query per section (rejected: inconsistent totals and extra network load).
  - Compute directly inside UI components (rejected: violates separation of concerns and testability).

## Decision 4: No-show/cancellation lost revenue fallback strategy

- Decision: Lost amount per impacted booking is computed in priority order: `total_price` when present, else `hourly_rate * durationHours`, else `0` with explicit fallback marker.
- Rationale: Covers missing-rate edge cases while keeping report stable and transparent.
- Alternatives considered:
  - Exclude incomplete records from totals (rejected: hides operational loss cases).
  - Treat missing values as hard errors (rejected: breaks reporting continuity).

## Decision 5: Payment-state mapping for report clarity

- Decision: Primary reporting buckets are `PAID` and `PENDING`; null/legacy unknown statuses are included in pending-safe handling and surfaced with explicit labels when relevant.
- Rationale: Business ask is collections-oriented and requires conservative outstanding interpretation.
- Alternatives considered:
  - Ignore null/unknown payment statuses (rejected: underreports outstanding risk).
  - Add third visible "UNKNOWN" section (rejected for this scope; adds UI complexity without explicit requirement).

## Decision 6: Security and access remain existing admin guard + RLS

- Decision: Report route is nested under existing `/admin` protected tree and uses current Supabase RLS policies for bookings/players access.
- Rationale: FR-010 requires admin-only access and current architecture already enforces this at router and DB layers.
- Alternatives considered:
  - Client-side role checks only (rejected: insufficient security boundary).
  - New policy set specifically for reports (rejected: unnecessary for read scope on existing secured tables).