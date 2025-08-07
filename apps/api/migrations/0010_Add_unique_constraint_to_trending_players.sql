-- Migration: Add unique constraint to trending players table
-- Created: 2024-12-19

-- Add unique constraint to prevent duplicate trending player entries
CREATE UNIQUE INDEX idx_trending_players_unique ON trending_players(player_id, type, lookback_hours);
