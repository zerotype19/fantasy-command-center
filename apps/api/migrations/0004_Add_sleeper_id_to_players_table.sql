-- Migration: Add sleeper_id to players table
-- Created: 2024-08-06

-- Add sleeper_id column to players table (without UNIQUE constraint initially)
ALTER TABLE players ADD COLUMN sleeper_id TEXT; 