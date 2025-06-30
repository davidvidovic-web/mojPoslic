-- Sample data for testing the job board
-- Run this SQL in your Supabase SQL editor after creating the jobs table

INSERT INTO jobs (title, company, location, type, salary_min, salary_max, description, requirements, benefits, application_url, contact_email) VALUES
(
  'Senior Frontend Developer',
  'TechCorp Inc.',
  'San Francisco, CA',
  'full-time',
  120000,
  160000,
  'We are looking for an experienced Frontend Developer to join our growing team. You will be responsible for building and maintaining our web applications using modern JavaScript frameworks.',
  'Bachelor''s degree in Computer Science or related field. 5+ years of experience with React, TypeScript, and modern frontend development. Experience with state management libraries (Redux, Zustand). Strong understanding of CSS and responsive design.',
  'Health insurance, 401k matching, flexible PTO, remote work options, professional development budget',
  'https://techcorp.com/careers/frontend-dev',
  'hr@techcorp.com'
),
(
  'Product Manager',
  'StartupXYZ',
  'Remote',
  'full-time',
  90000,
  130000,
  'Join our product team to drive the strategy and execution of our core product features. You will work closely with engineering, design, and business teams to deliver exceptional user experiences.',
  '3+ years of product management experience. Strong analytical skills and data-driven decision making. Experience with agile development processes. Excellent communication and leadership skills.',
  'Equity package, health insurance, unlimited PTO, home office stipend',
  NULL,
  'jobs@startupxyz.com'
),
(
  'UX/UI Designer',
  'DesignStudio',
  'New York, NY',
  'contract',
  75000,
  95000,
  'We need a talented UX/UI Designer for a 6-month contract to redesign our flagship product. You will conduct user research, create wireframes, and design beautiful, intuitive interfaces.',
  'Portfolio demonstrating strong UX/UI design skills. Proficiency in Figma, Sketch, or similar design tools. Experience with user research and usability testing. Understanding of design systems.',
  'Competitive hourly rate, potential for extension, collaborative team environment',
  'https://designstudio.com/apply',
  NULL
),
(
  'Data Scientist Intern',
  'DataCorp',
  'Boston, MA',
  'internship',
  25000,
  35000,
  'Summer internship opportunity for a Data Science student. You will work on real-world machine learning projects and gain hands-on experience with big data technologies.',
  'Currently pursuing degree in Data Science, Computer Science, Statistics, or related field. Knowledge of Python, SQL, and machine learning fundamentals. Strong analytical and problem-solving skills.',
  'Mentorship program, networking opportunities, potential for full-time offer',
  'https://datacorp.com/internships',
  'internships@datacorp.com'
),
(
  'DevOps Engineer',
  'CloudTech Solutions',
  'Austin, TX',
  'full-time',
  95000,
  140000,
  'We are seeking a DevOps Engineer to help us scale our cloud infrastructure. You will work with containerization, CI/CD pipelines, and cloud platforms to ensure reliable and efficient deployments.',
  'Bachelor''s degree in Computer Science or equivalent experience. 3+ years of DevOps experience. Proficiency with Docker, Kubernetes, AWS/GCP/Azure. Experience with Infrastructure as Code (Terraform, CloudFormformation).',
  'Health insurance, retirement plan, professional certifications, conference attendance',
  NULL,
  'devops@cloudtech.com'
),
(
  'Marketing Coordinator',
  'GrowthAgency',
  'Los Angeles, CA',
  'part-time',
  35000,
  45000,
  'Part-time Marketing Coordinator position to support our growing client base. You will assist with campaign management, content creation, and social media marketing.',
  '1-2 years of marketing experience. Knowledge of digital marketing platforms (Google Ads, Facebook Ads, LinkedIn). Strong writing and communication skills. Experience with marketing automation tools preferred.',
  'Flexible schedule, professional development opportunities, team events',
  'https://growthagency.com/careers',
  'careers@growthagency.com'
);
