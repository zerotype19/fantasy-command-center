-- Create NFL schedule table if it doesn't exist
CREATE TABLE IF NOT EXISTS nfl_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT UNIQUE,
  week INTEGER,
  game_date TEXT,
  kickoff_time TEXT,
  home_team TEXT,
  away_team TEXT,
  location TEXT,
  network TEXT,
  game_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create unique index on game_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_nfl_schedule_game_id ON nfl_schedule(game_id);
CREATE INDEX IF NOT EXISTS idx_nfl_schedule_week ON nfl_schedule(week);
CREATE INDEX IF NOT EXISTS idx_nfl_schedule_teams ON nfl_schedule(home_team, away_team);

-- Create player_matchups table if it doesn't exist
CREATE TABLE IF NOT EXISTS player_matchups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  game_id TEXT NOT NULL,
  opponent_team TEXT NOT NULL,
  is_home BOOLEAN NOT NULL,
  game_date TEXT,
  game_time TEXT,
  network TEXT,
  weather_flag TEXT DEFAULT NULL,
  rest_days INTEGER DEFAULT NULL,
  opponent_position_rank INTEGER DEFAULT NULL,
  weather_forecast TEXT DEFAULT NULL,
  temperature_low INTEGER DEFAULT NULL,
  temperature_high INTEGER DEFAULT NULL,
  precipitation_chance INTEGER DEFAULT NULL,
  wind_speed TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_player_matchups_player_id ON player_matchups(player_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_player_matchups_unique ON player_matchups(player_id, week);

-- Create defense_strength table if it doesn't exist
CREATE TABLE IF NOT EXISTS defense_strength (
  team TEXT PRIMARY KEY,
  ecr_rank INTEGER,
  tier TEXT,
  pos_rank INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
