-- Sample data for testing the job board
-- Run this after creating the main schema

INSERT INTO jobs (
  title,
  company,
  location,
  type,
  salary_min,
  salary_max,
  description,
  requirements,
  benefits,
  application_url,
  contact_email
) VALUES 
(
  'Senior Frontend Developer',
  'TechCorp Inc.',
  'San Francisco, CA',
  'full-time',
  120000,
  160000,
  'We are looking for a Senior Frontend Developer to join our growing team. You will be responsible for building and maintaining our web applications using modern technologies like React, TypeScript, and Next.js.',
  '• 5+ years of experience with React and TypeScript
• Experience with Next.js and modern frontend tooling
• Strong understanding of CSS and responsive design
• Experience with testing frameworks
• Excellent communication skills',
  '• Health, dental, and vision insurance
• 401(k) with company matching
• Flexible work arrangements
• Professional development budget
• Unlimited PTO',
  'https://techcorp.com/careers/senior-frontend-dev',
  'careers@techcorp.com'
),
(
  'Product Manager',
  'StartupXYZ',
  'Remote',
  'full-time',
  90000,
  130000,
  'Join our fast-growing startup as a Product Manager! You''ll work closely with engineering and design teams to build products that customers love.',
  '• 3+ years of product management experience
• Experience with agile development methodologies
• Strong analytical and problem-solving skills
• Excellent written and verbal communication
• Experience with product analytics tools',
  '• Competitive salary and equity
• Remote-first culture
• Learning and development budget
• Top-tier equipment
• Company retreats',
  NULL,
  'hiring@startupxyz.com'
),
(
  'UI/UX Designer Intern',
  'Design Studio Pro',
  'New York, NY',
  'internship',
  NULL,
  NULL,
  'Great opportunity for a design student or recent graduate to gain hands-on experience in a professional design environment. You''ll work on real client projects and learn from senior designers.',
  '• Currently pursuing or recently completed degree in Design, HCI, or related field
• Proficiency in Figma, Sketch, or Adobe Creative Suite
• Understanding of design principles and user-centered design
• Portfolio demonstrating design skills
• Enthusiasm for learning and growth',
  '• Mentorship from senior designers
• Flexible schedule to accommodate school
• Portfolio development opportunities
• Potential for full-time offer
• Team events and workshops',
  'https://designstudiopro.com/internships',
  'internships@designstudiopro.com'
),
(
  'DevOps Engineer',
  'CloudTech Solutions',
  'Austin, TX',
  'contract',
  70,
  90,
  'We need an experienced DevOps Engineer for a 6-month contract to help modernize our infrastructure and implement CI/CD pipelines.',
  '• 4+ years of DevOps/Infrastructure experience
• Experience with AWS, Docker, and Kubernetes
• Knowledge of CI/CD tools (Jenkins, GitLab CI, etc.)
• Infrastructure as Code experience (Terraform, CloudFormation)
• Strong scripting skills (Python, Bash)',
  '• Competitive hourly rate
• Remote work flexibility
• Opportunity for contract extension
• Work with cutting-edge technologies',
  NULL,
  'contracts@cloudtech.com'
),
(
  'Marketing Coordinator',
  'GrowthCo',
  'Los Angeles, CA',
  'part-time',
  25000,
  35000,
  'Part-time Marketing Coordinator position perfect for someone looking to break into marketing or seeking work-life balance. Help execute marketing campaigns and analyze performance.',
  '• Bachelor''s degree in Marketing, Communications, or related field
• 1-2 years of marketing experience preferred
• Familiarity with social media platforms
• Basic understanding of marketing analytics
• Strong organizational skills',
  '• Flexible schedule (20-25 hours/week)
• Health insurance stipend
• Professional development opportunities
• Collaborative team environment
• Growth potential',
  'https://growthco.com/careers',
  'jobs@growthco.com'
);
