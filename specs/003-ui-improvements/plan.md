# Implementation Plan: UI Improvements and Search Enhancements

**Branch**: `003-ui-improvements` | **Date**: April 15, 2026 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-ui-improvements/spec.md`

---

## Summary

This feature delivers **6 incremental UI/UX improvements** to the badminton court booking system:

1. **Player Search (US1, P1)**: Extend admin player search to support both name and mobile number criteria
2. **Sticky Calendar Headers (US2, P1)**: Fix calendar headers during scrolling for better context retention
3. **Payment Status Display (US3, P2)**: Add payment status indicators to admin calendar view
4. **Mobile Form Button (US4, P2)**: Ensure booking form submit button is accessible on mobile devices
5. **Admin Mobile Menu (US5, P1)**: Make admin navigation responsive for small screens
6. **Time Adjustment (US6, P2)**: Add admin facility to modify booking duration/time

All features are built on the established tech stack (React 19.2 + Tailwind CSS 3.4 + Supabase) and leverage existing components and patterns from the 002-admin-booking-details feature.

---

## Technical Context
- **Frontend Framework**: React 19.2 + Vite 8.0 + TypeScript 6.0
- **Styling**: Tailwind CSS 3.4 + shadcn/ui components
  - Available UI components: `Button`, `Dialog`, `Badge` (from `src/components/ui/`)
  - Layout system: Flexbox + Tailwind grid responsive utilities
- **State Management**: React Query (@tanstack/react-query 5.99)
- **Authentication**: Supabase Auth with custom `isAdmin` flag via `admin_users` table
- **Date/Time**: date-fns 4.1 for formatting and manipulation
- **Backend Database**: Supabase PostgreSQL with RLS policies
- **Icons**: lucide-react 1.8

## Constitution Check

*GATE: Template constitution is placeholder; no formal principles defined yet. Proceeding with tech stack consistency check.*

✅ **Tech Stack Consistency**: All 6 user stories use established stack (React 19.2, Tailwind 3.4, shadcn/ui, React Query 5.99)  
✅ **Scope Boundaries**: Feature scope well-defined with 6 independent user stories; no new tech dependencies introduced  
✅ **Data Compatibility**: No schema changes required; all features use existing bookings/players tables and RLS policies  
✅ **Component Reuse**: Leverages existing components (Button, Dialog, Badge, Combobox from shadcn/ui); extends existing hooks (useBookings, useAuth)  
✅ **Mobile-First Approach**: All features explicitly address mobile responsiveness (375px minimum screen width)

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-improvements/
├── spec.md              # Feature specification
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Research & clarifications resolution
├── data-model.md        # Phase 1: Data entities and relationships
├── quickstart.md        # Phase 1: Implementation quickstart guide
├── contracts/           # Phase 1: Interface contracts
│   ├── PlayerSearch.ts  # Player search query/response contract
│   ├── BookingTime.ts   # Time adjustment contract
│   └── CalendarUI.ts    # Calendar header/payment status contract
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

```text
frontend/ (TypeScript/React)
├── src/
│   ├── components/
│   │   ├── shared/
│   │   │   ├── calendar/
│   │   │   │   ├── MonthView.tsx          # (US2) Add sticky header
│   │   │   │   ├── WeekView.tsx           # (US2) Add sticky header
│   │   │   │   └── CalendarContainer.tsx  # Header container
│   │   │   └── Calendar.tsx
│   │   ├── ui/
│   │   │   ├── badge.tsx                  # (US3) Payment status badge
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── combobox.tsx               # (US1) Player search base
│   │   └── StatusBadge.tsx
│   ├── features/
│   │   ├── booking/
│   │   │   ├── BookingDetailsModal.tsx    # (US6) Add time adjustment UI
│   │   │   ├── BookingForm.tsx            # (US4) Mobile button visibility
│   │   │   ├── PlayerSelectCombobox.tsx   # (US1) Extend with name search
│   │   │   └── useBookings.ts
│   │   └── admin/
│   │       └── AdminCalendarPage.tsx      # (US3) Payment status display
│   ├── layouts/
│   │   └── AdminLayout.tsx                # (US5) Mobile menu responsiveness
│   ├── lib/
│   │   └── utils.ts
│   └── services/
│       └── supabase.ts
├── tailwind.config.js                     # (US2, US4, US5) Responsive utilities
└── tsconfig.json

backend/ (Supabase)
├── supabase/
│   ├── migrations/
│   │   └── [existing schema]              # No new migrations required
│   └── config.toml
```

**Structure Decision**: Feature is integrated into existing web application structure. No new folders required; modifications are localized to 5-6 existing component files and utility enhancements. All changes leverage established Tailwind CSS responsive utilities and React patterns.

## Complexity Tracking

> **No Constitution violations identified.** All 6 user stories use established tech stack and patterns. No scope violations or architectural concerns.

---

## Phase 0: Research & Clarifications

### Clarifications Status

✅ **All clarifications from specification are resolved**:
- Tech stack consistency verified (React 19.2 + Tailwind 3.4 + shadcn/ui + React Query 5.99)
- Component reuse patterns documented for each user story
- No external dependencies or new library integrations required
- RLS policy enforcement confirmed compatible with existing bookings/players tables

### Research Topics

| Topic | Status | Findings |
|-------|--------|----------|
| **Sticky positioning support in Tailwind** | ✅ Complete | Tailwind 3.4 provides `sticky` utility; Z-index management needed for overlays |
| **React Query hooks for dual-field search** | ✅ Complete | Existing `useBookings()` can be extended; filter client-side by name or mobile |
| **Payment status badge styling** | ✅ Complete | Use existing `Badge` component with conditional variant (bg-green/yellow/red) |
| **Mobile form accessibility patterns** | ✅ Complete | Fixed footer button pattern using `absolute bottom-0` or flex gap with flex-grow content |
| **Admin menu responsive patterns** | ✅ Complete | Hamburger menu (md breakpoint); existing AdminLayout can use Tailwind's responsive utilities |
| **Date-fns time arithmetic** | ✅ Complete | `addMinutes()`, `subMinutes()`, `isBefore()` for time validation and conflict detection |

### Output

Research findings documented in [research.md](./research.md)

---

## Phase 1: Design & Implementation Planning

### 1A. Data Model

**Entities** (no schema changes required; existing tables only):

- **Player** (existing `players` table)
  - `phone_number` (PK)
  - `name` (TEXT) - ✅ Already exists; used for search
  - `address` (TEXT) - ✅ Already exists
  
- **Booking** (existing `bookings` table)
  - `id` (UUID)
  - `player_phone_number` (FK)
  - `start_time`, `end_time` (TIMESTAMPTZ)
  - `status` (PENDING | CONFIRMED | UNAVAILABLE)
  - `payment_status` (PENDING | PAID) - ✅ Already exists; used for display
  - `hourly_rate`, `total_price`
  
**Relationships**:
- Booking → Player (many-to-one via `player_phone_number`)
- Admin can query bookings and update `start_time`, `end_time`, `payment_status`
- RLS ensures: admins see all data; public users see status only (no player names)

### 1B. Interface Contracts

Contracts specify query/response shapes:

**PlayerSearch.ts** (US1 - Dual search):
```typescript
interface PlayerSearchQuery {
  searchTerm: string;        // Name or mobile number to search
  limit?: number;            // Default 10
}

interface PlayerSearchResult {
  phone_number: string;      // PK
  name: string;
  bookingCount?: number;     // Optional context
}
```

**BookingTime.ts** (US6 - Time adjustment):
```typescript
interface TimeAdjustmentRequest {
  bookingId: string;
  startTime?: string;        // ISO 8601 datetime
  endTime?: string;          // ISO 8601 datetime
  durationMinutes?: number;  // Alternative to endTime
}

interface TimeValidationResult {
  isValid: boolean;
  conflictingBookings?: Booking[];
  errorMessage?: string;
}
```

**CalendarUI.ts** (US2, US3 - Sticky headers + Payment status):
```typescript
interface CalendarHeaderConfig {
  position: 'sticky';        // CSS position
  zIndex: number;            // Overlap management
  backgroundColor: string;
}

interface BookingWithPayment extends Booking {
  paymentStatus: 'PAID' | 'PENDING' | 'UNPAID';
  paymentBadgeVariant: 'default' | 'secondary' | 'destructive';
}
```

Output: Contracts documented in `/contracts/` directory

### 1C. Implementation Quickstart

**By User Story**:

| US | Component(s) | Changes | Estimated Effort |
|----|--------------|---------|------------------|
| **US1** | `PlayerSelectCombobox.tsx` | Extend to query by name OR mobile; add search filter logic | 2-3 hours |
| **US2** | `MonthView.tsx`, `WeekView.tsx` | Add `sticky top-0` + z-index management to header wrapper | 1-2 hours |
| **US3** | `MonthView.tsx`, `BookingDetailsModal.tsx` | Add payment_status badge using Badge component; conditional styling | 1-2 hours |
| **US4** | `BookingForm.tsx` | Refactor layout: fixed footer button or sticky submit bar on mobile | 1.5-2 hours |
| **US5** | `AdminLayout.tsx` | Add hamburger menu for mobile (<md breakpoint); responsive nav items | 2-3 hours |
| **US6** | `BookingDetailsModal.tsx` | Add time picker/adjuster UI; integrate date-fns for validation; update booking via mutation | 3-4 hours |

**Total Estimated**: 11-16 hours of implementation (excluding testing/QA)

### 1D. Agent Context Update

Executed `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`  
Agent context updated with:
- React 19.2.4 + TypeScript 6.0.2 stack
- Tailwind CSS 3.4.17 responsive utilities
- shadcn/ui component patterns
- React Query 5.99.0 hook patterns
- Supabase integration approach

### 1E. Pre-Implementation Checklist

- ✅ Tech stack confirmed consistent with 002-admin-booking-details
- ✅ No new database migrations required
- ✅ No new external dependencies needed
- ✅ All 6 user stories have independent implementation paths
- ✅ Mobile responsiveness requirements documented (375px minimum)
- ✅ RLS policy compatibility verified
- ✅ Existing React Query hooks sufficient (no new hooks required)
- ✅ Tailwind utilities sufficient (no custom CSS required)

---

## Phase 2: Task Generation

This phase outputs `/specs/003-ui-improvements/tasks.md` via `/speckit.tasks` command.

**Next Step**: Run `/speckit.tasks` to generate actionable, dependency-ordered implementation tasks.

---

## Outputs Summary

- ✅ [research.md](./research.md) - Research findings and clarifications
- ✅ [data-model.md](./data-model.md) - Entity relationships and data structure
- ✅ [contracts/](./contracts/) - Interface contracts (PlayerSearch.ts, BookingTime.ts, CalendarUI.ts)
- ✅ [quickstart.md](./quickstart.md) - Implementation quickstart by user story
- ✅ Updated agent context via update-agent-context.ps1
