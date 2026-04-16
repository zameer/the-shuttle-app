/**
 * Contract: Player Rules UI
 * Feature: 008-player-rules-modal
 *
 * Documents the RulesBanner component, the RulesModal component, and the
 * header Rules button added to PublicLayout.
 */

// ---------------------------------------------------------------------------
// Hook: useCourtRules
// Location: src/features/players/rules/useCourtRules.ts
// ---------------------------------------------------------------------------

export interface CourtRule {
  id: string
  title: string
  icon: string        // lucide-react icon name, e.g. "VolumeX"
  chip_label: string  // short label for banner chip
  detail: string      // markdown-formatted detail string
  sort_order: number
  created_at: string
}

/**
 * React Query hook — fetches all court_rules ordered by sort_order ascending.
 * No auth required (public RLS).
 *
 * queryKey: ['court-rules']
 *
 * @returns UseQueryResult<CourtRule[]>
 *   data defaults to [] when no rows exist
 */
export declare function useCourtRules(): {
  data: CourtRule[]
  isLoading: boolean
  isError: boolean
}

// ---------------------------------------------------------------------------
// Component: RulesBanner
// Location: src/features/players/rules/RulesBanner.tsx
// ---------------------------------------------------------------------------

/**
 * Props:
 *   rules: CourtRule[]        — ordered list fetched by useCourtRules
 *   onViewFullRules: () => void — opens RulesModal (callback from parent)
 *
 * Renders: nothing when rules.length === 0
 *
 * Layout (when rules present):
 *   <section role="region" aria-label="Court Rules">
 *     ┌──────────────────────────────────────────────────────┐
 *     │ ⚠ IMPORTANT – PLEASE FOLLOW THE RULES          [×]  │  ← dismissible optional
 *     │  [Icon ChipLabel] [Icon ChipLabel] ...               │
 *     │  [View Full Rules →]                                  │
 *     └──────────────────────────────────────────────────────┘
 *
 * Chip: <button role="button"> — icon (lucide) + chip_label text
 * Each chip click triggers onViewFullRules (opens modal to that section)
 *
 * Breakpoints:
 *   ≥375 px  — chips wrap to multiple lines if needed; max 2 per row on xs
 *   ≥768 px  — all chips in one row
 *   ≥1280 px — full row with comfortable spacing
 *
 * Styling: yellow/amber warning colour scheme (bg-yellow-50, border-yellow-300,
 *   text-yellow-800) to match reference image. Icon chips: bg-white border rounded-full.
 */

// ---------------------------------------------------------------------------
// Component: RulesModal
// Location: src/features/players/rules/RulesModal.tsx
// ---------------------------------------------------------------------------

/**
 * Props:
 *   open: boolean
 *   onClose: () => void
 *   rules: CourtRule[]
 *
 * Uses: shadcn/ui Dialog from src/components/ui/dialog.tsx
 *
 * Layout:
 *   <Dialog open={open} onOpenChange={onClose}>
 *     <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
 *       <DialogHeader>
 *         <DialogTitle>Court Rules</DialogTitle>
 *       </DialogHeader>
 *       {rules.map(rule => <RuleSectionAccordion key={rule.id} rule={rule} />)}
 *     </DialogContent>
 *   </Dialog>
 *
 * RuleSectionAccordion (internal):
 *   - Header: [Icon] [title]   [ChevronDown / ChevronUp]
 *   - On click: toggles expanded state (useState per section)
 *   - Expanded: renders <ReactMarkdown>{rule.detail}</ReactMarkdown>
 *   - If rule.detail is empty: header is not clickable; no chevron shown
 *
 * Accessibility:
 *   - Closeable via Escape (shadcn Dialog handles this)
 *   - Close button in DialogContent header
 *   - Focus trapped inside modal while open
 *   - Section toggle buttons have aria-expanded attribute
 *
 * react-markdown usage:
 *   import ReactMarkdown from 'react-markdown'
 *   <ReactMarkdown className="prose prose-sm max-w-none text-gray-700">
 *     {rule.detail}
 *   </ReactMarkdown>
 *   Note: @tailwindcss/typography (`prose`) must be enabled in tailwind config
 *   OR apply custom styling classes instead (simpler — see research Decision 1).
 */

// ---------------------------------------------------------------------------
// PublicLayout.tsx changes
// Location: src/layouts/PublicLayout.tsx
// ---------------------------------------------------------------------------

/**
 * State added:
 *   const [rulesOpen, setRulesOpen] = useState(false)
 *   const { data: rules = [] } = useCourtRules()
 *
 * Header — Rules button (add beside bell, left of it):
 *   {rules.length > 0 && (
 *     <button
 *       onClick={() => setRulesOpen(true)}
 *       aria-label="View court rules"
 *       className="shrink-0 self-start pt-1 p-2 rounded-full hover:bg-blue-700 transition-colors"
 *     >
 *       <ClipboardList className="w-5 h-5" />
 *     </button>
 *   )}
 *
 * Between <SponsorsSection> and <main>:
 *   {rules.length > 0 && (
 *     <RulesBanner rules={rules} onViewFullRules={() => setRulesOpen(true)} />
 *   )}
 *
 * After <main>:
 *   <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} rules={rules} />
 *
 * Header zone 3 (bell area) becomes two items: Rules button + Bell button
 * — wrap in <div className="shrink-0 self-start pt-1 flex items-center gap-1">
 */
