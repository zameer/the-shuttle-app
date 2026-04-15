import { Outlet, NavLink } from "react-router-dom";
import { Settings } from 'lucide-react';
import { useAuth } from "@/features/auth/useAuth";

export default function AdminLayout() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <NavLink to="/admin" end className={({isActive}) => isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}>Dashboard</NavLink>
            <NavLink to="/admin/calendar" className={({isActive}) => isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}>Calendar</NavLink>
            <NavLink to="/admin/settings" className={({isActive}) => `flex items-center gap-1 ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}>
              <Settings size={14} /> Settings
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="text-gray-500">Admin Staff</span>
          <button onClick={signOut} className="text-red-500 hover:text-red-700">Logout</button>
        </div>
      </header>
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto border bg-white rounded-lg p-6 shadow-sm">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
