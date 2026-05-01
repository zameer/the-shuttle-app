// contracts/AppRouter.ts
// Feature: 026-admin-calendar-paid-detail
// Scope: Route changes for US1 (Calendar landing) and US2 (Paid detail page)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CHANGE 1: Admin Index Route (US1)
//
// File: src/App.tsx
//
// BEFORE:
//   { index: true, element: <AdminDashboardPage /> }
//
// AFTER:
//   { index: true, element: <AdminCalendarPage /> }
//   { path: 'dashboard', element: <AdminDashboardPage /> }
//
// Rationale: Calendar becomes the admin landing page. Dashboard remains
// accessible at /admin/dashboard for admins with bookmarks.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CHANGE 2: Paid Detail Route (US2)
//
// File: src/App.tsx
//
// NEW route nested under AdminLayout children:
//   { path: 'reports/paid-detail', element: <PaidDetailPage /> }
//
// Full path: /admin/reports/paid-detail
// Auth: Protected by existing AdminProtectedRoute guard (parent)
// Query params: ?start=YYYY-MM-DD&end=YYYY-MM-DD (both optional)
//
// BEFORE:
//   children: [
//     { index: true, element: <AdminDashboardPage /> },
//     { path: 'calendar', element: <AdminCalendarPage /> },
//     { path: 'settings', element: <AdminSettingsPage /> },
//     { path: 'reports', element: <AdminFinancialReportsPage /> },
//     { path: 'booking-agents', element: <BookingAgentConfigPage /> },
//     { path: 'callback-requests', element: <CallbackRequestsPage /> },
//   ]
//
// AFTER:
//   children: [
//     { index: true, element: <AdminCalendarPage /> },              // changed
//     { path: 'dashboard', element: <AdminDashboardPage /> },       // new
//     { path: 'calendar', element: <AdminCalendarPage /> },         // unchanged
//     { path: 'settings', element: <AdminSettingsPage /> },         // unchanged
//     { path: 'reports', element: <AdminFinancialReportsPage /> },  // unchanged
//     { path: 'reports/paid-detail', element: <PaidDetailPage /> }, // new
//     { path: 'booking-agents', element: <BookingAgentConfigPage /> }, // unchanged
//     { path: 'callback-requests', element: <CallbackRequestsPage /> }, // unchanged
//   ]
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Import additions required in src/App.tsx:
//
//   import PaidDetailPage from './features/admin/financial-reports/components/PaidDetailPage'
// ---------------------------------------------------------------------------

export {}
