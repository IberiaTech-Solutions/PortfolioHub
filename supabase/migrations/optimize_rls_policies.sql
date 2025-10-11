-- Optimize RLS policies for better performance
-- Replace auth.<function>() with (select auth.<function>()) to avoid re-evaluation per row

-- Drop existing policies that need optimization
DROP POLICY IF EXISTS "Users can insert their own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can update their own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Users can delete their own portfolio" ON portfolios;
DROP POLICY IF EXISTS "Anyone can view collaborations" ON collaborations;
DROP POLICY IF EXISTS "Portfolio owners can manage their collaborations" ON collaborations;
DROP POLICY IF EXISTS "Collaborators can update their collaboration status" ON collaborations;
DROP POLICY IF EXISTS "Only admins can view admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Only admins can delete admin_users" ON admin_users;

-- Recreate optimized policies for portfolios table
CREATE POLICY "Users can insert their own portfolio" 
  ON portfolios 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own portfolio" 
  ON portfolios 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own portfolio" 
  ON portfolios 
  FOR DELETE 
  USING ((select auth.uid()) = user_id);

-- Recreate optimized policies for collaborations table
-- Single policy for viewing collaborations (anyone can view)
CREATE POLICY "Anyone can view collaborations" 
  ON collaborations 
  FOR SELECT 
  USING (true);

-- Policy for portfolio owners to insert collaborations
CREATE POLICY "Portfolio owners can insert collaborations" 
  ON collaborations 
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = collaborations.portfolio_id 
      AND portfolios.user_id = (select auth.uid())
    )
  );

-- Policy for portfolio owners to update collaborations
CREATE POLICY "Portfolio owners can update collaborations" 
  ON collaborations 
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = collaborations.portfolio_id 
      AND portfolios.user_id = (select auth.uid())
    )
  );

-- Policy for portfolio owners to delete collaborations
CREATE POLICY "Portfolio owners can delete collaborations" 
  ON collaborations 
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM portfolios 
      WHERE portfolios.id = collaborations.portfolio_id 
      AND portfolios.user_id = (select auth.uid())
    )
  );

-- Policy for collaborators to update their own collaboration status
CREATE POLICY "Collaborators can update their collaboration status" 
  ON collaborations 
  FOR UPDATE 
  USING (collaborator_user_id = (select auth.uid()))
  WITH CHECK (collaborator_user_id = (select auth.uid()));

-- Recreate optimized policies for admin_users table
CREATE POLICY "Only admins can view admin_users" 
  ON admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = (select auth.uid())
    )
  );

CREATE POLICY "Only admins can insert admin_users" 
  ON admin_users 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = (select auth.uid())
    )
  );

-- Add policy for admins to update admin_users (if needed)
CREATE POLICY "Only admins can update admin_users" 
  ON admin_users 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = (select auth.uid())
    )
  );

-- Add policy for admins to delete admin_users (if needed)
CREATE POLICY "Only admins can delete admin_users" 
  ON admin_users 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = (select auth.uid())
    )
  );
