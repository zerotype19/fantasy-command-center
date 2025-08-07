-- Migration: Add FantasyPros data table
-- Created: 2024-12-19

-- Create table for FantasyPros projections, rankings, and auction values
CREATE TABLE fantasy_pros_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Reference to players table
  sleeper_id TEXT NOT NULL,
  
  -- FantasyPros Core Data
  source TEXT NOT NULL, -- e.g., "FantasyPros"
  week INTEGER,
  season INTEGER,
  ecr_rank INTEGER,
  projected_points REAL,
  auction_value INTEGER,
  sos_rank INTEGER,
  tier INTEGER,
  position_rank INTEGER,
  value_over_replacement REAL,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key relation
  FOREIGN KEY (sleeper_id) REFERENCES players(sleeper_id)
);

-- Create unique index to prevent duplicate entries
CREATE UNIQUE INDEX idx_fantasy_pros_data_unique ON fantasy_pros_data(sleeper_id, week, season);

-- Create index for efficient lookups
CREATE INDEX idx_fantasy_pros_data_sleeper_id ON fantasy_pros_data(sleeper_id);
CREATE INDEX idx_fantasy_pros_data_week_season ON fantasy_pros_data(week, season);
