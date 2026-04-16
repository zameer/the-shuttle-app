import { ChevronRight } from 'lucide-react'
import { RULE_ICON_MAP, DEFAULT_RULE_ICON } from './ruleIcons'
import type { CourtRule } from './useCourtRules'

interface RulesBannerProps {
  rules: CourtRule[]
  onViewFullRules: () => void
}

export default function RulesBanner({ rules, onViewFullRules }: RulesBannerProps) {
  if (rules.length === 0) return null

  return (
    <section
      role="region"
      aria-label="Court Rules"
      className="w-full bg-yellow-50 border-y border-yellow-300"
    >
      <div className="max-w-[1400px] mx-auto px-4 py-3 sm:px-6">
        <p className="text-xs font-bold text-yellow-800 uppercase tracking-wide mb-2">
          ⚠ Important — Please Follow the Rules
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {rules.map((rule) => {
            const Icon = RULE_ICON_MAP[rule.icon] ?? DEFAULT_RULE_ICON
            return (
              <button
                key={rule.id}
                onClick={onViewFullRules}
                className="flex items-center gap-1.5 bg-white border border-yellow-300 text-yellow-800 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-yellow-100 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {rule.chip_label}
              </button>
            )
          })}
        </div>
        <button
          onClick={onViewFullRules}
          className="flex items-center gap-1 text-xs font-semibold text-yellow-700 hover:text-yellow-900 transition-colors"
        >
          View Full Rules <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  )
}
