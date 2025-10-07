-- Add hero_image column to portfolios table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'portfolios' 
        AND column_name = 'hero_image'
    ) THEN
        ALTER TABLE portfolios ADD COLUMN hero_image TEXT;
    END IF;
END $$;
