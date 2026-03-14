-- User roles: candidate or recruiter
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'candidate';

-- Constraint to enforce valid roles
ALTER TABLE portfolios ADD CONSTRAINT user_role_valid
  CHECK (user_role IN ('candidate', 'recruiter'));

-- Add company fields for recruiters
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS company_logo TEXT;

-- Index for quick role-based queries
CREATE INDEX IF NOT EXISTS idx_portfolios_role ON portfolios(user_role);

-- Update jobs table: only recruiters should post jobs (enforced in app layer)
-- RLS policy update: recruiters can view all candidates
