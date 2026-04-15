import { useState, useEffect } from 'react'
import { useCourtSettings, useUpdateCourtSettings, useRecurringBlocks, useCreateRecurringBlock, useDeleteRecurringBlock } from './useCourtSettings'
import { Loader2, Plus, Trash2, Settings, Clock, FileText } from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Tab = 'hours' | 'terms'

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('hours')
  const [success, setSuccess] = useState<string | null>(null)

  const { data: settings, isLoading: settingsLoading } = useCourtSettings()
  const { mutateAsync: updateSettings, isPending: isSavingSettings } = useUpdateCourtSettings()
  const { data: blocks = [], isLoading: blocksLoading } = useRecurringBlocks()
  const { mutateAsync: createBlock, isPending: isCreatingBlock } = useCreateRecurringBlock()
  const { mutateAsync: deleteBlock } = useDeleteRecurringBlock()

  // Court hours form
  const [openTime, setOpenTime] = useState('06:00')
  const [closeTime, setCloseTime] = useState('23:00')
  const [defaultRate, setDefaultRate] = useState(600)
  const [ratesInput, setRatesInput] = useState('600, 500')

  // Terms form
  const [termsText, setTermsText] = useState('')

  // New recurring block form
  const [newDay, setNewDay] = useState(1)
  const [newStart, setNewStart] = useState('08:00')
  const [newEnd, setNewEnd] = useState('10:00')
  const [newLabel, setNewLabel] = useState('Maintenance')

  useEffect(() => {
    if (settings) {
      setOpenTime(settings.court_open_time.slice(0, 5))
      setCloseTime(settings.court_close_time.slice(0, 5))
      setDefaultRate(settings.default_hourly_rate)
      setRatesInput(settings.available_rates.join(', '))
      setTermsText(settings.terms_and_conditions ?? '')
    }
  }, [settings])

  const showSuccess = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleSaveHours = async () => {
    const rates = ratesInput.split(',').map(r => parseInt(r.trim())).filter(n => !isNaN(n))
    await updateSettings({
      court_open_time: `${openTime}:00`,
      court_close_time: `${closeTime}:00`,
      default_hourly_rate: defaultRate,
      available_rates: rates,
    })
    showSuccess('Court hours & rates saved!')
  }

  const handleSaveTerms = async () => {
    await updateSettings({ terms_and_conditions: termsText })
    showSuccess('Terms & Conditions saved!')
  }

  const handleAddBlock = async () => {
    await createBlock({
      day_of_week: newDay,
      start_time: `${newStart}:00`,
      end_time: `${newEnd}:00`,
      label: newLabel || 'Maintenance'
    })
    showSuccess('Recurring block added!')
  }

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" /> Court Settings
        </h2>
        <p className="text-gray-500 mt-1">Configure court operating hours, pricing, recurring blocks, and Terms & Conditions.</p>
      </div>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
          ✓ {success}
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b mb-6 gap-1">
        <button
          onClick={() => setTab('hours')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'hours' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock size={15} /> Hours & Pricing
        </button>
        <button
          onClick={() => setTab('terms')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'terms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText size={15} /> Terms & Conditions
        </button>
      </div>

      {tab === 'hours' && (
        <div className="space-y-8">
          {/* Court Hours + Pricing */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Operating Hours & Rates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Court Opens</label>
                <input
                  type="time"
                  value={openTime}
                  onChange={e => setOpenTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Court Closes</label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={e => setCloseTime(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Rate (LKR/hr)</label>
                <input
                  type="number"
                  value={defaultRate}
                  onChange={e => setDefaultRate(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Available Rates (comma separated)</label>
                <input
                  type="text"
                  value={ratesInput}
                  onChange={e => setRatesInput(e.target.value)}
                  placeholder="600, 500"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleSaveHours}
              disabled={isSavingSettings}
              className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-60 transition-colors"
            >
              {isSavingSettings ? <Loader2 size={14} className="animate-spin" /> : null}
              Save Hours & Rates
            </button>
          </div>

          {/* Recurring unavailable blocks */}
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4">Recurring Unavailable Blocks</h3>
            <p className="text-sm text-gray-500 mb-4">These time slots will be automatically blocked on the calendar every week.</p>

            {/* Existing blocks */}
            {blocksLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
            ) : blocks.length === 0 ? (
              <p className="text-sm text-gray-400 italic mb-4">No recurring blocks set.</p>
            ) : (
              <ul className="divide-y mb-4 border rounded-lg overflow-hidden">
                {blocks.map(block => (
                  <li key={block.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100">
                    <div>
                      <span className="font-medium text-sm text-gray-800">{DAYS[block.day_of_week]}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {block.start_time.slice(0,5)} – {block.end_time.slice(0,5)}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">{block.label}</span>
                    </div>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add new block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
                <select
                  value={newDay}
                  onChange={e => setNewDay(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Start</label>
                <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">End</label>
                <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                <input type="text" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Maintenance"
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <button
              onClick={handleAddBlock}
              disabled={isCreatingBlock}
              className="mt-3 flex items-center gap-2 border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60 transition-colors"
            >
              {isCreatingBlock ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add Block
            </button>
          </div>
        </div>
      )}

      {tab === 'terms' && (
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-gray-800 mb-2">Terms & Conditions</h3>
          <p className="text-sm text-gray-500 mb-4">This content will be shown publicly at <code className="bg-gray-100 px-1 rounded">/terms</code>.</p>
          <textarea
            value={termsText}
            onChange={e => setTermsText(e.target.value)}
            rows={16}
            placeholder="Write your court terms and conditions here..."
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
          />
          <button
            onClick={handleSaveTerms}
            disabled={isSavingSettings}
            className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-60 transition-colors"
          >
            {isSavingSettings ? <Loader2 size={14} className="animate-spin" /> : null}
            Save Terms & Conditions
          </button>
        </div>
      )}
    </div>
  )
}
