// contracts/SchemaContract.ts
// Feature: 028-calendar-notice-visibility
// Scope: Supabase schema change contract

// Table: public.court_settings (singleton, id=1)
// Field: player_display_mode TEXT NOT NULL DEFAULT 'calendar'

// Old constraint:
//   CHECK (player_display_mode IN ('calendar', 'closure_message'))

// New constraint (after migration):
//   CHECK (player_display_mode IN ('calendar', 'closure_message', 'both'))

// Migration strategy:
// 1. Drop the old check constraint (auto-named by Postgres or reference by name)
// 2. Add new check constraint allowing all three values
// 3. No data migration needed — existing 'calendar' and 'closure_message' rows remain valid

// TypeScript type sync:
// PlayerDisplayMode in src/features/admin/useCourtSettings.ts must match the DB constraint:
//   'calendar' | 'closure_message' | 'both'

export {}
