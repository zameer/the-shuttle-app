import { useState } from 'react';
import { Outlet, NavLink } from "react-router-dom";
import { Settings, Menu, X, BarChart3, PhoneCall, PhoneIncoming, CalendarDays } from 'lucide-react';
import { useAuth } from "@/features/auth/useAuth";

export default function AdminLayout() {
  const { signOut, isSuperAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // US5: Responsive navigation items
  const navItems = [
    { to: "/admin", label: "Calendar", icon: CalendarDays, end: true },
    { to: "/admin/reports", label: "Reports", icon: BarChart3, end: false },
    { to: "/admin/callback-requests", label: "Callback Requests", icon: PhoneIncoming, end: false },
    { to: "/admin/settings", label: "Settings", icon: Settings, end: false },
    ...(isSuperAdmin
      ? [{ to: "/admin/booking-agents", label: "Booking Agents", icon: PhoneCall, end: false }]
      : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tight">THE SHUTTLE</h1>
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              {navItems.map(item => (
                <NavLink 
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({isActive}) => `flex items-center gap-1 ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"}`}
                >
                  {item.icon && <item.icon size={14} />}
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          
          {/* Mobile hamburger menu button (US5) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop logout button */}
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <span className="text-gray-500">Admin Staff</span>
            <button onClick={signOut} className="text-red-500 hover:text-red-700">Logout</button>
          </div>
        </div>

        {/* US5: Mobile navigation menu (responsive hamburger) */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t flex flex-col gap-2">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileMenuOpen(false)}
                className={({isActive}) => `flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${isActive ? "bg-blue-100 text-blue-600" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {item.icon && <item.icon size={18} />}
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                signOut()
                setMobileMenuOpen(false)
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-red-500 hover:bg-red-50 transition-colors text-left w-full"
            >
              Logout
            </button>
          </nav>
        )}
      </header>
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto border bg-white rounded-lg p-6 shadow-sm">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
