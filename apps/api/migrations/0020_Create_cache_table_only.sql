-- Create fantasy_pros_cache table for storing API responses (only)
CREATE TABLE IF NOT EXISTS fantasy_pros_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  data_type TEXT NOT NULL,
  week INTEGER DEFAULT NULL,
  season INTEGER NOT NULL DEFAULT 2024,
  response_data TEXT NOT NULL,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient lookups (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_fantasy_pros_cache_type_week_season ON fantasy_pros_cache(data_type, week, season);
CREATE INDEX IF NOT EXISTS idx_fantasy_pros_cache_cached_at ON fantasy_pros_cache(cached_at);
