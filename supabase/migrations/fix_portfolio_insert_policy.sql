-- Fix portfolio INSERT policy to use optimized auth.uid() syntax
-- This resolves the RLS policy violation error

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can insert their own portfolio" ON portfolios;

-- Create the optimized policy
CREATE POLICY "Users can insert their own portfolio" 
  ON portfolios 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);
