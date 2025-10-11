-- Fix mutable search_path security issues
-- This migration addresses the security warnings about functions with mutable search_path

-- Drop and recreate the update_updated_at_column function with SECURITY DEFINER and fixed search_path
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the triggers
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON portfolios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaborations_updated_at
BEFORE UPDATE ON collaborations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Drop and recreate the is_admin function with SECURITY DEFINER and fixed search_path
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
