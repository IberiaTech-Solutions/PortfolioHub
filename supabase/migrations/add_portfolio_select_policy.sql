-- Add missing SELECT policy for portfolios table
-- This fixes the 406 Not Acceptable error when fetching portfolios

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view portfolios" ON portfolios;

-- Create SELECT policy to allow public read access to portfolios
CREATE POLICY "Anyone can view portfolios" 
  ON portfolios 
  FOR SELECT 
  USING (true);
