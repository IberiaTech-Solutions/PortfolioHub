-- TalentAgent database schema
-- Run in Supabase SQL Editor

-- Job Applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_company TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'viewed', 'interviewing', 'offered', 'rejected', 'withdrawn')),
  fit_score INTEGER,
  notes TEXT,
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own applications" ON job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own applications" ON job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON job_applications FOR UPDATE USING (auth.uid() = user_id);

-- Add columns to portfolios table (if they don't exist)
DO $$ BEGIN
  ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'free';
  ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
  ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS featured_skills TEXT[];
  ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS video_intro_url TEXT;
  ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
  ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
