-- Migration: court_rules table
-- Feature: 008-player-rules-modal
-- Date: 2026-04-16

-- Enable UUID extension (already enabled in prior migrations, harmless to repeat)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Court rules table
CREATE TABLE IF NOT EXISTS public.court_rules (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT        NOT NULL,
  icon        TEXT        NOT NULL DEFAULT 'ShieldCheck',
  chip_label  TEXT        NOT NULL,
  detail      TEXT        NOT NULL DEFAULT '',
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.court_rules ENABLE ROW LEVEL SECURITY;

-- Players (including unauthenticated) can read all rules
CREATE POLICY "Public read court_rules"
  ON public.court_rules
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only admins can insert, update, or delete
CREATE POLICY "Admin manage court_rules"
  ON public.court_rules
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Seed: five initial rule sections
INSERT INTO public.court_rules (title, icon, chip_label, detail, sort_order) VALUES
  (
    'No Music Allowed',
    'VolumeX',
    'No Music',
    E'**No personal speakers or audio devices** are permitted on court.\n\n- Earphones for personal use are allowed.\n- Bluetooth speakers are strictly prohibited.\n- Respect the residential environment.',
    1
  ),
  (
    'Dress Code Required',
    'Shirt',
    'Dress Code',
    E'**Appropriate attire is mandatory.**\n\n- Non-marking sports shoes required.\n- No open-toed shoes or slippers on court.\n- Modest sportswear expected at all times.',
    2
  ),
  (
    'Maintain Silence',
    'Volume2',
    'Silence',
    E'**Keep noise to a minimum** at all times.\n\n- No shouting or loud celebrations.\n- Speak at a conversational volume.\n- This court is in a residential area — neighbours must not be disturbed.',
    3
  ),
  (
    'Respect Time Slots',
    'Clock',
    'Time Slots',
    E'**Strictly observe your booked time slot.**\n\n- Arrive on time and vacate promptly when your slot ends.\n- Do not play beyond your booking.\n- Overruns affect other players and court availability.',
    4
  ),
  (
    'Be Respectful & Responsible',
    'Users',
    'Respectful',
    E'**Treat all players, staff, and equipment with respect.**\n\n- Report any equipment damage immediately.\n- Clean up after yourself.\n- No aggressive language or behaviour will be tolerated.',
    5
  );
