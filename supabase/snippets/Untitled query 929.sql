-- Migration: 20260501_add_both_player_display_mode
-- Feature: 028-calendar-notice-visibility
-- Purpose: Extend player_display_mode check constraint to include 'both'

-- Drop the existing check constraint (created in a prior migration)
ALTER TABLE public.court_settings
  DROP CONSTRAINT IF EXISTS court_settings_player_display_mode_check;

-- Add updated constraint allowing all three valid values
ALTER TABLE public.court_settings
  ADD CONSTRAINT court_settings_player_display_mode_check
  CHECK (player_display_mode IN ('calendar', 'closure_message', 'both'));
