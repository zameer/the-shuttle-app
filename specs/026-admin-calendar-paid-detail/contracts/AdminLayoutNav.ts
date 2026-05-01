// contracts/AdminLayoutNav.ts
// Feature: 026-admin-calendar-paid-detail
// Scope: Navigation item changes in AdminLayout.tsx (US1)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// CHANGE: navItems array in src/layouts/AdminLayout.tsx
//
// BEFORE:
//   const navItems = [
//     { to: "/admin",             label: "Dashboard",         end: true },
//     { to: "/admin/calendar",    label: "Calendar",          end: false },
//     { to: "/admin/reports",     label: "Reports",           icon: BarChart3, end: false },
//     { to: "/admin/callback-requests", label: "Callback Requests", icon: PhoneIncoming, end: false },
//     { to: "/admin/settings",    label: "Settings",          icon: Settings, end: false },
//     ...(isSuperAdmin ? [{ to: "/admin/booking-agents", label: "Booking Agents", icon: PhoneCall, end: false }] : []),
//   ]
//
// AFTER:
//   const navItems = [
//     { to: "/admin",             label: "Calendar",          icon: CalendarDays, end: true },
//     { to: "/admin/reports",     label: "Reports",           icon: BarChart3,    end: false },
//     { to: "/admin/callback-requests", label: "Callback Requests", icon: PhoneIncoming, end: false },
//     { to: "/admin/settings",    label: "Settings",          icon: Settings,     end: false },
//     ...(isSuperAdmin ? [{ to: "/admin/booking-agents", label: "Booking Agents", icon: PhoneCall, end: false }] : []),
//   ]
//
// Key changes:
//   - "Dashboard" entry removed from nav array
//   - First entry now points to "/admin" (index) with label "Calendar" + CalendarDays icon
//   - The separate "/admin/calendar" NavLink is removed (redundant — index serves the same component)
//   - All other entries unchanged
//
// Import addition required:
//   import { Settings, Menu, X, BarChart3, PhoneCall, PhoneIncoming, CalendarDays } from 'lucide-react'
// ---------------------------------------------------------------------------

export {}
