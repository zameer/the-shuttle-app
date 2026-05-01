// contracts/PlayerVisibilityContract.ts
// Feature: 028-calendar-notice-visibility
// Scope: Public player page visibility derivation contract

export type PlayerDisplayMode = 'calendar' | 'closure_message' | 'both'

export interface PlayerVisibilityState {
  showCalendar: boolean  // true when mode === 'calendar' || mode === 'both'
  showMessage: boolean   // true when mode === 'closure_message' || mode === 'both'
}

// Derivation contract:
// 1. showCalendar = mode === 'calendar' || mode === 'both'
// 2. showMessage  = mode === 'closure_message' || mode === 'both'
// 3. Default (null/undefined mode) → treat as 'calendar' → showCalendar=true, showMessage=false
// 4. View mode toggle MUST be visible only when showCalendar is true
// 5. CallFAB MUST be visible only when showCalendar is true
// 6. When both are true: ClosureMessagePanel renders above calendar section

export {}
