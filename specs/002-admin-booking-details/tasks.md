---
description: "Task list for Enhanced Calendar Status & Admin Booking Details feature"
---

# Tasks: Enhanced Calendar Status & Admin Booking Details

**Input**: Design documents from `/specs/002-admin-booking-details/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)

---

## Phase 1: Foundation (Shared Infrastructure)

**Purpose**: Data layer and shared components for calendar name + status display

- [x] T001 [P] Enhance `useBookings` hook in `src/features/booking/useBookings.ts` to optionally fetch player names alongside booking data via `player_phone_number` foreign key lookup (admin view only)
- [x] T002 [P] Verify RLS policies for `players` table in `supabase/migrations/` — confirm admin can read player name, and public API returns bookings without player names
- [x] T003 [P] Create `StatusBadge.tsx` component in `src/components/shared/StatusBadge.tsx` with status-to-color mapping and optional player name display (conditional based on `isAdmin` prop)
- [x] T004 [P] Create `CalendarSlot.tsx` component in `src/components/shared/calendar/CalendarSlot.tsx` to render status background + name/status text label; conditionally show player name for admin, status only for public

---

## Phase 2: User Story 1 - Admin Calendar with Name & Status Display (Priority: P1)

**Goal**: Admin calendar cells display player name + status (e.g., "John Smith - Reserved") as persistent labels without requiring clicks. Public calendar shows status only.

### Implementation for User Story 1

- [x] T005 [P] [US1] Refactor `MonthView.tsx` in `src/components/shared/calendar/MonthView.tsx` to display player name + status on booking cells for admin; status only for public users
- [x] T006 [P] [US1] Update `WeekView.tsx` in `src/components/shared/calendar/WeekView.tsx` to display player name + status labels on booking cells (admin only); public sees status only
- [x] T011 [US1] Test responsive design on mobile (375px) — verify player name + status readable on compact cells; adjust Tailwind font sizes if needed
- [x] T012 [US1] Test responsive design on desktop (1920px) — verify player name + status prominently displayed and properly spaced

**Test Criteria**: 
- Admin loads calendar and immediately sees player name + status on every reserved booking cell without clicking
- Public user sees status only (no player names visible)
- Calendar renders within 2 seconds with 50+ bookings
- Name + status readable on mobile (375px) and desktop (1920px)

**Checkpoint**: Admin calendar displays name + status persistently; public shows status only.

---

## Phase 3: User Story 2 - Admin-Only Detailed Player Information (Priority: P1)

**Goal**: Admin can click reserved bookings to view full player details (name, phone, address) in a modal. Non-admin users cannot access or interact with booking details.

### Implementation for User Story 2

- [x] T007 [US2] Enhance `BookingDetailsModal.tsx` in `src/features/booking/BookingDetailsModal.tsx` to call `usePlayerDetails()` hook and display player name, phone number, and address
- [x] T008 [US2] Add admin-only access control to `BookingDetailsModal.tsx` — wrap modal display in `isAdmin` check to prevent non-admin access
- [x] T009 [US2] Update `AdminCalendarPage.tsx` in `src/features/admin/AdminCalendarPage.tsx` to pass `isAdmin={true}` and `readOnly={false}` props to calendar; verify click handlers open enhanced modal
- [x] T013 [US2] Audit visual polish and style consistency — ensure status badge colors, typography, and spacing match design system

**Test Criteria**:
- Admin clicks reserved slot → Modal opens → Shows player name, phone, address within 3 seconds
- Non-admin user clicks slot → Modal does NOT open; slot is read-only
- API enforces RLS: Unauthenticated request to player details returns error
- All player details (name, phone, address) are fully visible and readable

**Checkpoint**: Admin can access full player contact info via modal; public/non-admin cannot.

---

## Phase 4: User Story 3 - Public Read-Only Calendar with Status Only (Priority: P2)

**Goal**: Public players view a strictly read-only calendar showing slot status (Open, Reserved) with NO player names, no click interactions, and no access to admin data.

### Implementation for User Story 3

- [x] T010 [P] [US3] Update `PublicCalendarPage.tsx` in `src/features/players/PublicCalendarPage.tsx` to pass `readOnly={true}` and `isAdmin={false}` props to calendar components; ensure calendar cells display status only (no player names)
- [x] T014 [US3] Execute functional testing — public user workflow: load calendar, see status (no names), cannot click slots or access bookings
- [x] T016 [US3] Execute privacy & security validation — verify unauthenticated API queries return only status (no player names); attempt to fetch player data as public user returns error or filtered results

**Test Criteria**:
- Public user loads `/` → sees booking status (Open/Reserved/Unavailable) on calendar
- Public user sees NO player names, phone numbers, or addresses
- Public user cannot click slots; calendar is read-only
- API queries as public user return only status (no player data in response)

**Checkpoint**: Public calendar is read-only, status-only display, no data leakage.

---

## Phase 5: Integration & Testing

**Purpose**: End-to-end validation, accessibility, and performance verification

- [x] T015 [P] [US1] Execute functional testing — admin workflow: load admin calendar, click booking, verify modal shows player details; verify existing confirm/cancel/delete features still work
- [x] T017 [P] Audit accessibility — keyboard navigation, screen reader support, color contrast (WCAG AA); verify interactive elements have focus states
- [x] T018 [P] Update component documentation — Add JSDoc comments to `StatusBadge`, `CalendarSlot`, and modified components (MonthView, WeekView, BookingDetailsModal)
- [x] T019 [P] Update hook documentation — Document new `usePlayerDetails` hook with parameters, return types, RLS notes, and usage examples in `src/features/booking/useBookings.ts`

**Test Criteria**:
- All end-to-end workflows pass (admin + public)
- Keyboard and screen reader navigation works
- Color contrast meets WCAG AA standard
- Components are well-documented with JSDoc

**Checkpoint**: Feature is fully tested, accessible, and documented.

**Test Criteria**:
- All end-to-end workflows pass (admin + public)
- Keyboard and screen reader navigation works
- Color contrast meets WCAG AA standard
- Components are well-documented with JSDoc

**Checkpoint**: Feature is fully tested, accessible, and documented.

---

## Phase 6: Final Validation & Deployment

**Purpose**: Success criteria verification and production readiness

- [x] T020 Test against success criteria — Verify all 6 criteria met: Accessibility (1 second), Admin efficiency (<3 seconds), Privacy compliance (0 player details exposed), Responsive design (375px-1920px), Role-based access, Performance (<2 seconds with 50+ bookings)
- [x] T021 [P] Deploy to production — Final code review, merge feature branch, trigger CI/CD pipeline if applicable

**Checkpoint**: Feature meets all success criteria and is production-ready.

---

## Dependencies & Execution Order

### Critical Path (Must Complete in Sequence)
1. **Phase 1** (T001-T004): Data layer and shared components — blocks all story phases
2. **Phase 2** (T005-T006, T011-T012): Calendar refactoring for status display — foundational for both admin and public
3. **Phase 3** (T007-T009, T013): Admin modal enhancement — depends on Phase 2
4. **Phase 4** (T010, T014, T016): Public calendar read-only mode — depends on Phase 2
5. **Phase 5** (T015, T017-T019): Testing and documentation — validates all phases
6. **Phase 6** (T020-T021): Final validation and deployment

### Parallelizable Tasks
- **Phase 1**: T002, T003, T004 can run in parallel (independent components and validations)
- **Phase 3**: T008, T009, T013 can start after T007 modal enhancement
- **Phase 5**: T017, T018, T019 can run in parallel during integration testing

### Recommended MVP Scope
- **Phase 1** (Foundation) ✅
- **Phase 2 - User Story 1** (Status Display) ✅
- **Phase 3 - User Story 2** (Admin Details) ✅
- **Phase 5** (Integration Testing) ✅

**Defer to secondary releases**: Phase 4 (US3 - Public Read-Only) and full Phase 6 deployment if timeline is tight.

---

## User Story Completion Order

| Story | Priority | Dependencies | Estimated Duration | MVP Included |
|-------|----------|--------------|-------------------|--------------|
| **US1** | P1 | Phase 1 data layer | 1 day | ✅ Yes |
| **US2** | P1 | Phase 1 + US1 | 1.5 days | ✅ Yes |
| **US3** | P2 | Phase 1 + US1 | 0.75 days | ❌ No (defer) |

---

## Parallel Execution Strategy

### Day 1 Parallel Tasks
```
Morning:  T001 (data layer), T002 (RLS validation), T003 (StatusBadge), T004 (CalendarSlot)
         ↓
Afternoon: T005 (MonthView), T006 (WeekView) [depend on T004]
```

### Day 2 Parallel Tasks
```
Morning:  T007 (modal enhancement), T008 (access control) [depend on T001]
         T010 (public calendar setup) [depends on T006]
Afternoon: T009 (AdminCalendarPage integration), T013 (polish)
```

### Day 3 Parallel Tasks
```
All Day: T011 (mobile responsive), T012 (desktop responsive), T014 (admin testing), T015 (public testing), T016 (security), T017 (accessibility), T018 (component docs), T019 (hook docs)
```

### Day 4
```
T020 (success criteria validation), T021 (deployment)
```

---

## Success Criteria Checklist

All of the following must be met before Phase 6 completion:

- [ ] Quick Admin ID: Admin can identify player name + status on calendar cells within 1 second (mobile or desktop)
- [ ] Admin Details Access: Admin can click reserved booking and read full player details (name, phone, address) in under 3 seconds
- [ ] Privacy Compliance: Unauthenticated users see 0 player names or details; public calendar shows status only; API returns only open/reserved/unavailable status
- [ ] Responsive Design: Calendar cells display player name + status readable on 375px (mobile) to 1920px (desktop) widths
- [ ] Role-Based Access: Admin sees player names on cells; non-admin users see status only; non-admin cannot click; API enforces RLS
- [ ] Performance: Calendar loads within 2 seconds even with 50+ bookings; name + status rendering adds <100ms overhead

---

## Notes

- All tasks follow the checklist format: `- [ ] [TaskID] [Optional: P] [Optional: Story] Description with file path`
- No additional research needed (Phase 0 clarifications resolved in planning stage)
- Responsive design testing critical across all phases to meet success criteria
- RLS policy validation (T002) ensures privacy compliance from data layer up
- Phase 4 (US3) marked as P2 and recommended to defer for MVP — can be implemented in next iteration if timeline constraints exist
