// contracts/AdminReportsNavigationContract.ts
// Feature: 029-admin-expense-balance
// Scope: Navigation contract from Financial Reports to dedicated ExpenseBalancePage

// File target: src/features/admin/AdminFinancialReportsPage.tsx

// Contract Goal:
// Provide a clear action below Paid Breakdown that opens a dedicated
// expense-and-balance detail route.

// UI Placement Contract:
// 1. Navigation control appears below Paid Breakdown.
// 2. Existing "View Paid Detail" action remains unchanged.
// 3. New action label clearly indicates expense and balance destination.

// Interaction Contract:
// On click:
// - Navigate to `/admin/reports/expense-balance`
// - Include `start` and `end` query params from current reports date range
// - Avoid inline scroll/focus behavior for this feature variant

// Accessibility Contract:
// - Control is keyboard reachable
// - Label and aria-label are descriptive
// - Focus order remains consistent with other report actions

export {}
