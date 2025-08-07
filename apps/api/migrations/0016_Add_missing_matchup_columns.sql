-- Add missing columns to player_matchups table if they don't exist
-- This migration is safe to run multiple times

-- Add weather columns if they don't exist
ALTER TABLE player_matchups ADD COLUMN weather_forecast TEXT DEFAULT NULL;
ALTER TABLE player_matchups ADD COLUMN temperature_low INTEGER DEFAULT NULL;
ALTER TABLE player_matchups ADD COLUMN temperature_high INTEGER DEFAULT NULL;
ALTER TABLE player_matchups ADD COLUMN precipitation_chance INTEGER DEFAULT NULL;
ALTER TABLE player_matchups ADD COLUMN wind_speed TEXT DEFAULT NULL;

-- Add defense_strength table if it doesn't exist
CREATE TABLE IF NOT EXISTS defense_strength (
  team TEXT PRIMARY KEY,
  ecr_rank INTEGER,
  tier TEXT,
  pos_rank INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
