-- Jobs table for job listings
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  company_logo TEXT,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT,
  work_type TEXT DEFAULT 'full-time', -- full-time, part-time, contract, freelance
  remote_policy TEXT DEFAULT 'remote', -- remote, hybrid, onsite
  experience_level TEXT, -- junior, mid, senior, lead
  salary_min INTEGER,
  salary_max INTEGER,
  salary_currency TEXT DEFAULT 'USD',
  skills TEXT[] DEFAULT '{}',
  application_url TEXT,
  application_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active jobs
CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (is_active = true);

-- Authenticated users can post jobs
CREATE POLICY "Authenticated users can post jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = posted_by);

-- Users can update their own job posts
CREATE POLICY "Users can update their own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = posted_by);

-- Users can delete their own job posts
CREATE POLICY "Users can delete their own jobs" ON jobs
  FOR DELETE USING (auth.uid() = posted_by);

-- Performance index
CREATE INDEX idx_jobs_active ON jobs(is_active, created_at DESC);
CREATE INDEX idx_jobs_skills ON jobs USING GIN(skills);
CREATE INDEX idx_jobs_posted_by ON jobs(posted_by);
