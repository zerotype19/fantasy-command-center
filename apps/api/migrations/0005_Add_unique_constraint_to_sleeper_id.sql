-- Migration: Add UNIQUE constraint to sleeper_id column
-- Created: 2024-08-06

-- Add UNIQUE constraint to sleeper_id column
CREATE UNIQUE INDEX idx_players_sleeper_id ON players(sleeper_id); 