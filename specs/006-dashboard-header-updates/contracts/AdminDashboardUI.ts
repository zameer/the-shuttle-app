/**
 * UI Contract: Admin Dashboard — Date Filter Removal
 * Feature: 006-dashboard-header-updates
 *
 * Documents the before/after contract for AdminDashboardPage so that the
 * /speckit.tasks and /speckit.implement commands have a precise, verifiable
 * target.
 */

// ---------------------------------------------------------------------------
// BEFORE (current state — to be removed)
// ---------------------------------------------------------------------------

/**
 * State removed from AdminDashboardPage:
 *
 *   const [selectedDate, setSelectedDate] = useState(new Date())
 *   const dateStr = format(selectedDate, 'yyyy-MM-dd')
 *
 * UI element removed:
 *
 *   <div className="flex items-center gap-2 bg-white rounded-lg border p-1 shadow-sm">
 *     <button onClick={() => setSelectedDate(prev => subDays(prev, 1))} ...>← Prev</button>
 *     <span className="font-semibold px-4 text-gray-800">
 *       {format(selectedDate, 'MMM do, yyyy')}
 *     </span>
 *     <button onClick={() => setSelectedDate(prev => addDays(prev, 1))} ...>Next →</button>
 *   </div>
 *
 * Imports removed (if no longer used after the state is gone):
 *   - useState (if not used elsewhere in the component)
 *   - subDays, addDays from date-fns
 */

// ---------------------------------------------------------------------------
// AFTER (target state)
// ---------------------------------------------------------------------------

/**
 * AdminDashboardPage after change:
 *
 *   // No selectedDate state — date computed inline, not stored
 *   const dateStr = format(new Date(), 'yyyy-MM-dd')
 *
 *   // useDashboardMetrics call unchanged in signature
 *   const { data: metrics, isLoading } = useDashboardMetrics(dateStr)
 *
 *   // The header renders:
 *   <div className="flex items-center justify-between">
 *     <div>
 *       <h2 className="text-2xl font-bold text-gray-900">
 *         Financial & Operations Dashboard
 *       </h2>
 *       <p className="text-gray-500">Actionable intelligence for court utilization.</p>
 *     </div>
 *     // ← no date filter element here
 *   </div>
 */

// ---------------------------------------------------------------------------
// Acceptance Criteria
// ---------------------------------------------------------------------------

/**
 * US1 acceptance criteria (from spec.md):
 *
 * 1. Given an admin user is on the admin dashboard,
 *    When the header is displayed,
 *    Then no date filter input or date filter label is shown.
 *
 * 2. Given an admin user reloads the admin dashboard,
 *    When the page initializes,
 *    Then dashboard content appears without requiring any date filter selection.
 *
 * Verifiable by:
 *   - Searching the rendered DOM for date-navigation buttons (should return 0 results).
 *   - Confirming metrics cards render on first load without user interaction.
 *   - Running `npm run lint` with zero errors.
 */

export {}
