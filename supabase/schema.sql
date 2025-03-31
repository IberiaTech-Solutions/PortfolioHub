-- Create portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy for users to select any portfolio
CREATE POLICY "Anyone can view portfolios" 
  ON portfolios 
  FOR SELECT 
  USING (true);

-- Policy for users to insert their own portfolio
CREATE POLICY "Users can insert their own portfolio" 
  ON portfolios 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own portfolio
CREATE POLICY "Users can update their own portfolio" 
  ON portfolios 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for users to delete their own portfolio
CREATE POLICY "Users can delete their own portfolio" 
  ON portfolios 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update the updated_at timestamp
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON portfolios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 