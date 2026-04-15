# Data Model: UI Improvements and Search Enhancements

**Date**: April 15, 2026  
**Feature**: [spec.md](./spec.md)  
**Status**: No schema changes required; existing tables sufficient

---

## Entity Overview

### Player Entity (existing `players` table)

**Table**: `public.players`

**Fields**:
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `phone_number` | VARCHAR(20) | NO | Primary key; player identifier |
| `name` | TEXT | NO | Player full name (✅ used for US1 search) |
| `address` | TEXT | YES | Player address (can be null) |
| `created_at` | TIMESTAMPTZ | NO | Record creation timestamp |

**Relationships**:
- One-to-many: One player can have multiple bookings (via `bookings.player_phone_number`)

**Search Fields** (US1):
- `name`: Full-text search by player name (e.g., "John", "John Smith", partial match)
- `phone_number`: Mobile number search (e.g., "9876543210", exact or partial match)

**Access Control**:
- ✅ RLS policy: Admin can select all fields
- ✅ RLS policy: Public cannot see player details (only referenced in admin context)

---

### Booking Entity (existing `bookings` table)

**Table**: `public.bookings`

**Fields**:
| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | UUID | NO | Primary key; booking unique identifier |
| `player_phone_number` | VARCHAR(20) | NO | FK to `players.phone_number` |
| `start_time` | TIMESTAMPTZ | NO | Booking start time (✅ editable by US6) |
| `end_time` | TIMESTAMPTZ | NO | Booking end time (✅ editable by US6) |
| `status` | VARCHAR(20) | NO | PENDING \| CONFIRMED \| UNAVAILABLE |
| `payment_status` | VARCHAR(20) | NO | PENDING \| PAID (✅ displayed by US3) |
| `hourly_rate` | NUMERIC | NO | Rate per hour |
| `total_price` | NUMERIC | NO | Total booking cost |
| `created_at` | TIMESTAMPTZ | NO | Record creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | Last update timestamp |

**Derived Fields** (no schema changes):
- `duration_minutes`: Calculated from `end_time - start_time` (used by US6 for adjustment UI)
- `is_paid`: Boolean derived from `payment_status = 'PAID'` (used by US3 for display)

**Relationships**:
- Many-to-one: Each booking references one player via `player_phone_number`

**Update Operations** (US6 - Time Adjustment):
- ✅ Admin can UPDATE `start_time` and `end_time`
- ✅ System validates no time overlaps with other bookings (same court)
- ✅ `updated_at` timestamps on every change

**Display Fields** (US3 - Payment Status):
- ✅ `payment_status` visible on calendar cells (admin calendar only)
- ✅ Badge color: PAID=green, PENDING=yellow, UNPAID=red

**Access Control**:
- ✅ RLS policy: Admin can read all fields and update `start_time`, `end_time`, `payment_status`
- ✅ RLS policy: Public can read only `id`, `start_time`, `end_time`, `status` (no payment data)

---

## Query Patterns

### US1: Player Search (Name + Mobile)

**Query Pattern**: Search across player records

```sql
-- Find players by name (case-insensitive partial match)
SELECT * FROM players 
WHERE name ILIKE '%search_term%'
LIMIT 10;

-- Find players by mobile number (exact or partial)
SELECT * FROM players 
WHERE phone_number LIKE 'search_term%'
LIMIT 10;

-- Combined search (OR logic)
SELECT * FROM players 
WHERE name ILIKE '%search_term%' OR phone_number LIKE 'search_term%'
LIMIT 10;
```

**Implementation**: Client-side filter in `PlayerSelectCombobox.tsx` using React state

---

### US2/US3: Calendar Display

**Query Pattern**: Fetch bookings for date range with player context

```sql
-- Admin calendar with player names and payment status
SELECT b.*, p.name, p.phone_number
FROM bookings b
LEFT JOIN players p ON b.player_phone_number = p.phone_number
WHERE b.start_time >= $1 AND b.start_time <= $2
ORDER BY b.start_time ASC;

-- Public calendar (no player names)
SELECT b.id, b.start_time, b.end_time, b.status
FROM bookings b
WHERE b.start_time >= $1 AND b.start_time <= $2
AND b.status IN ('CONFIRMED', 'UNAVAILABLE')
ORDER BY b.start_time ASC;
```

**Implementation**: Use existing `useBookings()` hook; extend to conditionally fetch player names for admin

---

### US3: Payment Status on Calendar

**Query Pattern**: Already included in calendar query above

```sql
-- Select booking with payment_status
SELECT b.id, b.start_time, b.end_time, b.status, b.payment_status
FROM bookings b
WHERE b.start_time >= $1 AND b.start_time <= $2;
```

**Display Column**: Add payment status indicator using Badge component

---

### US6: Time Conflict Detection

**Query Pattern**: Find overlapping bookings

```sql
-- Find bookings that overlap with proposed time range
SELECT * FROM bookings
WHERE (
  (start_time < $end_time AND end_time > $start_time)
  AND status != 'CANCELLED'
)
LIMIT 100;
```

**Implementation**: Fetch existing bookings for date range; validate in application using date-fns

---

## State Management

### Component State (React Query)

**useBookings() Hook**:
- Returns array of bookings with optional player details
- Automatic refetch on mount and on dependency changes
- Supports date range filtering

**useAuth() Hook**:
- Returns `{ isAdmin: boolean }` to conditionally render admin features (US3, US6)

### Form State (react-hook-form)

**BookingForm**: Uses react-hook-form 7.72.1 for input management
**BookingDetailsModal**: Manages time adjustment fields (US6)

---

## Validation Rules

### Player Search (US1)

- ✅ Search term minimum 1 character (debounced at UI level)
- ✅ Case-insensitive matching for names
- ✅ Support partial phone number matches

### Time Adjustment (US6)

- ✅ `start_time` must be before `end_time`
- ✅ Duration cannot be negative
- ✅ **Conflict detection**: New time range cannot overlap with existing confirmed bookings
- ✅ **Minimum duration**: [NEEDS CLARIFICATION: What is minimum booking duration? Assumed 30 minutes]
- ✅ **Maximum duration**: [NEEDS CLARIFICATION: What is maximum allowed duration? Assumed 8 hours]

---

## Data Visibility (RLS Policies)

### Admin Role (isAdmin = true)

- ✅ Can SELECT all booking and player fields
- ✅ Can UPDATE booking `start_time`, `end_time`, `payment_status`, `status`
- ✅ Can DELETE bookings (existing)
- ✅ Can see player names, phone numbers, addresses

### Public Role (isAdmin = false or unauthenticated)

- ✅ Can SELECT bookings with only: `id`, `start_time`, `end_time`, `status`
- ✅ Cannot see: `payment_status`, `player_phone_number`, player details
- ✅ Cannot UPDATE, DELETE, or CREATE bookings
- ✅ Cannot access player data

---

## Data Integrity Constraints

**Primary Keys**:
- `players.phone_number` - Unique constraint ensures one phone number per player
- `bookings.id` (UUID) - Unique constraint ensures booking uniqueness

**Foreign Keys**:
- `bookings.player_phone_number` → `players.phone_number` (no cascade delete; preserves booking history)

**Check Constraints** (database level):
- `bookings.start_time < bookings.end_time` - Prevent invalid time ranges
- `bookings.payment_status IN ('PENDING', 'PAID')` - Restrict to allowed states

---

## Schema Change Assessment

**Current Schema Status**: ✅ COMPLETE

| Feature | Required Changes | Status |
|---------|------------------|--------|
| US1 (Player Search) | None (name field exists) | ✅ Ready |
| US2 (Sticky Headers) | None (UI only) | ✅ Ready |
| US3 (Payment Status) | None (payment_status field exists) | ✅ Ready |
| US4 (Mobile Form Button) | None (UI only) | ✅ Ready |
| US5 (Admin Mobile Menu) | None (UI only) | ✅ Ready |
| US6 (Time Adjustment) | Optional: min/max duration config table | ✅ Ready (can add later) |

**Conclusion**: No migrations required. All features can be implemented with existing schema.

---

## Performance Considerations

### Query Performance

- ✅ Player search: Indexed on `name` and `phone_number` (recommend adding if not present)
- ✅ Booking queries by date range: Indexed on `start_time` (recommend adding if not present)
- ✅ Client-side filtering for US1 search is acceptable for current data size (<10k players)

### Rendering Performance

- ✅ Calendar with 50+ bookings: pagination or virtual scrolling may be needed (monitor with profiler)
- ✅ Payment status badges: lightweight component (no impact)
- ✅ Sticky header: standard CSS (no performance issue)

---

## Status

🟢 **DATA MODEL COMPLETE**  
- No schema changes required
- All entities clearly defined
- Query patterns documented
- Ready for implementation
