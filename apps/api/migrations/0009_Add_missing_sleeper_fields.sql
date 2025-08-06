-- Migration: Add missing Sleeper API fields
-- Created: 2024-08-06

-- Add missing fields from Sleeper API
ALTER TABLE players ADD COLUMN first_name TEXT;
ALTER TABLE players ADD COLUMN last_name TEXT;
ALTER TABLE players ADD COLUMN birth_date TEXT;
ALTER TABLE players ADD COLUMN birth_city TEXT;
ALTER TABLE players ADD COLUMN birth_state TEXT;
ALTER TABLE players ADD COLUMN birth_country TEXT;
ALTER TABLE players ADD COLUMN high_school TEXT;
ALTER TABLE players ADD COLUMN hashtag TEXT;
ALTER TABLE players ADD COLUMN team_abbr TEXT;
ALTER TABLE players ADD COLUMN team_changed_at TEXT;
ALTER TABLE players ADD COLUMN gsis_id TEXT;
ALTER TABLE players ADD COLUMN swish_id INTEGER;
ALTER TABLE players ADD COLUMN stats_id INTEGER;
ALTER TABLE players ADD COLUMN oddsjam_id TEXT;
ALTER TABLE players ADD COLUMN opta_id TEXT;
ALTER TABLE players ADD COLUMN pandascore_id TEXT;
ALTER TABLE players ADD COLUMN sport TEXT;
ALTER TABLE players ADD COLUMN news_updated INTEGER;
ALTER TABLE players ADD COLUMN practice_description TEXT;
ALTER TABLE players ADD COLUMN injury_body_part TEXT;
ALTER TABLE players ADD COLUMN search_first_name TEXT;
ALTER TABLE players ADD COLUMN search_last_name TEXT;
ALTER TABLE players ADD COLUMN search_full_name TEXT;
ALTER TABLE players ADD COLUMN metadata TEXT; -- JSON object as text
ALTER TABLE players ADD COLUMN competitions TEXT; -- JSON array as text 