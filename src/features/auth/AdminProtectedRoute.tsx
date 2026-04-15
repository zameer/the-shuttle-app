import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function AdminProtectedRoute() {
  const { session, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-medium">Verifying access...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
        <p className="text-gray-600 max-w-md">
          Your account is not on the administrative allowed list.
          Please contact the system owner to request access.
        </p>
      </div>
    )
  }

  return <Outlet />
}
