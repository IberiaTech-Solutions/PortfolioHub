-- Add location, experience_level, preferred_work_type, and languages columns to portfolios table
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS experience_level TEXT,
ADD COLUMN IF NOT EXISTS preferred_work_type TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT;

-- Convert existing preferred_work_type TEXT to TEXT[] array
-- This handles the case where data was stored as stringified arrays
UPDATE portfolios 
SET preferred_work_type = CASE 
  WHEN preferred_work_type IS NOT NULL AND preferred_work_type != '' THEN
    CASE 
      WHEN preferred_work_type LIKE '[%]' THEN
        -- Try to parse as JSON array
        CASE 
          WHEN preferred_work_type ~ '^\[.*\]$' THEN
            ARRAY(SELECT jsonb_array_elements_text(preferred_work_type::jsonb))
          ELSE
            ARRAY[preferred_work_type]
        END
      ELSE
        -- Single value, convert to array
        ARRAY[preferred_work_type]
    END
  ELSE
    NULL
END
WHERE preferred_work_type IS NOT NULL;

-- Now alter the column type to TEXT[]
ALTER TABLE portfolios 
ALTER COLUMN preferred_work_type TYPE TEXT[] USING preferred_work_type::TEXT[];

-- Add indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_portfolios_location ON portfolios(location);
CREATE INDEX IF NOT EXISTS idx_portfolios_experience_level ON portfolios(experience_level);
CREATE INDEX IF NOT EXISTS idx_portfolios_preferred_work_type ON portfolios USING GIN(preferred_work_type);
CREATE INDEX IF NOT EXISTS idx_portfolios_languages ON portfolios(languages);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "portfolios_select_policy" ON portfolios;
CREATE POLICY "portfolios_select_policy" ON portfolios
FOR SELECT USING (true);

DROP POLICY IF EXISTS "portfolios_insert_policy" ON portfolios;
CREATE POLICY "portfolios_insert_policy" ON portfolios
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolios_update_policy" ON portfolios;
CREATE POLICY "portfolios_update_policy" ON portfolios
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "portfolios_delete_policy" ON portfolios;
CREATE POLICY "portfolios_delete_policy" ON portfolios
FOR DELETE USING (auth.uid() = user_id);
