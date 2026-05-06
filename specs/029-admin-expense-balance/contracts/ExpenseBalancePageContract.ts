// contracts/ExpenseBalancePageContract.ts
// Feature: 029-admin-expense-balance
// Scope: Dedicated ExpenseBalancePage behavior and data-flow contract

type ExpenseFormInput = {
  date: string
  description: string
  amount: number
}

type ExpenseRecord = {
  id: string
  expenseDate: string
  description: string
  amountLkr: number
}

type BalanceComputation = {
  paidAmount: number
  expenseAmount: number
  balanceAmount: number
  calculatedAt: string
}

// Component Target:
// src/features/admin/financial-reports/components/ExpenseBalancePage.tsx

// Route Contract:
// - Path: /admin/reports/expense-balance
// - Query params: start, end (optional YYYY-MM-DD)
// - If params are missing/invalid, page falls back to default range

// Required UI:
// - Back action to /admin/reports
// - Date-range controls
// - Expense form (date, description, amount)
// - Save Expense action
// - Calculate Balance action
// - Expense records list/table

// Submission Contract:
// - Validate with Zod before mutation
// - On success: refresh expenses and clear form fields
// - On failure: show clear validation or API error feedback

// Balance Contract:
// Inputs:
// - paidAmount from same date range
// - expenses list from same date range
// Formula:
// - balance = paidAmount - sum(expenses.amountLkr)
// Visibility:
// - Hidden until calculate action click
// Reset:
// - Reset hidden state when range changes or new expense is added

// Responsive Contract:
// - >=1280 px: multi-column form/table layout
// - >=768 px: two-column form
// - >=375 px: single-column form and scrollable table

export type ExpenseBalancePageContract = {
  onSubmitExpense: (input: ExpenseFormInput) => Promise<void>
  onCalculateBalance: () => BalanceComputation
  expenses: ExpenseRecord[]
  paidAmount: number
}
