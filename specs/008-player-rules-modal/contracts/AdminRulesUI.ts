/**
 * Contract: Admin Rules Management UI
 * Feature: 008-player-rules-modal
 *
 * Documents the admin CRUD hooks and the new "Rules" tab in AdminSettingsPage.
 */

// ---------------------------------------------------------------------------
// Hooks: useAdminRules (mutations)
// Location: src/features/admin/useAdminRules.ts
// ---------------------------------------------------------------------------

import type { CourtRule } from './PlayerRulesUI'

export interface CreateRuleInput {
  title: string
  icon: string
  chip_label: string
  detail: string
  sort_order: number
}

export interface UpdateRuleInput {
  id: string
  title?: string
  icon?: string
  chip_label?: string
  detail?: string
}

/**
 * useCreateRule()
 *   mutationFn: INSERT into court_rules; sets sort_order = max(sort_order) + 1
 *   onSuccess: invalidate ['court-rules']
 *
 * useUpdateRule()
 *   mutationFn: UPDATE court_rules SET ... WHERE id = input.id
 *   onSuccess: invalidate ['court-rules']
 *
 * useDeleteRule()
 *   mutationFn: DELETE FROM court_rules WHERE id = ruleId
 *   onSuccess: invalidate ['court-rules']
 *
 * useReorderRules()
 *   mutationFn: given two rule ids (a, b), swap their sort_order values
 *     — UPDATE court_rules SET sort_order = b.sort_order WHERE id = a.id
 *     — UPDATE court_rules SET sort_order = a.sort_order WHERE id = b.id
 *   onSuccess: invalidate ['court-rules']
 *   Note: two sequential .update() calls; no transaction needed for a
 *   single-court club with non-concurrent admin usage.
 */

export declare function useCreateRule(): {
  mutateAsync: (input: CreateRuleInput) => Promise<CourtRule>
  isPending: boolean
}

export declare function useUpdateRule(): {
  mutateAsync: (input: UpdateRuleInput) => Promise<CourtRule>
  isPending: boolean
}

export declare function useDeleteRule(): {
  mutateAsync: (id: string) => Promise<void>
  isPending: boolean
}

export declare function useReorderRules(): {
  mutateAsync: (ids: { aId: string; bId: string; aOrder: number; bOrder: number }) => Promise<void>
  isPending: boolean
}

// ---------------------------------------------------------------------------
// AdminSettingsPage.tsx changes
// Location: src/features/admin/AdminSettingsPage.tsx
// ---------------------------------------------------------------------------

/**
 * Tab type change:
 *   BEFORE: type Tab = 'hours' | 'terms'
 *   AFTER:  type Tab = 'hours' | 'terms' | 'rules'
 *
 * New tab button (add after Terms tab):
 *   <button onClick={() => setTab('rules')} ...>
 *     <ClipboardList size={15} /> Rules
 *   </button>
 *
 * New Rules tab panel (add after Terms panel):
 *
 *   {tab === 'rules' && (
 *     <AdminRulesPanel />
 *   )}
 *
 * AdminRulesPanel (can be inline JSX or extracted to AdminRulesPanel.tsx):
 *
 *   — Calls: useCourtRules(), useCreateRule(), useUpdateRule(),
 *            useDeleteRule(), useReorderRules()
 *
 *   — List:
 *     rules.map((rule, index) => (
 *       <div key={rule.id} className="flex items-center gap-2 border rounded p-3">
 *         [ResolvedIcon]     ← from RULE_ICON_MAP[rule.icon] ?? ShieldCheck
 *         [rule.title]
 *         [rule.chip_label]
 *         [↑ up button]      ← disabled when index === 0
 *         [↓ down button]    ← disabled when index === rules.length - 1
 *         [Edit button]      ← opens inline edit form
 *         [Delete button]    ← confirm then mutate
 *       </div>
 *     ))
 *
 *   — Add Rule form (below list):
 *     Fields: title (text input, required), icon (select from RULE_ICON_OPTIONS),
 *             chip_label (text input, required), detail (textarea, markdown)
 *     Submit: calls useCreateRule().mutateAsync(...)
 *
 *   — Inline edit: clicking Edit replaces the row with an edit form
 *     (same fields as Add); submit calls useUpdateRule()
 *
 *   — Delete: calls useDeleteRule() with confirmation (window.confirm or
 *     an inline confirmation state)
 *
 *   — Reorder: ↑ calls useReorderRules with current and previous rule's ids+orders;
 *              ↓ calls useReorderRules with current and next rule's ids+orders
 */
