-- Drop existing tables if they exist
DROP TABLE IF EXISTS portfolios CASCADE;
DROP TABLE IF EXISTS predefined_skills CASCADE;

-- Create portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  description TEXT,
  website_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create predefined skills table
CREATE TABLE predefined_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial predefined skills
INSERT INTO predefined_skills (name, category) VALUES
  -- Programming Languages
  ('JavaScript', 'Programming Languages'),
  ('TypeScript', 'Programming Languages'),
  ('Python', 'Programming Languages'),
  ('Java', 'Programming Languages'),
  ('C++', 'Programming Languages'),
  ('Ruby', 'Programming Languages'),
  ('PHP', 'Programming Languages'),
  ('Swift', 'Programming Languages'),
  ('Kotlin', 'Programming Languages'),
  ('Go', 'Programming Languages'),
  
  -- Frontend
  ('React', 'Frontend'),
  ('Vue.js', 'Frontend'),
  ('Angular', 'Frontend'),
  ('Next.js', 'Frontend'),
  ('HTML5', 'Frontend'),
  ('CSS3', 'Frontend'),
  ('Sass/SCSS', 'Frontend'),
  ('Tailwind CSS', 'Frontend'),
  ('Bootstrap', 'Frontend'),
  ('Material UI', 'Frontend'),
  
  -- Backend
  ('Node.js', 'Backend'),
  ('Express.js', 'Backend'),
  ('Django', 'Backend'),
  ('Ruby on Rails', 'Backend'),
  ('Spring Boot', 'Backend'),
  ('Laravel', 'Backend'),
  ('GraphQL', 'Backend'),
  ('REST API', 'Backend'),
  
  -- Database
  ('PostgreSQL', 'Database'),
  ('MySQL', 'Database'),
  ('MongoDB', 'Database'),
  ('Redis', 'Database'),
  ('Firebase', 'Database'),
  ('Supabase', 'Database'),
  
  -- DevOps
  ('Docker', 'DevOps'),
  ('Kubernetes', 'DevOps'),
  ('AWS', 'DevOps'),
  ('Azure', 'DevOps'),
  ('Google Cloud', 'DevOps'),
  ('CI/CD', 'DevOps'),
  ('Git', 'DevOps'),
  
  -- Design
  ('UI Design', 'Design'),
  ('UX Design', 'Design'),
  ('Figma', 'Design'),
  ('Adobe XD', 'Design'),
  ('Sketch', 'Design'),
  ('Photoshop', 'Design'),
  ('Illustrator', 'Design'),
  
  -- Mobile
  ('React Native', 'Mobile'),
  ('Flutter', 'Mobile'),
  ('iOS Development', 'Mobile'),
  ('Android Development', 'Mobile'),
  
  -- Other
  ('Agile', 'Other'),
  ('Scrum', 'Other'),
  ('Project Management', 'Other'),
  ('Technical Writing', 'Other'),
  ('SEO', 'Other'),
  ('Analytics', 'Other');

-- Set up Row Level Security (RLS)
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE predefined_skills ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for predefined_skills
CREATE POLICY "Anyone can view predefined skills" 
  ON predefined_skills 
  FOR SELECT 
  USING (true);

-- Create RLS policies for portfolios
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

-- Create admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users (only admins can view)
CREATE POLICY "Only admins can view admin_users" 
  ON admin_users 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Create policy for inserting admin users (only existing admins can add new admins)
CREATE POLICY "Only admins can insert admin_users" 
  ON admin_users 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 