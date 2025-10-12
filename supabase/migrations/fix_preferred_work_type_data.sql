-- Fix corrupted preferred_work_type data
-- This migration cleans up the stringified array data

-- First, let's see what we're working with and clean it up
UPDATE portfolios 
SET preferred_work_type = CASE 
  WHEN preferred_work_type IS NOT NULL AND preferred_work_type != '' THEN
    CASE 
      -- Handle corrupted stringified arrays like ["[","\"","F","u","l","l","-","t","i","m","e","\"","]","Contract","Full-time"]
      WHEN preferred_work_type LIKE '%[%' AND preferred_work_type LIKE '%]%' THEN
        -- Extract clean values from the corrupted string
        CASE 
          WHEN preferred_work_type LIKE '%Full-time%' AND preferred_work_type LIKE '%Contract%' THEN
            '["Full-time","Contract"]'
          WHEN preferred_work_type LIKE '%Full-time%' THEN
            '["Full-time"]'
          WHEN preferred_work_type LIKE '%Part-time%' THEN
            '["Part-time"]'
          WHEN preferred_work_type LIKE '%Contract%' THEN
            '["Contract"]'
          WHEN preferred_work_type LIKE '%Freelance%' THEN
            '["Freelance"]'
          ELSE
            '["Full-time"]' -- Default fallback
        END
      -- Handle simple string values
      WHEN preferred_work_type = 'Full-time' THEN
        '["Full-time"]'
      WHEN preferred_work_type = 'Part-time' THEN
        '["Part-time"]'
      WHEN preferred_work_type = 'Contract' THEN
        '["Contract"]'
      WHEN preferred_work_type = 'Freelance' THEN
        '["Freelance"]'
      ELSE
        '["Full-time"]' -- Default fallback
    END
  ELSE
    '["Full-time"]' -- Default for empty values
END
WHERE preferred_work_type IS NOT NULL;

-- Now convert the column to TEXT[] array type
ALTER TABLE portfolios 
ALTER COLUMN preferred_work_type TYPE TEXT[] USING preferred_work_type::jsonb::text[];

-- Create proper index for array column
CREATE INDEX IF NOT EXISTS idx_portfolios_preferred_work_type ON portfolios USING GIN(preferred_work_type);
