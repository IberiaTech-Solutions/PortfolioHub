-- Add database indexes for better performance
-- This migration addresses the performance score of 15

-- Indexes for portfolios table
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_skills ON portfolios USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_portfolios_job_title ON portfolios(job_title);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolios_updated_at ON portfolios(updated_at);

-- Indexes for collaborations table
CREATE INDEX IF NOT EXISTS idx_collaborations_portfolio_id ON collaborations(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_status ON collaborations(status);
CREATE INDEX IF NOT EXISTS idx_collaborations_collaborator_user_id ON collaborations(collaborator_user_id);
CREATE INDEX IF NOT EXISTS idx_collaborations_created_at ON collaborations(created_at);

-- Indexes for admin_users table
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Indexes for predefined_skills table
CREATE INDEX IF NOT EXISTS idx_predefined_skills_category ON predefined_skills(category);
CREATE INDEX IF NOT EXISTS idx_predefined_skills_name ON predefined_skills(name);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_portfolios_user_job_title ON portfolios(user_id, job_title);
CREATE INDEX IF NOT EXISTS idx_collaborations_portfolio_status ON collaborations(portfolio_id, status);

-- Partial indexes for active records (using immutable expressions)
CREATE INDEX IF NOT EXISTS idx_collaborations_pending ON collaborations(portfolio_id) WHERE status = 'pending';
