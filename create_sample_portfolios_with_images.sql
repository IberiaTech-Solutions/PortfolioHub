-- Create 5 sample portfolios with reliable placeholder images
-- This script uses Picsum (Lorem Picsum) for reliable placeholder images
-- Note: You'll need to run this in the Supabase SQL Editor

-- First, delete any existing sample portfolios to avoid duplicates
DELETE FROM portfolios WHERE user_id IN (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005'
);

-- Sample portfolio 1: Full-Stack Developer
INSERT INTO portfolios (
  user_id,
  title,
  description,
  website_url,
  github_url,
  linkedin_url,
  skills,
  job_title,
  name,
  location,
  experience_level,
  preferred_work_type,
  languages,
  profile_image,
  hero_image
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Modern Web Applications',
  'Passionate full-stack developer with 5+ years of experience building scalable web applications using React, Node.js, and modern cloud technologies.',
  'https://example-portfolio-1.com',
  'https://github.com/johndoe',
  'https://linkedin.com/in/johndoe',
  ARRAY['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
  'Full-Stack Developer',
  'John Doe',
  'San Francisco, CA',
  'Mid-level',
  ARRAY['Full-time', 'Contract'],
  'English, Spanish',
  'https://picsum.photos/200/200?random=1',
  'https://picsum.photos/400/200?random=11'
);

-- Sample portfolio 2: UI/UX Designer
INSERT INTO portfolios (
  user_id,
  title,
  description,
  website_url,
  github_url,
  linkedin_url,
  skills,
  job_title,
  name,
  location,
  experience_level,
  preferred_work_type,
  languages,
  profile_image,
  hero_image
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Creative Digital Experiences',
  'Senior UI/UX designer with 7+ years of experience creating beautiful, user-centered digital experiences. Expert in design systems and prototyping.',
  'https://example-portfolio-2.com',
  'https://github.com/janesmith',
  'https://linkedin.com/in/janesmith',
  ARRAY['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Design Systems'],
  'UI/UX Designer',
  'Jane Smith',
  'New York, NY',
  'Senior',
  ARRAY['Full-time', 'Freelance'],
  'English, French',
  'https://picsum.photos/200/200?random=2',
  'https://picsum.photos/400/200?random=12'
);

-- Sample portfolio 3: Data Scientist
INSERT INTO portfolios (
  user_id,
  title,
  description,
  website_url,
  github_url,
  linkedin_url,
  skills,
  job_title,
  name,
  location,
  experience_level,
  preferred_work_type,
  languages,
  profile_image,
  hero_image
) VALUES (
  '00000000-0000-0000-0000-000000000003',
  'Data-Driven Solutions',
  'Data scientist with 4+ years of experience in machine learning and statistical analysis. Specialized in Python, R, and cloud-based analytics.',
  'https://example-portfolio-3.com',
  'https://github.com/mikejohnson',
  'https://linkedin.com/in/mikejohnson',
  ARRAY['Python', 'R', 'Machine Learning', 'TensorFlow', 'Pandas', 'SQL'],
  'Data Scientist',
  'Mike Johnson',
  'Seattle, WA',
  'Mid-level',
  ARRAY['Full-time', 'Contract'],
  'English, German',
  'https://picsum.photos/200/200?random=3',
  'https://picsum.photos/400/200?random=13'
);

-- Sample portfolio 4: DevOps Engineer
INSERT INTO portfolios (
  user_id,
  title,
  description,
  website_url,
  github_url,
  linkedin_url,
  skills,
  job_title,
  name,
  location,
  experience_level,
  preferred_work_type,
  languages,
  profile_image,
  hero_image
) VALUES (
  '00000000-0000-0000-0000-000000000004',
  'Cloud Infrastructure & Automation',
  'DevOps engineer with 6+ years of experience in cloud infrastructure and CI/CD pipelines. Expert in AWS, Kubernetes, and Docker.',
  'https://example-portfolio-4.com',
  'https://github.com/sarahwilson',
  'https://linkedin.com/in/sarahwilson',
  ARRAY['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Python'],
  'DevOps Engineer',
  'Sarah Wilson',
  'Austin, TX',
  'Mid-level',
  ARRAY['Full-time', 'Part-time'],
  'English, Portuguese',
  'https://picsum.photos/200/200?random=4',
  'https://picsum.photos/400/200?random=14'
);

-- Sample portfolio 5: Mobile Developer
INSERT INTO portfolios (
  user_id,
  title,
  description,
  website_url,
  github_url,
  linkedin_url,
  skills,
  job_title,
  name,
  location,
  experience_level,
  preferred_work_type,
  languages,
  profile_image,
  hero_image
) VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Native & Cross-Platform Mobile Apps',
  'Mobile developer with 5+ years of experience building native iOS and Android applications using React Native and Flutter.',
  'https://example-portfolio-5.com',
  'https://github.com/alexbrown',
  'https://linkedin.com/in/alexbrown',
  ARRAY['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'iOS'],
  'Mobile Developer',
  'Alex Brown',
  'Los Angeles, CA',
  'Mid-level',
  ARRAY['Full-time', 'Freelance', 'Contract'],
  'English, Japanese',
  'https://picsum.photos/200/200?random=5',
  'https://picsum.photos/400/200?random=15'
);
