# Data Model: Mobile Booking Manage Sections

Feature: 015 - Mobile Booking Manage Sections  
Branch: 015-init-speckit-feature  
Date: 2026-04-17

## 1. Domain Model Scope

This feature introduces no database schema changes. The model is a UI interaction model layered on top of existing booking and player data.

## 2. UI Entities

### 2.1 BookingManageSection

Represents one logical panel in the booking manage screen.

Fields:
- id: SectionId
- title: string
- isDefaultVisible: boolean
- isExpanded: boolean
- priority: number
- isLazyLoaded: boolean

SectionId values:
- core-summary
- time-adjustment
- financials
- advanced-actions

Rules:
- core-summary is always visible and not collapsible for the initial design.
- non-core sections are collapsible and expandable.
- expansion state persists during one editing session.

### 2.2 CoreSummaryContent

Represents always-visible key information.

Fields:
- playerName: string | null
- playerPhone: string | null
- playerAddress: string | null
- status: BookingStatus

Rules:
- visible at initial render.
- status is editable from this block.

### 2.3 PrimaryActionBar

Represents the sticky action area for critical operations.

Fields:
- canSave: boolean
- isSaving: boolean
- hasValidationErrors: boolean
- hasDirtyChanges: boolean

Rules:
- action bar remains visible while scrolling section content.
- save action disabled when invalid or unchanged.

### 2.4 SectionVisibilityState

Represents in-session expansion state map.

Type:
- Record<SectionId, boolean>

Rules:
- toggling one section must not reset form values in other sections.
- orientation changes should preserve visibility state during the active session.

## 3. Existing Data Dependencies

Reused from current implementation:
- Booking from src/features/booking/useBookings.ts
- Player details from usePlayerDetails
- Settings from useSettings for pricing operations

No new persistent entities are required.

## 4. State Transitions

### 4.1 Section transitions

- collapsed -> expanded on header click
- expanded -> collapsed on header click
- default open state on mount:
  - core-summary: open
  - others: closed

### 4.2 Action availability

- unchanged + valid -> save disabled
- changed + valid -> save enabled
- changed + invalid -> save disabled and inline error shown

## 5. Validation Constraints

- core summary fields are always render-safe, with null-safe fallbacks.
- section toggles must not mutate booking payload data.
- sticky action bar should remain reachable at mobile breakpoint >= 375px.

## 6. Security and Integrity Notes

- No change to RLS or auth boundaries.
- Update payload handling remains in hook/service layer.
- UI restructuring must not bypass existing mutation validation paths.
