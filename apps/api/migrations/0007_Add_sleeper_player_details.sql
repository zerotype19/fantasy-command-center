-- Migration: Add additional Sleeper player detail columns
-- Created: 2024-08-06

-- Add columns for additional player details from Sleeper API
ALTER TABLE players ADD COLUMN age INTEGER;
ALTER TABLE players ADD COLUMN years_exp INTEGER;
ALTER TABLE players ADD COLUMN college TEXT;
ALTER TABLE players ADD COLUMN weight TEXT;
ALTER TABLE players ADD COLUMN height TEXT;
ALTER TABLE players ADD COLUMN jersey_number INTEGER;
ALTER TABLE players ADD COLUMN fantasy_positions TEXT; -- JSON array as text
ALTER TABLE players ADD COLUMN fantasy_data_id INTEGER;
ALTER TABLE players ADD COLUMN search_rank INTEGER;
ALTER TABLE players ADD COLUMN injury_status TEXT;
ALTER TABLE players ADD COLUMN injury_start_date TEXT;
ALTER TABLE players ADD COLUMN injury_notes TEXT;
ALTER TABLE players ADD COLUMN practice_participation TEXT;
ALTER TABLE players ADD COLUMN depth_chart_position TEXT;
ALTER TABLE players ADD COLUMN depth_chart_order INTEGER;
ALTER TABLE players ADD COLUMN yahoo_id INTEGER;
ALTER TABLE players ADD COLUMN rotowire_id INTEGER;
ALTER TABLE players ADD COLUMN rotoworld_id INTEGER;
ALTER TABLE players ADD COLUMN sportradar_id TEXT; 