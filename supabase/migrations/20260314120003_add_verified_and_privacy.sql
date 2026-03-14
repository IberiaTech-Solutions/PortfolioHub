-- Verified badge and privacy controls
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS private_fields TEXT[] DEFAULT '{}';
