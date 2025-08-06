-- Migration: Add trending players table
-- Created: 2024-08-06

-- Create table for trending players data
CREATE TABLE trending_players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  sleeper_id TEXT,
  type TEXT NOT NULL, -- 'add' or 'drop'
  count INTEGER NOT NULL,
  lookback_hours INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient lookups
CREATE INDEX idx_trending_players_sleeper_id ON trending_players(sleeper_id);
CREATE INDEX idx_trending_players_type ON trending_players(type);
CREATE INDEX idx_trending_players_created_at ON trending_players(created_at); 