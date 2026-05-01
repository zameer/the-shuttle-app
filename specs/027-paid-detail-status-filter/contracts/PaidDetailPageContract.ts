// contracts/PaidDetailPageContract.ts
// Feature: 027-paid-detail-status-filter
// Scope: Route page behavior updates

// File: src/features/admin/financial-reports/components/PaidDetailPage.tsx

// Existing date filter section is extended with:
// - Scope selector: PAID | OUTSTANDING (default PAID)
// - Conditional booking-status multi-select (only for OUTSTANDING)

// Behavioral contract:
// - On initial render:
//   scope = PAID
//   outstandingStatuses = [CONFIRMED, CANCELLED, NO_SHOW]
// - On scope/date/status change:
//   setCurrentPage(1)
// - Table + summary always reflect current filter state
// - Empty state appears when filtered rows length is 0

// Responsive contract:
// - Mobile (>=375): controls stack vertically
// - Tablet (>=768): controls use 2-column layout where possible
// - Desktop (>=1280): controls render in one filter row without overlap

export {}
