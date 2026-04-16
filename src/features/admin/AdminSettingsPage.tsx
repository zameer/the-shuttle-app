import { useState, useEffect } from 'react'
import { useCourtSettings, useUpdateCourtSettings, useRecurringBlocks, useCreateRecurringBlock, useDeleteRecurringBlock } from './useCourtSettings'
import { useCreateRule, useUpdateRule, useDeleteRule, useReorderRules } from './useAdminRules'
import { useCourtRules } from '@/features/players/rules/useCourtRules'
import { RULE_ICON_MAP, RULE_ICON_OPTIONS, DEFAULT_RULE_ICON } from '@/features/players/rules/ruleIcons'
import { Loader2, Plus, Trash2, Settings, Clock, FileText, ClipboardList, ChevronUp, ChevronDown, Pencil, Check, X } from 'lucide-react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Tab = 'hours' | 'terms' | 'rules'

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<Tab>('hours')
  const [success, setSuccess] = useState<string | null>(null)

  const { data: rules = [], isLoading: rulesLoading } = useCourtRules()
  const { mutateAsync: createRule, isPending: isCreatingRule } = useCreateRule()
  const { mutateAsync: updateRule, isPending: isUpdatingRule } = useUpdateRule()
  const { mutateAsync: deleteRule } = useDeleteRule()
  const { mutateAsync: reorderRules } = useReorderRules()

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
        <button
          onClick={() => setTab('rules')}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            tab === 'rules' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ClipboardList size={15} /> Rules
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

      {tab === 'rules' && (
        <AdminRulesPanel
          rules={rules}
          isLoading={rulesLoading}
          onCreate={createRule}
          isCreating={isCreatingRule}
          onUpdate={updateRule}
          isUpdating={isUpdatingRule}
          onDelete={deleteRule}
          onReorder={reorderRules}
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Admin Rules Panel
// ---------------------------------------------------------------------------

interface AdminRulesPanelProps {
  rules: import('@/features/players/rules/useCourtRules').CourtRule[]
  isLoading: boolean
  onCreate: (input: { title: string; icon: string; chip_label: string; detail: string }) => Promise<unknown>
  isCreating: boolean
  onUpdate: (input: { id: string; title?: string; icon?: string; chip_label?: string; detail?: string }) => Promise<unknown>
  isUpdating: boolean
  onDelete: (id: string) => Promise<void>
  onReorder: (input: { aId: string; bId: string; aOrder: number; bOrder: number }) => Promise<void>
}

function AdminRulesPanel({
  rules,
  isLoading,
  onCreate,
  isCreating,
  onUpdate,
  isUpdating,
  onDelete,
  onReorder,
}: AdminRulesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editIcon, setEditIcon] = useState('ShieldCheck')
  const [editChip, setEditChip] = useState('')
  const [editDetail, setEditDetail] = useState('')

  const [addTitle, setAddTitle] = useState('')
  const [addIcon, setAddIcon] = useState('ShieldCheck')
  const [addChip, setAddChip] = useState('')
  const [addDetail, setAddDetail] = useState('')

  const startEdit = (rule: import('@/features/players/rules/useCourtRules').CourtRule) => {
    setEditingId(rule.id)
    setEditTitle(rule.title)
    setEditIcon(rule.icon)
    setEditChip(rule.chip_label)
    setEditDetail(rule.detail)
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async (id: string) => {
    await onUpdate({ id, title: editTitle, icon: editIcon, chip_label: editChip, detail: editDetail })
    setEditingId(null)
  }

  const handleAdd = async () => {
    if (!addTitle.trim() || !addChip.trim()) return
    await onCreate({ title: addTitle.trim(), icon: addIcon, chip_label: addChip.trim(), detail: addDetail })
    setAddTitle('')
    setAddIcon('ShieldCheck')
    setAddChip('')
    setAddDetail('')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this rule section?')) return
    await onDelete(id)
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800 mb-1">Court Rule Sections</h3>
        <p className="text-sm text-gray-500 mb-4">These sections appear in the player banner and rules modal.</p>

        {rules.length === 0 ? (
          <p className="text-sm text-gray-400 italic mb-4">No rule sections yet. Add one below.</p>
        ) : (
          <ul className="divide-y border rounded-lg overflow-hidden mb-4">
            {rules.map((rule, index) => {
              const Icon = RULE_ICON_MAP[rule.icon] ?? DEFAULT_RULE_ICON
              const isEditing = editingId === rule.id

              return (
                <li key={rule.id} className="bg-gray-50 hover:bg-gray-100 px-4 py-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                          <input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Chip Label</label>
                          <input
                            value={editChip}
                            onChange={e => setEditChip(e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
                        <select
                          value={editIcon}
                          onChange={e => setEditIcon(e.target.value)}
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {RULE_ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Detail (markdown)</label>
                        <textarea
                          value={editDetail}
                          onChange={e => setEditDetail(e.target.value)}
                          rows={4}
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(rule.id)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded disabled:opacity-60 transition-colors"
                        >
                          {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded transition-colors"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-800">{rule.title}</span>
                        <span className="ml-2 text-xs text-gray-400">({rule.chip_label})</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onReorder({ aId: rules[index - 1].id, bId: rule.id, aOrder: rules[index - 1].sort_order, bOrder: rule.sort_order })}
                          disabled={index === 0}
                          aria-label="Move up"
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                        >
                          <ChevronUp size={15} />
                        </button>
                        <button
                          onClick={() => onReorder({ aId: rule.id, bId: rules[index + 1].id, aOrder: rule.sort_order, bOrder: rules[index + 1].sort_order })}
                          disabled={index === rules.length - 1}
                          aria-label="Move down"
                          className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 transition-colors"
                        >
                          <ChevronDown size={15} />
                        </button>
                        <button
                          onClick={() => startEdit(rule)}
                          aria-label="Edit rule"
                          className="p-1 text-blue-400 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          aria-label="Delete rule"
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        {/* Add new rule */}
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Rule Section</h4>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
              <input
                value={addTitle}
                onChange={e => setAddTitle(e.target.value)}
                placeholder="e.g. No Smoking"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Chip Label *</label>
              <input
                value={addChip}
                onChange={e => setAddChip(e.target.value)}
                placeholder="e.g. No Smoking"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
            <select
              value={addIcon}
              onChange={e => setAddIcon(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {RULE_ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Detail (markdown)</label>
            <textarea
              value={addDetail}
              onChange={e => setAddDetail(e.target.value)}
              rows={4}
              placeholder="**Bold** and - bullet lists supported"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
            />
          </div>
        </div>
        <button
          onClick={handleAdd}
          disabled={isCreating || !addTitle.trim() || !addChip.trim()}
          className="mt-3 flex items-center gap-2 border border-blue-200 text-blue-600 hover:bg-blue-50 text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-60 transition-colors"
        >
          {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Add Rule Section
        </button>
      </div>
    </div>
  )
}
