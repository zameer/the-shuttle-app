-- Migration: add address column to players table
-- (name already exists from initial schema)
ALTER TABLE players
ADD COLUMN IF NOT EXISTS address text;
