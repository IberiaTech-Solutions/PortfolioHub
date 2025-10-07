-- Add additional_links column to portfolios table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolios' 
        AND column_name = 'additional_links'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN additional_links JSONB DEFAULT '[]';
    END IF;
END $$;
