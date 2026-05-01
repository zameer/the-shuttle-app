// contracts/AdminVisibilitySettingsContract.ts
// Feature: 028-calendar-notice-visibility
// Scope: Admin settings form behavior contract for player view mode

export type PlayerDisplayMode = 'calendar' | 'closure_message' | 'both'

// Admin form state:
// - playerDisplayMode: one of three valid values; default 'calendar'
// - closureMessageMarkdown: string; preserved across mode changes

// Initialization contract:
// - When settings load, playerDisplayMode is set from settings.player_display_mode
// - Valid values 'calendar', 'closure_message', 'both' map directly
// - Null or unrecognized value falls back to 'calendar'

// Validation contract:
// - closureMessageMarkdown.trim().length > 0 is REQUIRED when:
//     playerDisplayMode === 'closure_message'  OR
//     playerDisplayMode === 'both'
// - Saving with 'calendar' mode requires no message content

// Save contract:
// - On save: updateSettings({ player_display_mode: playerDisplayMode, closure_message_markdown })
// - Admin receives success toast on save
// - Validation error blocks save and shows inline message

// UI contract:
// - Three mode selector buttons in a 3-column grid (or wrap on mobile)
// - Message textarea is always visible (not hidden behind mode)
// - Message textarea is required only for 'closure_message' and 'both' modes

export {}
