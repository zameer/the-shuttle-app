import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ChevronDown, ChevronUp } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RULE_ICON_MAP, DEFAULT_RULE_ICON } from './ruleIcons'
import type { CourtRule } from './useCourtRules'

interface RulesModalProps {
  open: boolean
  onClose: () => void
  rules: CourtRule[]
}

export default function RulesModal({ open, onClose, rules }: RulesModalProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" showCloseButton>
        <DialogHeader>
          <DialogTitle>Court Rules</DialogTitle>
        </DialogHeader>

        <div className="divide-y divide-gray-100 mt-2">
          {rules.map((rule) => {
            const Icon = RULE_ICON_MAP[rule.icon] ?? DEFAULT_RULE_ICON
            const isExpanded = expandedIds.has(rule.id)
            const hasDetail = rule.detail.trim().length > 0

            return (
              <div key={rule.id}>
                <button
                  onClick={() => hasDetail && toggle(rule.id)}
                  disabled={!hasDetail}
                  aria-expanded={hasDetail ? isExpanded : undefined}
                  className={`w-full flex items-center gap-3 py-3 text-left transition-colors ${
                    hasDetail ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800">{rule.title}</span>
                  {hasDetail && (
                    <span className="shrink-0 text-gray-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  )}
                </button>

                {hasDetail && isExpanded && (
                  <div className="pb-3 pl-11 pr-1">
                    <div className="text-sm text-gray-600 leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_strong]:font-semibold [&_strong]:text-gray-800 [&_p]:mb-2 [&_p:last-child]:mb-0">
                      <ReactMarkdown>{rule.detail}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
