-- Migration: Initial schema
-- Created: 2024-08-06

CREATE TABLE league_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  league_id TEXT NOT NULL,
  scoring_json TEXT NOT NULL,
  roster_json TEXT NOT NULL,
  keeper_rules_json TEXT NOT NULL,
  auction_budget INTEGER NOT NULL,
  waiver_budget INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, league_id)
);

CREATE TABLE players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  espn_id TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  team TEXT NOT NULL,
  status TEXT,
  bye_week INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(espn_id)
);

CREATE TABLE projections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id INTEGER NOT NULL,
  week INTEGER NOT NULL,
  season INTEGER NOT NULL,
  projected_points REAL NOT NULL,
  source TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  league_id TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unread',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  league_id TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  player_id INTEGER NOT NULL,
  details_json TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE TABLE keepers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  league_id TEXT NOT NULL,
  player_id INTEGER NOT NULL,
  keeper_cost INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- Create triggers to automatically update the updated_at timestamp
CREATE TRIGGER update_league_settings_updated_at 
  AFTER UPDATE ON league_settings
  BEGIN
    UPDATE league_settings SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER update_players_updated_at 
  AFTER UPDATE ON players
  BEGIN
    UPDATE players SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER update_projections_updated_at 
  AFTER UPDATE ON projections
  BEGIN
    UPDATE projections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER update_alerts_updated_at 
  AFTER UPDATE ON alerts
  BEGIN
    UPDATE alerts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER update_transactions_updated_at 
  AFTER UPDATE ON transactions
  BEGIN
    UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER update_keepers_updated_at 
  AFTER UPDATE ON keepers
  BEGIN
    UPDATE keepers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;
