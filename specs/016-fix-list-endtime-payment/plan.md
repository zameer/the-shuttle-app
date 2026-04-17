# Implementation Plan: List End-Time and Payment Visibility

**Branch**: `016-setup-feature-branch` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/016-fix-list-endtime-payment/spec.md`

## Summary

Fix three list-view bugs: (1) list schedule window ends 30 minutes earlier than the calendar because both `deriveSlotRows` and `deriveAdminListRows` hardcode `SCHEDULE_END_HOUR = 22` instead of reading `court_close_time` from `court_settings`; (2) bookings whose end time crosses the schedule boundary are clamped in list derivation but not in the calendar, causing visible divergence; (3) admin list rows do not display payment status. The fix is a display/derivation-layer change only — no DB changes required.

## Technical Context

**Language/Version**: TypeScript 6.0.2 with React 19.2.4  
**Primary Dependencies**: date-fns 4.1.0, React Query 5.99.0, Supabase 2.103.0, Tailwind CSS 3.4.17, shadcn/ui, lucide-react 1.8  
**Storage**: Supabase PostgreSQL — read-only; no schema changes. `bookings` and `court_settings` tables are the data sources.  
**Testing**: `npm run lint` (ESLint); manual QA against acceptance scenarios in spec.md  
**Target Platform**: Web — mobile (≥375 px), tablet (≥768 px), desktop (≥1280 px)  
**Project Type**: Web application (React SPA)  
**Performance Goals**: Derivation is synchronous and runs on already-fetched data; no additional network calls introduced  
**Constraints**: Pure display-layer change; must not regress existing booking visibility or past-date suppression behavior  
**Scale/Scope**: 3 files modified (deriveSlotRows.ts, deriveAdminListRows.ts, AdminListView.tsx); 2 supporting components updated (PlayerListView.tsx, callers of derive functions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Spec-First**: `specs/016-fix-list-endtime-payment/spec.md` exists with 3 prioritized user stories (P1/P2) and independently testable acceptance scenarios. All planned changes trace to a user story.
- [x] **II. Type Safety**: No `any` introduced. `paymentStatus` field on `AdminListRow` is typed as `NormalizedPaymentStatus | undefined`. `scheduleEndHour` parameter is `number`. No cross-boundary data — derivation functions consume already-validated in-memory `Booking[]`.
- [x] **III. Component Reusability**: Payment status display reuses `getPaymentStatusPillClassName` + `getPaymentStatusLabel` from existing `paymentStatus.ts`. No business logic in UI components. Fix lives in derivation layer (`src/features/*/calendar/derive*.ts`), not in rendering components.
- [x] **IV. Data Integrity & Security**: No new tables; no RLS changes. Admin payment status is shown only in admin list view (existing admin auth guard applies). Payment data flows read-only from existing Supabase query.
- [x] **V. Responsive Design**: `AdminListView.tsx` uses existing Tailwind responsive classes; payment badge will follow same `px-2 py-0.5 text-xs` pattern used elsewhere. Player list view layout unchanged. No new breakpoints required.

### Constitution Exceptions

None.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
## Project Structure

### Documentation (this feature)

```text
specs/016-fix-list-endtime-payment/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── list-view-row.ts # Typed row interface contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command — NOT created by /speckit.plan)
```

### Source Code (files touched by this feature)

```text
src/
├── features/
│   ├── players/
│   │   └── calendar/
│   │       ├── deriveSlotRows.ts          # Fix: remove effectiveEnd clamp; accept scheduleEndHour param
│   │       └── PlayerListView.tsx          # Fix: pass scheduleEndHour from court_settings
│   ├── admin/
│   │   ├── calendar/
│   │   │   └── deriveAdminListRows.ts      # Fix: remove effectiveBEnd clamp; add paymentStatus to AdminListRow; accept scheduleEndHour
│   │   └── AdminListView.tsx               # Fix: pass scheduleEndHour; render payment status pill on booking rows
│   └── booking/
│       └── paymentStatus.ts               # No change — reused as-is
└── hooks/
    └── (no changes)
```

## Complexity Tracking

No constitution violations. No exceptions required.

---

## Phase 0 Research Summary

All clarifications resolved. See [research.md](./research.md) for full decision log.

| Unknown | Resolution |
|---------|------------|
| Root cause of 30-min shortfall | Booking end-time clamped to hardcoded `SCHEDULE_END_HOUR=22` in derive functions; calendar WeekView reads `court_close_time` from DB and uses `Math.ceil()` → divergence when bookings cross 22:00 |
| Why booking invisible past boundary | `effectiveEnd = bookingEnd > scheduleEnd ? scheduleEnd : bookingEnd` in both derive functions; calendar positions blocks by raw `booking.end_time` |
| Payment status data availability | `booking.payment_status: PaymentStatus \| null` already on `Booking` interface; `paymentStatus.ts` has all normalization helpers |
| New dependencies needed | None — reuse existing `normalizePaymentStatus`, `getPaymentStatusLabel`, `getPaymentStatusPillClassName` |
| Schema changes needed | None |

---

## Phase 1 Design

### Key Design Decisions

**D1 — Remove booking end-clamp in derivation**  
In both `deriveSlotRows` and `deriveAdminListRows`, change:
```ts
// Before (causes truncation):
const effectiveEnd = bookingEnd > scheduleEnd ? scheduleEnd : bookingEnd

// After (preserves full booking visibility):
const effectiveEnd = bookingEnd  // actual booking end, unclamped
```
The tail fill of available slots still uses `scheduleEnd` as its upper boundary (unchanged).

**D2 — Pass `scheduleEndHour` as parameter**  
Add `scheduleEndHour?: number` (default `SCHEDULE_END_HOUR`) to both derive functions. Callers (`PlayerListView`, `AdminListView`) read from already-loaded `court_settings` and pass `Math.ceil(timeStrToHours(settings.court_close_time))`. This aligns the list window with the calendar without adding a new query.

**D3 — Add `paymentStatus` to `AdminListRow`**  
```ts
export interface AdminListRow {
  // ... existing fields ...
  paymentStatus?: NormalizedPaymentStatus  // undefined for 'available' rows
}
```
`deriveAdminListRows` populates it via `normalizePaymentStatus(booking.payment_status)` only for `type === 'booking'` rows.

**D4 — Render payment badge in `AdminListView`**  
For `row.type === 'booking'` rows, render:
```tsx
{row.paymentStatus && row.paymentStatus !== 'UNKNOWN' && (
  <span className={cn('text-xs border rounded-full px-2 py-0.5 shrink-0',
    getPaymentStatusPillClassName(row.paymentStatus))}>
    {getPaymentStatusLabel(row.paymentStatus)}
  </span>
)}
```
Unknown status falls back to no badge (FR-007: available rows must not show status; UNKNOWN is not informative to admin).

### Files Changed

| File | User Story | Change |
|------|------------|--------|
| `src/features/players/calendar/deriveSlotRows.ts` | US1, US2 | Remove effectiveEnd clamp; add `scheduleEndHour` param |
| `src/features/admin/calendar/deriveAdminListRows.ts` | US1, US2, US3 | Same clamp fix; add `scheduleEndHour` param; add `paymentStatus` to `AdminListRow` |
| `src/features/admin/AdminListView.tsx` | US1, US3 | Pass `scheduleEndHour`; render payment status pill |
| `src/features/players/calendar/PlayerListView.tsx` | US1 | Pass `scheduleEndHour` from court_settings |

