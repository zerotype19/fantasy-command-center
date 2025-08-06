-- Migration: Cleanup FantasyPros columns and add player status
-- Created: 2024-08-06

-- Remove FantasyPros-specific columns from projections table
ALTER TABLE projections DROP COLUMN adp;
ALTER TABLE projections DROP COLUMN risk_rating;
ALTER TABLE projections DROP COLUMN tier;
ALTER TABLE projections DROP COLUMN rank;

-- Add status column to players table (already exists in schema, but ensuring it's there)
-- Note: status column already exists in the initial schema, so this is just for documentation 