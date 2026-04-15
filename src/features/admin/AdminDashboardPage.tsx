import { useState } from 'react'
import { useDashboardMetrics } from '@/features/dashboard/useDashboardMetrics'
import { format, subDays, addDays } from 'date-fns'
import { Loader2, TrendingUp, AlertCircle, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react'

export default function AdminDashboardPage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  // Normalize string for SQL match (YYYY-MM-DD local time equivalent format safely)
  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  
  const { data: metrics, isLoading } = useDashboardMetrics(dateStr)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial & Operations Dashboard</h2>
          <p className="text-gray-500">Actionable intelligence for court utilization.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white rounded-lg border p-1 shadow-sm">
          <button onClick={() => setSelectedDate(prev => subDays(prev, 1))} className="px-3 py-1 hover:bg-gray-100 rounded text-sm">&larr; Prev</button>
          <span className="font-semibold px-4 text-gray-800">{format(selectedDate, 'MMM do, yyyy')}</span>
          <button onClick={() => setSelectedDate(prev => addDays(prev, 1))} className="px-3 py-1 hover:bg-gray-100 rounded text-sm">Next &rarr;</button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center text-gray-500 mb-2">
              <CalendarIcon className="w-4 h-4 mr-2" />
              <h3 className="text-sm font-medium">Total Bookings</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.total_bookings}</p>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center text-gray-500 mb-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              <h3 className="text-sm font-medium">Expected Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{metrics.expected_revenue.toLocaleString()} <span className="text-lg text-gray-400 font-normal">LKR</span></p>
          </div>

          <div className="bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm">
            <div className="flex items-center text-green-700 mb-2">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              <h3 className="text-sm font-medium">Revenue Collected</h3>
            </div>
            <p className="text-3xl font-bold text-green-800">{metrics.collected_revenue.toLocaleString()}</p>
          </div>

          <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 shadow-sm">
            <div className="flex items-center text-yellow-700 mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              <h3 className="text-sm font-medium">Pending Output</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-800">{metrics.pending_revenue.toLocaleString()}</p>
          </div>
          
        </div>
      ) : (
        <div className="p-8 text-center bg-white border rounded shadow-sm text-gray-500">
          No metrics computed.
        </div>
      )}
    </div>
  )
}
