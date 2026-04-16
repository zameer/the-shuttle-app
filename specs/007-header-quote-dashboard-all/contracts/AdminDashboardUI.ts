/**
 * Contract: Admin Dashboard UI — All-Time Metrics
 * Feature: 007-header-quote-dashboard-all
 *
 * Documents the new `useAllTimeMetrics` hook contract and the expected
 * changes to `AdminDashboardPage` to consume it.
 */

// ---------------------------------------------------------------------------
// Hook: useAllTimeMetrics
// Location: src/features/dashboard/useAllTimeMetrics.ts
// ---------------------------------------------------------------------------

export interface AllTimeMetrics {
  total_bookings: number
  expected_revenue: number
  collected_revenue: number
  pending_revenue: number
}

/**
 * React Query hook — fetches all rows from `dashboard_metrics` and reduces
 * them to a single all-time aggregate object.
 *
 * @returns {UseQueryResult<AllTimeMetrics>}
 *   - data: AllTimeMetrics with summed values (all four fields default to 0)
 *   - isLoading: boolean
 *   - isError: boolean
 *
 * @example
 * const { data, isLoading, isError } = useAllTimeMetrics()
 * // data.total_bookings  → sum of all days
 * // data.expected_revenue → sum of all days (LKR)
 */
export declare function useAllTimeMetrics(): {
  data: AllTimeMetrics | undefined
  isLoading: boolean
  isError: boolean
}

// ---------------------------------------------------------------------------
// Component: AdminDashboardPage (modified)
// Location: src/features/admin/AdminDashboardPage.tsx
// ---------------------------------------------------------------------------

/**
 * BEFORE (to be removed):
 *
 *   import { useDashboardMetrics } from '@/features/dashboard/useDashboardMetrics'
 *   import { format } from 'date-fns'
 *
 *   const dateStr = format(new Date(), 'yyyy-MM-dd')
 *   const { data, isLoading, isError } = useDashboardMetrics(dateStr)
 *
 *
 * AFTER (required):
 *
 *   import { useAllTimeMetrics } from '@/features/dashboard/useAllTimeMetrics'
 *
 *   const { data, isLoading, isError } = useAllTimeMetrics()
 *
 * The metric card JSX references the same four field names:
 *   data.total_bookings, data.expected_revenue, data.collected_revenue, data.pending_revenue
 * so no JSX template changes are required.
 *
 * The card titles should change from e.g. "Today's Bookings" → "Total Bookings"
 * and "Today's Revenue" → "Total Revenue" (or equivalent).
 */
