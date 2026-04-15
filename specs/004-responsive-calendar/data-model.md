# Data Model: Responsive Player Calendar (Phase 1)

## Overview
This feature is UI-layout focused. No database schema changes are required. Data entities below represent view-state and rendering contracts used in the frontend.

## Entities

### 1) CalendarContainerState
- Purpose: Drives top-level calendar rendering behavior.
- Fields:
  - `currentDate: Date` - Active anchor date for current view.
  - `view: 'month' | 'week'` - Selected calendar mode.
  - `readOnly: boolean` - Disables editing interactions for public calendar.
  - `isAdmin: boolean` - Enables admin-only visual metadata.
- Validation:
  - `currentDate` must be a valid Date object.
  - `view` must be one of `month`, `week`.

### 2) CalendarViewportState
- Purpose: Represents responsive and scroll behavior state of the calendar body.
- Fields:
  - `horizontalOverflowEnabled: boolean`
  - `verticalOverflowEnabled: boolean`
  - `stickyHeaderEnabled: boolean`
  - `minGridWidthPx: number` (view dependent)
- Validation:
  - `minGridWidthPx >= 0`
  - sticky header must be enabled when internal scrolling is enabled.

### 3) BookingRenderItem
- Purpose: Render unit for booking cells/blocks.
- Fields:
  - `id: string`
  - `start_time: string` (ISO datetime)
  - `end_time: string` (ISO datetime)
  - `status: 'PENDING' | 'CONFIRMED' | 'UNAVAILABLE'`
  - `payment_status?: 'PENDING' | 'PAID' | 'UNPAID' | null`
  - `player_name?: string | null`
- Validation:
  - `end_time > start_time`
  - `status` in enum set

## Relationships
- `CalendarContainerState` composes `CalendarViewportState` and list of `BookingRenderItem`.
- `BookingRenderItem` is produced by existing bookings query hooks; no transformation persistence changes.

## State Transitions
- `view` toggles `week <-> month` and updates layout min-width strategy.
- `currentDate` moves via prev/next/today controls.
- Internal scroll position changes do not mutate booking data; only UI state changes.
