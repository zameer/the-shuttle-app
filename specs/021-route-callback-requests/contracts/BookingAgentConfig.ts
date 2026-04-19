/**
 * Contract: Booking Agent Configuration (Super-Admin)
 * Feature: 021-route-callback-requests
 *
 * Super-admin–only UI for creating, editing, and deleting Booking Agent records.
 * Manages work phone numbers, availability toggles, primary-contact flags, and priority order.
 *
 * FR-012b, FR-004a, FR-005a
 */

// ---------------------------------------------------------------------------
// Booking Agent record (mirrors DB table)
// ---------------------------------------------------------------------------

export interface BookingAgent {
  email: string
  displayName: string
  workPhone: string
  isPrimary: boolean
  priorityOrder: number    // lower = higher routing priority
  isAvailable: boolean
  updatedAt: string        // ISO timestamp
}

// ---------------------------------------------------------------------------
// Form schema for create/edit
// ---------------------------------------------------------------------------

export interface BookingAgentFormValues {
  email: string          // must exist in admin_users; required on create; readonly on edit
  displayName: string    // min 1, max 80
  workPhone: string      // min 7, max 20; digits, spaces, +, -; work number only
  isPrimary: boolean     // at most 2 agents marked primary (enforced server-side)
  priorityOrder: number  // 1–99; used for non-primary ordering
  isAvailable: boolean
}

// ---------------------------------------------------------------------------
// Component contracts
// ---------------------------------------------------------------------------

export interface BookingAgentConfigPageProps {
  /** Only renders content if the current user is a super-admin; otherwise shows access-denied */
  isSuperAdmin: boolean
}

export interface BookingAgentTableProps {
  agents: BookingAgent[]
  isLoading: boolean
  onEdit: (agent: BookingAgent) => void
  onDelete: (email: string) => void
  onToggleAvailability: (email: string, isAvailable: boolean) => void
}

export interface BookingAgentFormModalProps {
  /** undefined = create mode; BookingAgent = edit mode */
  agent?: BookingAgent
  onSuccess: () => void
  onCancel: () => void
}

// ---------------------------------------------------------------------------
// Validation rules (to be enforced by Zod schema + DB constraint)
// ---------------------------------------------------------------------------

/**
 * - Maximum 2 agents may have isPrimary = true (enforced via CHECK constraint or trigger)
 * - priorityOrder must be unique per agent row
 * - workPhone must not be a personal number (convention only; enforced by super-admin policy)
 * - email must reference an existing admin_users row (FK constraint)
 */
export interface BookingAgentValidationNotes {
  maxPrimaryContacts: 2
  priorityOrderRange: [1, 99]
  workPhonePattern: string  // e.g. /^[+\d\s()-]{7,20}$/
}
