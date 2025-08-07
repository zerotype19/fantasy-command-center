-- Create player_matchups table
CREATE TABLE player_matchups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  game_id TEXT NOT NULL, -- unique game reference
  opponent_team TEXT NOT NULL,
  is_home BOOLEAN NOT NULL,
  game_date TEXT,
  game_time TEXT,
  network TEXT,
  weather_flag TEXT DEFAULT NULL,
  rest_days INTEGER DEFAULT NULL,
  opponent_position_rank INTEGER DEFAULT NULL, -- optional enrichment
  weather_forecast TEXT DEFAULT NULL,
  temperature_low INTEGER DEFAULT NULL,
  temperature_high INTEGER DEFAULT NULL,
  precipitation_chance INTEGER DEFAULT NULL,
  wind_speed TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_player_matchups_player_id ON player_matchups(player_id);
CREATE UNIQUE INDEX idx_player_matchups_unique ON player_matchups(player_id, week);

-- Create defense_strength table for opponent defense rankings
CREATE TABLE defense_strength (
  team TEXT PRIMARY KEY,
  ecr_rank INTEGER,
  tier TEXT,
  pos_rank INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
