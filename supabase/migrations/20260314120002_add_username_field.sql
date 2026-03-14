-- Add username field for vanity URLs
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Username must be lowercase, alphanumeric + hyphens, 3-30 chars
ALTER TABLE portfolios ADD CONSTRAINT username_format
  CHECK (username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$');

-- Fast lookup index
CREATE INDEX IF NOT EXISTS idx_portfolios_username ON portfolios(username);
