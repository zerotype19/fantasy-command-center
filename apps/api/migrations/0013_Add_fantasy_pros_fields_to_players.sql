-- Add missing FantasyPros fields to players table
ALTER TABLE players ADD COLUMN tier INTEGER;
ALTER TABLE players ADD COLUMN position_rank INTEGER;
ALTER TABLE players ADD COLUMN value_over_replacement REAL;
ALTER TABLE players ADD COLUMN auction_value INTEGER;
ALTER TABLE players ADD COLUMN projected_points REAL;
ALTER TABLE players ADD COLUMN sos_rank INTEGER;
ALTER TABLE players ADD COLUMN fantasy_pros_updated_at DATETIME;

-- Add index for FantasyPros data queries
CREATE INDEX idx_players_fantasy_pros ON players(search_rank, tier, projected_points);
