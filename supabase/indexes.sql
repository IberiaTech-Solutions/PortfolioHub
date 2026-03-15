-- Recommended indexes for PortfolioHub/TalentAgent
-- Run these in Supabase SQL Editor for better query performance

-- portfolios table
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_username ON portfolios(username);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_role ON portfolios(user_role);
CREATE INDEX IF NOT EXISTS idx_portfolios_created_at ON portfolios(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolios_is_featured ON portfolios(is_featured) WHERE is_featured = true;

-- jobs table
CREATE INDEX IF NOT EXISTS idx_jobs_is_active_created_at ON jobs(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_by ON jobs(posted_by);

-- portfolio_analytics table
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_event_type_created ON portfolio_analytics(event_type, created_at DESC);

-- collaborations table
CREATE INDEX IF NOT EXISTS idx_collaborations_portfolio_id ON collaborations(portfolio_id);

-- job_applications table (if exists)
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_at ON job_applications(applied_at DESC);

-- notifications table (if exists)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read) WHERE read = false;

-- conversations table (if exists)
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);

-- messages table (if exists)
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id, created_at DESC);

-- audit_log table (if exists)
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- Update the user_role constraint to include admin
ALTER TABLE portfolios DROP CONSTRAINT IF EXISTS user_role_valid;
ALTER TABLE portfolios ADD CONSTRAINT user_role_valid CHECK (user_role IN ('candidate', 'recruiter', 'admin'));

-- Fix RLS policy for portfolio_analytics
DROP POLICY IF EXISTS "Anyone can insert analytics" ON portfolio_analytics;
CREATE POLICY "Server can insert analytics" ON portfolio_analytics
  FOR INSERT
  WITH CHECK (portfolio_id IN (SELECT id FROM portfolios));
