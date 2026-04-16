/**
 * Contract: Rules banner interaction surface after CTA removal
 * Feature: 009-mobile-list-toggle
 */

import type { CourtRule } from '@/features/players/rules/useCourtRules'

export interface RulesBannerProps {
  rules: CourtRule[]
  onOpenRules: () => void
}

export interface RulesBannerRenderedActions {
  chipsOpenRulesModal: true
  headerRulesButtonOpenModal: true
  viewFullRulesLinkPresent: false
}

/**
 * Behavioral contract
 *
 * 1) Banner does not render at all when `rules.length === 0`.
 * 2) Banner chips remain clickable and open the same rules modal.
 * 3) No textual or button CTA labeled "View Full Rules" appears in the banner.
 */
