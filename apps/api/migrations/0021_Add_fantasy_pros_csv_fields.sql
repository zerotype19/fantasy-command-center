-- Add FantasyPros CSV import fields to players table
ALTER TABLE players ADD COLUMN fantasy_pros_draft_rank INTEGER DEFAULT NULL;
ALTER TABLE players ADD COLUMN fantasy_pros_tier INTEGER DEFAULT NULL;
ALTER TABLE players ADD COLUMN fantasy_pros_position_rank INTEGER DEFAULT NULL;
ALTER TABLE players ADD COLUMN fantasy_pros_sos_rating TEXT DEFAULT NULL;
ALTER TABLE players ADD COLUMN fantasy_pros_ecr_vs_adp TEXT DEFAULT NULL;
ALTER TABLE players ADD COLUMN fantasy_pros_csv_updated_at DATETIME DEFAULT NULL;

-- Create index for draft rank lookups
CREATE INDEX IF NOT EXISTS idx_players_fantasy_pros_draft_rank ON players(fantasy_pros_draft_rank);
CREATE INDEX IF NOT EXISTS idx_players_fantasy_pros_tier ON players(fantasy_pros_tier);
