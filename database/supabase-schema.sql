-- Create the jobs table in Supabase
-- Run this SQL in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
  salary_min INTEGER,
  salary_max INTEGER,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  benefits TEXT,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  application_url TEXT,
  contact_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON jobs(type);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (is_active = true);

-- Only authenticated users can insert jobs
CREATE POLICY "Authenticated users can insert jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update their own jobs
CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = posted_by);

-- Users can delete their own jobs (optional)
CREATE POLICY "Users can delete own jobs" ON jobs
  FOR DELETE USING (auth.uid() = posted_by);

-- Add a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_jobs_updated_at 
  BEFORE UPDATE ON jobs 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample job data for testing
INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, requirements, benefits, application_url, contact_email) VALUES
('Senior Frontend Developer', 'TechCorp Inc.', 'San Francisco, CA', 'full-time', 120000, 160000, 
 'We are looking for an experienced Frontend Developer to join our growing team. You will be responsible for building user-facing features using React, TypeScript, and modern web technologies.', 
 'Bachelor''s degree in Computer Science or related field. 5+ years of experience with React, TypeScript, and modern JavaScript. Experience with state management libraries like Redux or Zustand. Strong understanding of responsive design and cross-browser compatibility.',
 'Health insurance, 401k matching, flexible work arrangements, unlimited PTO',
 'https://techcorp.com/careers/frontend-dev',
 'careers@techcorp.com'),

('Product Manager', 'StartupXYZ', 'Remote', 'full-time', 90000, 130000,
 'Join our dynamic startup as a Product Manager! You''ll drive product strategy, work closely with engineering and design teams, and help shape the future of our platform.',
 'MBA or equivalent experience. 3+ years in product management. Experience with Agile methodologies. Strong analytical and communication skills. Experience with B2B SaaS products preferred.',
 'Equity package, remote work, flexible hours, learning budget',
 null,
 'jobs@startupxyz.com'),

('Junior Full Stack Developer', 'DevAgency', 'Austin, TX', 'full-time', 65000, 85000,
 'Great opportunity for a junior developer to grow their skills in a supportive environment. You''ll work on diverse client projects using React, Node.js, and various databases.',
 'Computer Science degree or bootcamp graduate. 1-2 years of experience with JavaScript. Knowledge of React and Node.js. Willingness to learn and grow. Strong problem-solving skills.',
 'Health insurance, professional development budget, casual work environment',
 'https://devagency.com/apply',
 null),

('UX Designer', 'Design Studio', 'New York, NY', 'contract', 75, 95,
 'We need a talented UX Designer for a 6-month contract to redesign our client''s e-commerce platform. You''ll conduct user research, create wireframes, and design beautiful user interfaces.',
 '3+ years of UX design experience. Proficiency in Figma, Sketch, or Adobe XD. Experience with user research and usability testing. Portfolio demonstrating mobile and web design.',
 'Flexible schedule, opportunity for full-time conversion',
 'https://designstudio.com/freelance',
 'hello@designstudio.com'),

('Data Science Intern', 'AI Labs', 'Boston, MA', 'internship', 25, 35,
 'Summer internship opportunity for students interested in machine learning and data science. You''ll work on real projects involving data analysis, model building, and visualization.',
 'Currently pursuing degree in Computer Science, Statistics, or related field. Knowledge of Python, pandas, and scikit-learn. Interest in machine learning and AI. Strong mathematical background.',
 'Mentorship program, networking opportunities, potential for full-time offer',
 null,
 'internships@ailabs.com'),

('DevOps Engineer', 'CloudTech', 'Seattle, WA', 'full-time', 110000, 140000,
 'Join our infrastructure team to help scale our cloud-native applications. You''ll work with Kubernetes, AWS, and CI/CD pipelines to ensure reliable deployments.',
 'Bachelor''s degree in Computer Science or related field. 4+ years of DevOps experience. Strong knowledge of AWS, Docker, and Kubernetes. Experience with Infrastructure as Code (Terraform, CloudFormation).',
 'Stock options, health insurance, 401k matching, conference budget',
 'https://cloudtech.com/careers',
 'devops-hiring@cloudtech.com'),

('Marketing Manager', 'GrowthCo', 'Los Angeles, CA', 'part-time', 50000, 70000,
 'Part-time Marketing Manager position perfect for someone looking for work-life balance. You''ll develop marketing strategies, manage campaigns, and analyze performance metrics.',
 'Bachelor''s degree in Marketing or related field. 3+ years of digital marketing experience. Knowledge of Google Analytics, social media platforms, and email marketing tools. Strong writing skills.',
 'Flexible schedule, work from home options, performance bonuses',
 'https://growthco.com/jobs',
 'marketing@growthco.com');
