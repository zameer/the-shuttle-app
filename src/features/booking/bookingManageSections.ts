export type SectionId = 'core-summary' | 'time-adjustment' | 'financials' | 'advanced-actions'

export type NonCoreSectionId = Exclude<SectionId, 'core-summary'>

export type SectionVisibilityState = Record<SectionId, boolean>

export interface BookingManageSectionMeta {
  title: string
  icon: 'clock' | 'wallet' | 'shield'
  lazyRender: boolean
}

export const DEFAULT_SECTION_VISIBILITY: SectionVisibilityState = {
  'core-summary': true,
  'time-adjustment': false,
  financials: false,
  'advanced-actions': false,
}

export const NON_CORE_SECTION_IDS: NonCoreSectionId[] = [
  'time-adjustment',
  'financials',
  'advanced-actions',
]

export const BOOKING_MANAGE_SECTION_META: Record<NonCoreSectionId, BookingManageSectionMeta> = {
  'time-adjustment': {
    title: 'Time Adjustment',
    icon: 'clock',
    lazyRender: true,
  },
  financials: {
    title: 'Financials',
    icon: 'wallet',
    lazyRender: true,
  },
  'advanced-actions': {
    title: 'Advanced Actions',
    icon: 'shield',
    lazyRender: true,
  },
}
