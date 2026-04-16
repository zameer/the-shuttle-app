# Tasks: Admin List View Booking Management

**Input**: Design documents from `specs/011-admin-list-view/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[Story]**: Maps to user story from spec.md
- Exact file paths included in all descriptions

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: Pure derivation function that produces the ordered `AdminListRow[]` list consumed by ALL user stories. Must complete before any phase 3 work.

**⚠️ CRITICAL**: Phases 3 and 4 cannot begin until T001 is complete.

- [X] T001 Create `src/features/admin/calendar/deriveAdminListRows.ts` — export `AdminListRow` interface `{ type: 'booking' | 'available'; slotStart: Date; slotEnd: Date; durationMinutes: number; status: 'AVAILABLE' | 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'; booking?: Booking; playerName?: string | null; actionable: boolean }` and export `deriveAdminListRows(date: Date, bookings: Booking[]): AdminListRow[]` implementing the cursor-walk algorithm from data-model.md: import `setHours, setMinutes, setSeconds, setMilliseconds, addMinutes, parseISO, startOfDay, endOfDay, isAfter, isBefore` from `date-fns` and `Booking` from `@/features/booking/useBookings`; constants `SCHEDULE_START_HOUR = 6`, `SCHEDULE_END_HOUR = 22`, `SLOT_STEP_MINUTES = 30`; filter input bookings to those overlapping `[startOfDay(date)+6h, startOfDay(date)+22h]` and sort by `start_time` ascending; walk `cursor` from `06:00`; for each booking: fill gap between cursor and `booking.start_time` with 30-min available rows, push one merged booking row `{ type: 'booking', slotStart: parseISO(b.start_time), slotEnd: parseISO(b.end_time), durationMinutes: (end-start)/60000, status: b.status, booking: b, playerName: b.player_name ?? null, actionable: true }`, advance cursor to `max(cursor, parseISO(b.end_time))`; after all bookings fill remaining available slots to `22:00`; return rows

**Checkpoint**: `deriveAdminListRows` is importable and produces correct rows for 30-, 60-, 90-, 150-minute bookings. Lint passes on this file.

---

## Phase 3: User Story 1 + User Story 2 — List View Display (Priority: P1) 🎯 MVP

**Goal**: Admin sees the List/Calendar toggle, list view renders merged booking rows and 30-minute available slots, date navigation with `ListDateNav` works, and selected date stays shared across both views.

**Independent Test**: Open admin booking page in calendar mode → click List → list renders with merged rows and date nav. Navigate to yesterday via the left arrow. Switch back to Calendar — calendar is on yesterday. No row action buttons yet (US3 phase).

- [X] T002 [P] [US2] Create `src/features/admin/AdminListView.tsx` — props `{ currentDate: Date; bookings: Booking[]; onBookingClick: (booking: Booking) => void; onAvailableSlotClick: (date: Date) => void }`; call `deriveAdminListRows(currentDate, bookings)`; render `<ul role="list" aria-label="Time slot availability" className="w-full space-y-1">`; per row `<li>` with `tabIndex={0}`, `min-h-[44px]`, `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none`; status border+background: `CONFIRMED` = `bg-green-100 border-green-200 text-green-900`, `PENDING` = `bg-yellow-100 border-yellow-200 text-yellow-900`, `UNAVAILABLE` = `bg-gray-100 border-gray-200 text-gray-400`, `AVAILABLE` = `bg-blue-50 border-blue-200 text-blue-900`; status dot: `bg-green-500 / bg-yellow-500 / bg-gray-400 / bg-blue-400`; time range label: `` `${format(row.slotStart, 'h:mm a')} – ${format(row.slotEnd, 'h:mm a')}` `` via `format` from `date-fns`; duration label helper `formatDuration(min: number)` → `'30 min'` | `'1h'` | `'1h 30min'` | `'2h'` | `'2h 30min'` etc (using `Math.floor(min/60)` and `min%60`); booking rows also display `row.playerName` in a small gray badge if truthy; NO action buttons yet (added in T004); import `cn` from `@/lib/utils` for class merging; import `Booking` type from `@/features/booking/useBookings`

- [X] T003 [US1] Modify `src/features/admin/AdminCalendarPage.tsx` — add imports: `startOfDay`, `endOfDay` from `date-fns`; `LayoutList`, `CalendarDays` from `lucide-react`; `AdminListView` from `./AdminListView`; `ListDateNav` from `@/features/players/calendar/ListDateNav`; add `displayMode` state: `const [displayMode, setDisplayMode] = useState<'calendar' | 'list'>('calendar')`; replace bare `queryStartDate`/`queryEndDate` derivation lines with: `const queryStartDate = displayMode === 'list' ? startOfDay(currentDate) : (dateRangeFilter.appliedRange?.startDate ?? calendarRange.startDate)` and `const queryEndDate = displayMode === 'list' ? endOfDay(currentDate) : (dateRangeFilter.appliedRange?.endDate ?? calendarRange.endDate)`; add List | Calendar toggle button group above `DateRangeFilter` using same pill pattern as `PublicCalendarPage` (inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5 gap-0.5 with active=bg-white shadow text-gray-900); show `DateRangeFilter` only when `displayMode === 'calendar'`; replace the outer conditional render with: `displayMode === 'list' ? (<div className="space-y-3"><ListDateNav value={currentDate} onChange={setCurrentDate} /><AdminListView currentDate={currentDate} bookings={bookings} onBookingClick={() => {}} onAvailableSlotClick={() => {}} /></div>) : (<> existing DateRangeFilter + isLoading skeleton + CalendarContainer block unchanged </>)`

**Checkpoint**: Toggle switches view, list shows merged booking rows with correct duration labels and status colors, date nav works, switching to calendar lands on same date, lint passes.

---

## Phase 4: User Story 3 — Row Actions (Priority: P2)

**Goal**: Admin can tap the ⋮ icon on a booking row to open `BookingDetailsModal`, or the + icon on an available slot to open `BookingForm` pre-filled with the slot's start time.

**Independent Test**: In list view, click ⋮ on any reserved booking row → `BookingDetailsModal` opens for that booking. Cancel the modal → list is still visible. Click + on an available slot → `BookingForm` opens. Cancel → list is still visible. Complete a status change → list refreshes with updated row.

- [X] T004 [P] [US3] Modify `src/features/admin/AdminListView.tsx` — add imports: `MoreVertical`, `Plus` from `lucide-react`; inside each `<li>`, add `className="flex items-center gap-3 px-3 py-2"` layout; for booking rows, add trailing `<button type="button" aria-label="Manage booking" onClick={(e) => { e.stopPropagation(); onBookingClick(row.booking!) }} className="ml-auto shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md text-gray-500 hover:text-gray-800 hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><MoreVertical className="w-4 h-4" /></button>`; for available rows, add trailing `<button type="button" aria-label="Create booking at this slot" onClick={(e) => { e.stopPropagation(); onAvailableSlotClick(row.slotStart) }} className="ml-auto shrink-0 flex items-center justify-center min-w-[44px] min-h-[44px] rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><Plus className="w-4 h-4" /></button>`

- [X] T005 [US3] Modify `src/features/admin/AdminCalendarPage.tsx` — in the `<AdminListView .../>` JSX, replace `onBookingClick={() => {}}` with `onBookingClick={(b) => setActiveBooking(b)}` and replace `onAvailableSlotClick={() => {}}` with `onAvailableSlotClick={(d) => { setSelectedSlotHour(d); setIsBookingFormOpen(true) }}`; verify that `activeBooking`, `setActiveBooking`, `isBookingFormOpen`, `setIsBookingFormOpen`, `selectedSlotHour`, `setSelectedSlotHour` are all already declared in the file (they are — no new state needed)

**Checkpoint**: All three user stories are fully functional. Row actions open correct modals. After booking action completes, React Query invalidation refreshes the list. All quickstart.md verification steps pass.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [X] T006 [P] Run ESLint on all modified and new files: `npx eslint src/features/admin/calendar/deriveAdminListRows.ts src/features/admin/AdminListView.tsx src/features/admin/AdminCalendarPage.tsx` and resolve any errors before marking this task complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **Phase 3 (US1+US2)**: Requires T001 complete
  - T002 and T003 can run in **parallel** (different files) once T001 is done
- **Phase 4 (US3)**: Requires T002 AND T003 complete
  - T004 and T005 can run in **parallel** (different files) once both T002 and T003 are done
- **Phase 5 (Polish)**: Requires T004 AND T005 complete

### User Story Dependencies

- **US1 + US2 (P1)**: Depend only on T001 (Foundational)
- **US3 (P2)**: Depends on T002 + T003 (US1/US2 phases)

---

## Parallel Opportunities

### Phase 3 (after T001 completes)

```
T002 — src/features/admin/AdminListView.tsx        (parallel, different file)
T003 — src/features/admin/AdminCalendarPage.tsx    (parallel, different file)
```

### Phase 4 (after T002 + T003 complete)

```
T004 — AdminListView.tsx action buttons    (parallel, different file)
T005 — AdminCalendarPage.tsx handler wiring (parallel, different file)
```

---

## Implementation Strategy

### MVP First (US1 + US2 — P1 Stories Only)

1. Complete T001 — Foundational: `deriveAdminListRows.ts`
2. Complete T002 + T003 in parallel — List display + Toggle/Nav
3. **STOP and VALIDATE**: Switch view, verify merged rows, navigate dates, verify calendar sync
4. Optionally demo/deploy at this checkpoint

### Full Delivery (US3 — Row Actions)

5. Complete T004 + T005 in parallel — Action buttons + handler wiring
6. Validate quickstart.md US3 verification steps
7. Complete T006 — Lint gate

### Notes

- No new npm packages, no Supabase migrations, no schema changes
- `ListDateNav` is reused from `src/features/players/calendar/ListDateNav.tsx` (feature 010)
- `BookingDetailsModal` and `BookingForm` are reused unchanged
- Default mode is `'calendar'` in this feature; feature 012 changes the admin default to `'list'`
- All rows use `min-h-[44px]` touch targets and `focus-visible:ring-2` keyboard rings per Constitution V
