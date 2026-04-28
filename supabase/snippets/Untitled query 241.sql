-- Migration: add player display mode and closure message to court_settings

ALTER TABLE public.court_settings
ADD COLUMN IF NOT EXISTS player_display_mode TEXT NOT NULL DEFAULT 'calendar'
  CHECK (player_display_mode IN ('calendar', 'closure_message'));

ALTER TABLE public.court_settings
ADD COLUMN IF NOT EXISTS closure_message_markdown TEXT DEFAULT NULL;

UPDATE public.court_settings
SET player_display_mode = COALESCE(NULLIF(player_display_mode, ''), 'calendar')
WHERE id = 1;
