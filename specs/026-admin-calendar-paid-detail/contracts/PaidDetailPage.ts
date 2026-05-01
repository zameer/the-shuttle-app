// contracts/PaidDetailPage.ts
// Feature: 026-admin-calendar-paid-detail
// Scope: Full UI contract for the new PaidDetailPage component (US2)
// File location: src/features/admin/financial-reports/components/PaidDetailPage.tsx
// ---------------------------------------------------------------------------

import type { PaidDetailRow, PaidDetailSummary } from '../financial-reports/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

// PaidDetailPage takes no props — all state is derived from URL search params
// and internal React state. It is a route-level page component.

// ---------------------------------------------------------------------------
// URL Search Params (read on mount)
// ---------------------------------------------------------------------------
//
//   Param   Type              Required   Default
//   start   YYYY-MM-DD        no         startOfMonth(today)
//   end     YYYY-MM-DD        no         today
//
//   Validated with paidDetailSearchParamsSchema (Zod)
//   Invalid values silently fall back to defaults

// ---------------------------------------------------------------------------
// Local State
// ---------------------------------------------------------------------------
//
//   startDate: string        — controlled date range start
//   endDate: string          — controlled date range end
//   currentPage: number      — pagination cursor, resets to 1 on date change
//
//   PAGE_SIZE = 15           — constant; rows per page

// ---------------------------------------------------------------------------
// Data Fetching
// ---------------------------------------------------------------------------
//
//   const { data, isLoading, error } = usePaidDetail({ startDate, endDate })
//
//   data shape: PaidDetailOutput = { rows: PaidDetailRow[], summary: PaidDetailSummary }
//   (see data-model.md)

// ---------------------------------------------------------------------------
// Layout Structure
// ---------------------------------------------------------------------------
//
//   <div className="space-y-6">
//
//     {/* Header row */}
//     <div className="flex items-center gap-3">
//       <Button variant="ghost" size="sm" asChild>
//         <Link to="/admin/reports">← Back to Reports</Link>
//       </Button>
//       <div>
//         <h2>Paid Booking Detail</h2>
//         <p>Individual paid bookings for the selected period.</p>
//       </div>
//     </div>
//
//     {/* Date range filter */}
//     <section className="rounded-xl border bg-white p-4">
//       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//         <label>Start Date <input type="date" .../></label>
//         <label>End Date   <input type="date" .../></label>
//         <div>  {/* info note */}  </div>
//       </div>
//     </section>
//
//     {/* Summary header — only when data loaded */}
//     <section className="grid grid-cols-3 gap-3">
//       <SummaryCard title="Paid Amount" value="LKR X,XXX" subtitle="..." />
//       <SummaryCard title="Paid Hours"  value="X.XX hrs"  subtitle="..." />
//       <SummaryCard title="Bookings"    value="N"         subtitle="individual paid bookings" />
//     </section>
//
//     {/* Table */}
//     <section className="rounded-xl border bg-white overflow-x-auto">
//       <table className="w-full text-sm">
//         <thead>
//           <tr>
//             <th>Date</th>
//             <th>Time</th>
//             <th>Player</th>
//             <th>Contact</th>
//             <th>Confirmation</th>
//             <th>Payment</th>
//             <th className="text-right">Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {pagedRows.map(row => (
//             <tr key={row.bookingId}>
//               <td>{format(parseISO(row.slotStart), 'dd MMM yyyy')}</td>
//               <td>{format(parseISO(row.slotStart), 'HH:mm')} – {format(parseISO(row.slotEnd), 'HH:mm')}</td>
//               <td>{row.playerName ?? '—'}</td>
//               <td>{row.playerPhoneNumber ?? '—'}</td>
//               <td><PaidDetailStatusBadge type="booking" status={row.bookingStatus} /></td>
//               <td><PaidDetailStatusBadge type="payment" status={row.paymentBucket} /></td>
//               <td className="text-right">LKR {row.amount.toLocaleString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//
//       {/* Empty state */}
//       {rows.length === 0 && !isLoading && (
//         <div className="py-12 text-center text-sm text-muted-foreground">
//           No paid bookings for this period.
//         </div>
//       )}
//     </section>
//
//     {/* Pagination */}
//     <div className="flex items-center justify-between">
//       <p className="text-xs text-muted-foreground">
//         Showing {startIndex + 1}–{endIndex} of {rows.length} paid bookings
//       </p>
//       <div className="flex gap-2">
//         <Button variant="outline" size="sm" disabled={!canGoPrev} onClick={prevPage}>Previous</Button>
//         <span className="px-2 py-1 text-xs">{currentPage} / {totalPages}</span>
//         <Button variant="outline" size="sm" disabled={!canGoNext} onClick={nextPage}>Next</Button>
//       </div>
//     </div>
//
//   </div>

// ---------------------------------------------------------------------------
// Responsive Behaviour
// ---------------------------------------------------------------------------
//
//   ≥1280 px  — Full 7-column table, all content visible
//   ≥768 px   — Table scrolls horizontally; summary cards in row
//   ≥375 px   — Horizontal scroll on table; summary cards stack vertically (grid-cols-1)
//
//   Back button always visible at all breakpoints (top of page)

// ---------------------------------------------------------------------------
// PaidDetailStatusBadge contract (co-located component)
// ---------------------------------------------------------------------------
//
//   interface PaidDetailStatusBadgeProps {
//     type: 'booking' | 'payment'
//     status: string
//   }
//
//   Booking status mapping:
//     CONFIRMED   → Badge variant="default"  (blue)
//     PENDING     → Badge variant="outline"  (gray)
//     UNAVAILABLE → Badge variant="secondary"
//     CANCELLED   → Badge variant="destructive"
//     NO_SHOW     → Badge variant="destructive"
//
//   Payment status mapping:
//     PAID        → Badge className="bg-green-100 text-green-800 border-green-200"
//     PENDING     → Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"
//     UNPAID      → Badge variant="outline"
//     UNKNOWN/null → Badge variant="secondary"

// ---------------------------------------------------------------------------
// usePaidDetail hook contract
// ---------------------------------------------------------------------------
//
//   Location: src/features/admin/financial-reports/usePaidDetail.ts
//
//   function usePaidDetail(input: ReportDateRangeInput): UseQueryResult<PaidDetailOutput>
//
//   - React Query key: ['paid-detail', input.startDate, input.endDate]
//   - enabled: paidDetailQuerySchema.safeParse(input).success
//   - Supabase query: identical to useFinancialReport — same table + columns
//   - Service call: buildPaidDetail(normalizeFinancialRows(parsedRows.data))
//   - Returns PaidDetailOutput: { rows: PaidDetailRow[], summary: PaidDetailSummary }

// ---------------------------------------------------------------------------
// buildPaidDetail service function contract
// ---------------------------------------------------------------------------
//
//   Location: src/features/admin/financial-reports/financialReportService.ts
//
//   function buildPaidDetail(rows: NormalizedFinancialBooking[]): PaidDetailOutput
//
//   Algorithm:
//     1. Filter rows: paymentBucket === 'PAID' AND isActiveFinancialStatus(bookingStatus)
//     2. Sort: slotStart descending (most recent first)
//     3. Compute summary:
//        totalAmount = sum(row.amount)       — round2()
//        totalHours  = sum(row.durationHours) — round2()
//        totalBookings = filtered.length
//     4. Return { rows: filteredRows, summary }

// ---------------------------------------------------------------------------
// Navigation: AdminFinancialReportsPage → PaidDetailPage
// ---------------------------------------------------------------------------
//
//   In src/features/admin/AdminFinancialReportsPage.tsx, replace the
//   existing <PaymentBreakdownSection> open-modal button with a navigation button:
//
//   <Button
//     variant="outline"
//     onClick={() => navigate(`/admin/reports/paid-detail?start=${startDate}&end=${endDate}`)}
//   >
//     <ExternalLink className="w-4 h-4 mr-2" />
//     View Paid Detail
//   </Button>
//
//   The existing <PaidBreakdownModal> and its state (isPaidModalOpen, paidPage)
//   are REMOVED from AdminFinancialReportsPage as part of this feature.
//   The <PaymentBreakdownSection> component is updated or replaced to show the
//   navigation button instead of the modal trigger.

export {}
