import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import { AuthProvider } from './features/auth/useAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

// Layouts
import AdminLayout from './layouts/AdminLayout'
import PublicLayout from './layouts/PublicLayout'

// Auth & Admin
import AdminProtectedRoute from './features/auth/AdminProtectedRoute'
import AdminLogin from './features/auth/AdminLogin'
import AdminDashboardPage from './features/admin/AdminDashboardPage'
import AdminCalendarPage from './features/admin/AdminCalendarPage'
import AdminFinancialReportsPage from './features/admin/AdminFinancialReportsPage'

// Public
import PublicCalendarPage from './features/players/PublicCalendarPage'
import PublicTermsPage from './features/players/PublicTermsPage'
import AdminSettingsPage from './features/admin/AdminSettingsPage'

const router = createBrowserRouter([
  // PUBLIC ROUTES (No Auth Required)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <PublicCalendarPage />
      },
      {
        path: 'terms',
        element: <PublicTermsPage />
      }
    ]
  },
  
  // ADMIN LOGIN (Public but redirects if authed)
  {
    path: '/admin/login',
    element: <AdminLogin />
  },

  // PROTECTED ADMIN ROUTES (SSO + Whitelist checked)
  {
    path: '/admin',
    element: <AdminProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboardPage />
          },
          {
            path: 'calendar',
            element: <AdminCalendarPage />
          },
          {
            path: 'settings',
            element: <AdminSettingsPage />
          },
          {
            path: 'reports',
            element: <AdminFinancialReportsPage />
          }
        ]
      }
    ]
  },

  // CATCH ALL (404)
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
