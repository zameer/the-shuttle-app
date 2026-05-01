# Quickstart: Calendar Notice Visibility Control (Feature 028)

**Branch**: `030-create-feature-branch` | **Feature**: 028

---

## Implementation Steps

### Step 1: DB Migration

Create `supabase/migrations/20260501_add_both_player_display_mode.sql`:

```sql
-- Drop old check constraint, add new one allowing 'both'
ALTER TABLE public.court_settings
DROP CONSTRAINT IF EXISTS court_settings_player_display_mode_check;

ALTER TABLE public.court_settings
ADD CONSTRAINT court_settings_player_display_mode_check
  CHECK (player_display_mode IN ('calendar', 'closure_message', 'both'));
```

Run against your Supabase instance (local or remote).

---

### Step 2: Extend TypeScript Type

In `src/features/admin/useCourtSettings.ts`:

```ts
// Before
export type PlayerDisplayMode = 'calendar' | 'closure_message'

// After
export type PlayerDisplayMode = 'calendar' | 'closure_message' | 'both'
```

---

### Step 3: Update Admin Settings Initialization

In `src/features/admin/AdminSettingsPage.tsx`, update the `useEffect` initialization:

```ts
// Before
setPlayerDisplayMode(settings.player_display_mode === 'closure_message' ? 'closure_message' : 'calendar')

// After
const raw = settings.player_display_mode
setPlayerDisplayMode(raw === 'closure_message' ? 'closure_message' : raw === 'both' ? 'both' : 'calendar')
```

---

### Step 4: Update Admin Settings Validation

In `handleSavePlayerDisplay`, update the validation guard:

```ts
// Before
if (playerDisplayMode === 'closure_message' && closureMessageMarkdown.trim().length === 0)

// After
if ((playerDisplayMode === 'closure_message' || playerDisplayMode === 'both') && closureMessageMarkdown.trim().length === 0)
```

---

### Step 5: Add "Both" Mode Button in Admin UI

In `AdminSettingsPage.tsx`, change the Player View Mode grid from `sm:grid-cols-2` to `sm:grid-cols-3` and add the third button:

```tsx
<button
  type="button"
  onClick={() => setPlayerDisplayMode('both')}
  className={`rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
    playerDisplayMode === 'both'
      ? 'border-purple-500 bg-purple-50 text-purple-700'
      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
  }`}
>
  <p className="font-semibold">Both</p>
  <p className="text-xs mt-1 text-gray-500">Players see both the notice message and the calendar.</p>
</button>
```

---

### Step 6: Update PublicCalendarPage Visibility Logic

In `src/features/players/PublicCalendarPage.tsx`:

```ts
// Before
const isClosureMode = courtSettings?.player_display_mode === 'closure_message'

// After
const mode = courtSettings?.player_display_mode ?? 'calendar'
const showCalendar = mode === 'calendar' || mode === 'both'
const showMessage  = mode === 'closure_message' || mode === 'both'
```

Then update render logic:
- View toggle: shown only when `showCalendar`
- ClosureMessagePanel: shown when `showMessage` (always above calendar when both)
- Calendar/list section: shown when `showCalendar`
- CallFAB + CallbackModal: shown when `showCalendar`

---

## Verification Checklist

- [ ] Admin settings: 3 mode buttons visible (Calendar, Closure Message, Both)
- [ ] Select "Calendar" → save → player page shows only calendar, no notice
- [ ] Select "Closure Message" → save with message → player page shows only notice, no calendar
- [ ] Select "Both" → save with message → player page shows notice above calendar
- [ ] Select "Both" → attempt save with empty message → validation error shown, save blocked
- [ ] Select "Calendar" → attempt save with empty message → save succeeds (no message required)
- [ ] Existing `player_display_mode = 'closure_message'` row → loads correctly in admin
- [ ] Existing `player_display_mode = 'calendar'` row → loads correctly in admin
- [ ] Lint: `npm run lint` introduces no new errors

---

## Files to Change

| File | Change |
|---|---|
| `supabase/migrations/20260501_add_both_player_display_mode.sql` | **New** — DB constraint update |
| `src/features/admin/useCourtSettings.ts` | Extend `PlayerDisplayMode` type |
| `src/features/admin/AdminSettingsPage.tsx` | Add 'both' button, fix init, update validation |
| `src/features/players/PublicCalendarPage.tsx` | Replace `isClosureMode` with `showCalendar`/`showMessage` |
