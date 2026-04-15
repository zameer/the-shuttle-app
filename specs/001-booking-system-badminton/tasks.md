---
description: "Task list template for feature implementation"
---

# Tasks: Badminton Court Booking System

**Input**: Design documents from `/specs/001-booking-system-badminton/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US0, US1, US2)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize React project with Vite, TypeScript, and Tailwind CSS
- [x] T002 [P] Configure shadcn/ui components base
- [x] T003 [P] Configure vite-plugin-pwa for offline capabilities
- [x] T004 [P] Setup TanStack Query, React Router, and React Hook Form + Zod
- [x] T005 [P] Create initial feature folder structure in `src/` (auth, admin, booking, players)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T006 Setup Supabase project and local `supabase/` config
- [x] T007 Initialize database schema (Migrations for Player and Booking tables) in `supabase/migrations/`
- [x] T008 [P] Implement base Supabase client service in `src/services/supabase.ts`
- [x] T009 [P] Create React application shell layouts (`src/layouts/AdminLayout.tsx` and `src/layouts/PublicLayout.tsx`)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 0 - Authentication & Access Control (Priority: P1)

**Goal**: Protect admin routes with Google SSO and an allowed list, while keeping player routes public.

### Implementation for User Story 0

- [x] T010 [P] [US0] Configure Supabase Auth for Google Provider and setup Allowed Emails table/logic in `supabase/`
- [x] T011 [P] [US0] Create Auth Context and Hooks (`src/features/auth/useAuth.ts`)
- [x] T012 [US0] Create Protected Route wrapper for Admin (`src/features/auth/AdminProtectedRoute.tsx`)
- [x] T013 [US0] Wire up Public Layout without auth checks
- [x] T014 [US0] Implement Google Login screen component

**Checkpoint**: Admin routes are secured, public routes remain open, and only whitelisted Google users can enter the admin console.

---

## Phase 4: User Story 1 - Admin Calendar Management (Priority: P1)

**Goal**: Admins have an interactive calendar view to manage slots and confirm/cancel bookings via color coding.

### Implementation for User Story 1

- [x] T015 [P] [US1] Create Calendar UI Component structure (`src/components/shared/calendar/CalendarContainer.tsx`)
- [x] T015a [P] [US1] Implement Week View supporting time grids (`src/components/shared/calendar/WeekView.tsx`)
- [x] T015b [P] [US1] Implement Month View supporting date grids (`src/components/shared/calendar/MonthView.tsx`)
- [x] T016 [P] [US1] Create TanStack Query hooks to fetch bookings (`src/features/booking/useBookings.ts`)
- [x] T017 [US1] Implement Main Admin Calendar View (`src/features/admin/AdminCalendarPage.tsx`) wiring data to the calendar
- [x] T018 [US1] Implement booking status color-coding logic inside the Calendar
- [x] T019 [US1] Create Modal for viewing booking details (`src/features/booking/BookingDetailsModal.tsx`) with cancel/confirm buttons
- [x] T020 [US1] Wire up cancel and confirm mutations syncing to Supabase

**Checkpoint**: Calendar vividly shows booking statuses, and an admin can view, confirm, or cancel a booking.

---

## Phase 5: User Story 2 - Admin Booking & Payments (Priority: P1)

**Goal**: Admins can dynamically calculate prices (including partial hours), manage payments, and seamlessly select/create players via phone number inside the booking form.

### Implementation for User Story 2

- [x] T021 [P] [US2] Create system settings context/fetch to pull hourly rates (e.g., 600, 500)
- [x] T022 [US2] Build `BookingForm.tsx` (React Hook Form + Zod) in `src/features/booking/`
- [x] T023 [US2] Implement dynamic total price calculation logic inside `BookingForm.tsx` based on duration and selected rate
- [x] T024 [P] [US2] Build `PlayerSelectCombobox.tsx` with integrated phone number lookup and seamless "Add New Player" logic
- [x] T025 [US2] Add 'Mark as Paid' functionality hook and button mapped to `paymentStatus`
- [x] T026 [US2] Integrate the `BookingForm.tsx` modal into the `AdminCalendarPage.tsx` for adding new bookings

**Checkpoint**: Admins can book flexible time periods, calculate revenue instantly, type phone numbers to add/select players, and verify payments.

---

## Phase 6: User Story 3 - Admin Sets Court Unavailability (Priority: P1)

**Goal**: Admins can block out time completely for maintenance or closures.

### Implementation for User Story 3

- [x] T027 [P] [US3] Add "Set Unavailable" option to the booking creation model or context menu
- [x] T028 [US3] Ensure DB/UI layers treat 'Unavailable' status as hard blocks preventing overlaps in mutations and UI validations.
- [x] T029 [US3] Add dark grey/specific color formatting for 'Unavailable' blocks in Calendar UI

**Checkpoint**: Admins can fully lock down the calendar timeslots.

---

## Phase 7: User Story 5 - Comprehensive Admin Dashboard (Priority: P1)

**Goal**: High-level dashboard for revenue and daily booking utilization stats.

### Implementation for User Story 5

- [x] T030 [P] [US5] Implement Supabase Edge Function or complex SQL View for aggregating daily metrics (bookings, revenue, utilization)
- [x] T031 [P] [US5] Create Dashboard Query hooks (`src/features/dashboard/useDashboardMetrics.ts`)
- [x] T032 [US5] Build Dashboard UI (`src/features/admin/AdminDashboardPage.tsx`) utilizing Shadcn cards/charts.
- [x] T033 [US5] Implement pending vs collected revenue breakdown visual

**Checkpoint**: The admin dashboard gives instant financial and operational overview under 3 seconds.

---

## Phase 8: User Story 4 - Player Checks Available Slots (Priority: P2)

**Goal**: Players have a simple, read-only calendar to identify available and booked times.

### Implementation for User Story 4

- [x] T034 [P] [US4] Create Public Route for the Player UI (`src/features/players/PublicCalendarPage.tsx`)
- [x] T035 [US4] Reuse Calendar component but strictly in read-only mode (disable clicks for schedules)
- [x] T036 [US4] Filter API output ensuring no PII/player data leaks out into the public endpoints; only status is exposed.
- [x] T037 [US4] Ensure availability statuses (Open/Unavailable) map directly onto the calendar layout without interaction blocks.

**Checkpoint**: Players can safely, securely view calendar openings at a glance.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T038 Setup PWA manifest icons & caching strategies to ensure 3G reliability
- [x] T039 Audit Supabase RLS (Row Level Security) policies for Player and Booking tables
- [x] T040 Final end-to-end responsiveness check for mobile browsers
- [x] T041 Code cleanup and refactoring

---

## Phase 10: User Story 0 (Revised) - Password-Only Login (Priority: P1)

**Goal**: Replace Google SSO with a password-only login screen where the admin email is pre-configured and hidden. Admin only types their password.

### Implementation

- [x] T042 [US0] Replace `AdminLogin.tsx` Google OAuth button with password-only form using `supabase.auth.signInWithPassword`
- [x] T043 [US0] Store admin email in `VITE_ADMIN_EMAIL` env var; never expose it in the UI
- [x] T044 [US0] Add show/hide password toggle and autofocus on password field
- [x] T045 [US0] Create `supabase/seed.sql` to whitelist admin email in `admin_users` table on every `db reset`
- [x] T046 [US0] Update `AdminProtectedRoute.tsx` access denied copy to remove Google references

**Checkpoint**: Admin sees only a password field, types password, and is granted access if credentials match the whitelisted email.

---

## Phase 11: User Story 6 - Court Hours Management (Priority: P1)

**Goal**: Admin can configure court operating hours (start/end time) from a settings screen. Calendar only renders slots within those hours. Admin can also define recurring unavailable blocks (e.g., every Monday 2 PM – 4 PM).

### Database

- [x] T047 [US6] Add migration: create `court_settings` table with `court_open_time`, `court_close_time`, `default_hourly_rate`, `available_rates` (jsonb), `terms_and_conditions` (text) — single-row config table
- [x] T048 [US6] Add migration: create `recurring_unavailable_blocks` table with `id`, `day_of_week` (0–6), `start_time`, `end_time`, `label`
- [x] T049 [US6] Seed default court hours (e.g., 06:00–23:00) and default rates into `court_settings`
- [x] T050 [US6] Add RLS policies: admin full access, public readonly for `court_settings`

### Hooks & API

- [x] T051 [P] [US6] Create `useCourtSettings` hook to fetch/update `court_settings` singleton row
- [x] T052 [P] [US6] Create `useRecurringBlocks` hook to fetch/create/delete recurring unavailable blocks

### UI

- [x] T053 [US6] Build `AdminSettingsPage.tsx` (`src/features/admin/AdminSettingsPage.tsx`) with a form to set court open/close times and hourly rates
- [x] T054 [US6] Add recurring unavailable blocks manager UI inside `AdminSettingsPage.tsx` (list, add, delete blocks by day-of-week + time range)
- [x] T055 [US6] Add route `/admin/settings` in `App.tsx` linking to `AdminSettingsPage.tsx`
- [x] T056 [US6] Add "Settings" link to `AdminLayout` sidebar/nav
- [x] T057 [US6] Update `WeekView.tsx` to read court open/close hours from `useCourtSettings` and only render rows within those hours
- [x] T058 [US6] Update `WeekView.tsx` to overlay recurring unavailable blocks from `useRecurringBlocks` as grey read-only blocks on each applicable day

**Checkpoint**: Admin sets 8 AM – 10 PM; calendar only shows 8 AM to 10 PM rows. Recurring Monday block appears every Monday automatically.

---

## Phase 12: User Story 7 - Cancel = Hard Delete (Priority: P1)

**Goal**: Cancelling a booking permanently removes it from the database (hard delete), freeing the slot immediately.

### Implementation

- [x] T059 [US7] Update `useBookings.ts` to add `useDeleteBooking` mutation calling `.delete().eq('id', id)` instead of status update
- [x] T060 [US7] Update `BookingDetailsModal.tsx` Cancel button to call `useDeleteBooking` with a confirmation prompt ("Are you sure? This cannot be undone.")
- [x] T061 [US7] Remove any UI references to a "CANCELLED" status — it no longer exists as a DB state
- [x] T062 [US7] Ensure `queryClient.invalidateQueries` is called after delete so calendar re-fetches and slot disappears immediately

**Checkpoint**: Admin clicks Cancel → confirms → booking is gone from DB and from calendar instantly.

---

## Phase 13: User Story 8 - Terms & Conditions (Priority: P2)

**Goal**: Admin can write/update Terms & Conditions from a dedicated screen. Players can view them publicly without logging in.

### Database

- [x] T063 [US8] Add `terms_and_conditions` text column to `court_settings` table (covered by T047 migration above)

### Hooks & API

- [x] T064 [P] [US8] Extend `useCourtSettings` hook to support updating `terms_and_conditions` field separately

### Admin UI

- [x] T065 [US8] Add a "Terms & Conditions" tab or section inside `AdminSettingsPage.tsx` with a multi-line textarea and Save button
- [x] T066 [US8] On save, call `useCourtSettings` update mutation and show success/error toast

### Public UI

- [x] T067 [P] [US8] Create `PublicTermsPage.tsx` (`src/features/players/PublicTermsPage.tsx`) that fetches and renders T&C text read-only
- [x] T068 [US8] Add public route `/terms` in `App.tsx` pointing to `PublicTermsPage.tsx`
- [x] T069 [US8] Add a "Terms & Conditions" link in `PublicLayout` footer/nav for easy player access

**Checkpoint**: Admin writes T&C → saves → player visits `/terms` → sees the latest content rendered cleanly.

---

## Phase 14: Integration & Regression (Priority: P1)

**Purpose**: Verify all new features work together correctly end-to-end.

- [x] T070 End-to-end test: login with password → set court hours → verify calendar respects hours
- [x] T071 End-to-end test: create booking → cancel it → confirm it's deleted from DB
- [x] T072 End-to-end test: admin sets T&C → player views `/terms` → latest content shown
- [x] T073 End-to-end test: create recurring block → navigate calendar weeks → block appears every week
- [x] T074 Audit RLS policies for new tables (`court_settings`, `recurring_unavailable_blocks`)
- [x] T075 Mobile responsiveness check for `AdminSettingsPage` and `PublicTermsPage`
