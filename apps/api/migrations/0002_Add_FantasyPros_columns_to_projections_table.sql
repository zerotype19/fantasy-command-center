-- Migration: Add FantasyPros columns to projections table
-- Created: 2024-08-06

-- Add new columns to projections table for FantasyPros data
ALTER TABLE projections ADD COLUMN adp INTEGER;
ALTER TABLE projections ADD COLUMN risk_rating TEXT;
ALTER TABLE projections ADD COLUMN tier TEXT;
ALTER TABLE projections ADD COLUMN rank INTEGER;
