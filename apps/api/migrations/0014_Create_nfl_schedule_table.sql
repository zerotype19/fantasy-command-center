-- Create NFL schedule table
CREATE TABLE nfl_schedule (
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

-- Create unique index on game_id
CREATE UNIQUE INDEX idx_nfl_schedule_game_id ON nfl_schedule(game_id);

-- Create index for week-based queries
CREATE INDEX idx_nfl_schedule_week ON nfl_schedule(week);

-- Create index for team-based queries
CREATE INDEX idx_nfl_schedule_teams ON nfl_schedule(home_team, away_team);
