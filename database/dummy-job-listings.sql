-- Sample job listings data
-- Run this after creating the job_listings table and cities table

-- First, ensure we have some cities (you may already have these)
INSERT INTO cities (key, name_bs, name_en, is_special, sort_order, is_active) VALUES
('sarajevo', 'Sarajevo', 'Sarajevo', true, 1, true),
('banja-luka', 'Banja Luka', 'Banja Luka', true, 2, true),
('tuzla', 'Tuzla', 'Tuzla', true, 3, true),
('zenica', 'Zenica', 'Zenica', false, 4, true),
('mostar', 'Mostar', 'Mostar', true, 5, true),
('bijeljina', 'Bijeljina', 'Bijeljina', false, 6, true),
('remote', 'Rad na daljinu', 'Remote', true, 7, true)
ON CONFLICT (key) DO NOTHING;

-- Insert sample job listings
INSERT INTO job_listings (title, company, city_id, type, description, salary, email, website, is_featured, tags) VALUES
(
  'Senior Frontend Developer',
  'TechCorp BiH',
  (SELECT id FROM cities WHERE key = 'sarajevo' LIMIT 1),
  'full-time',
  'We are looking for an experienced Frontend Developer to join our growing team. You will be responsible for building user-facing features using React, TypeScript, and modern web technologies. Join our dynamic team and work on cutting-edge projects that impact thousands of users.',
  '$2,500 - $3,500',
  'careers@techcorp.ba',
  'https://techcorp.ba/careers',
  true,
  '["React", "TypeScript", "JavaScript", "CSS", "HTML"]'::jsonb
),
(
  'Product Manager',
  'StartupXYZ',
  (SELECT id FROM cities WHERE key = 'remote' LIMIT 1),
  'full-time',
  'Join our dynamic startup as a Product Manager! You will drive product strategy, work closely with engineering and design teams, and help shape the future of our platform. This is a great opportunity for someone looking to make a significant impact in a fast-growing company.',
  '$2,000 - $3,000',
  'jobs@startupxyz.com',
  'https://startupxyz.com/apply',
  true,
  '["Product Management", "Agile", "Analytics", "Strategy"]'::jsonb
),
(
  'Full Stack Developer',
  'DevAgency Sarajevo',
  (SELECT id FROM cities WHERE key = 'sarajevo' LIMIT 1),
  'full-time',
  'Great opportunity for a developer to grow their skills in a supportive environment. You will work on diverse client projects using React, Node.js, and various databases. We offer mentorship and professional development opportunities.',
  '$1,800 - $2,500',
  'hello@devagency.ba',
  'https://devagency.ba/careers',
  false,
  '["React", "Node.js", "JavaScript", "PostgreSQL", "MongoDB"]'::jsonb
),
(
  'UX/UI Designer',
  'Design Studio BL',
  (SELECT id FROM cities WHERE key = 'banja-luka' LIMIT 1),
  'contract',
  'We need a talented UX/UI Designer for various client projects. You will conduct user research, create wireframes, and design beautiful user interfaces. This is a contract position with potential for long-term collaboration.',
  '$1,500 - $2,200',
  'hello@designstudio.ba',
  null,
  false,
  '["Figma", "Adobe XD", "UI Design", "UX Research", "Prototyping"]'::jsonb
),
(
  'Marketing Specialist',
  'Digital Marketing Pro',
  (SELECT id FROM cities WHERE key = 'tuzla' LIMIT 1),
  'part-time',
  'Part-time Marketing Specialist position perfect for someone looking for work-life balance. You will develop marketing strategies, manage social media campaigns, and analyze performance metrics for our diverse client portfolio.',
  '$800 - $1,200',
  'careers@digitalmarketing.ba',
  'https://digitalmarketing.ba/jobs',
  false,
  '["Digital Marketing", "Social Media", "Analytics", "Content Creation"]'::jsonb
),
(
  'DevOps Engineer',
  'CloudTech Solutions',
  (SELECT id FROM cities WHERE key = 'sarajevo' LIMIT 1),
  'full-time',
  'Join our infrastructure team to help scale our cloud-native applications. You will work with Kubernetes, AWS, and CI/CD pipelines to ensure reliable deployments. We are looking for someone passionate about automation and scalability.',
  '$2,800 - $3,500',
  'devops@cloudtech.ba',
  'https://cloudtech.ba/careers',
  true,
  '["AWS", "Kubernetes", "Docker", "CI/CD", "Terraform"]'::jsonb
),
(
  'Junior Web Developer',
  'Web Solutions Mostar',
  (SELECT id FROM cities WHERE key = 'mostar' LIMIT 1),
  'full-time',
  'Entry-level position for a motivated junior developer. You will work on web applications using modern technologies and learn from experienced developers. Great opportunity to start your career in tech.',
  '$1,200 - $1,800',
  'jobs@websolutions.ba',
  null,
  false,
  '["HTML", "CSS", "JavaScript", "PHP", "WordPress"]'::jsonb
),
(
  'Data Analyst',
  'Analytics Hub',
  (SELECT id FROM cities WHERE key = 'remote' LIMIT 1),
  'remote',
  'Remote Data Analyst position for someone passionate about turning data into insights. You will work with large datasets, create visualizations, and help drive business decisions through data analysis.',
  '$1,800 - $2,500',
  'data@analyticshub.com',
  'https://analyticshub.com/remote-jobs',
  false,
  '["Python", "SQL", "Tableau", "Excel", "Statistics"]'::jsonb
),
(
  'Content Writer',
  'Content Agency BL',
  (SELECT id FROM cities WHERE key = 'banja-luka' LIMIT 1),
  'part-time',
  'We are seeking a creative Content Writer to join our team. You will create engaging content for various clients across different industries. This part-time position offers flexibility and creative freedom.',
  '$600 - $1,000',
  'content@contentagency.ba',
  null,
  false,
  '["Content Writing", "SEO", "Copywriting", "Research"]'::jsonb
),
(
  'Mobile App Developer',
  'Mobile First',
  (SELECT id FROM cities WHERE key = 'zenica' LIMIT 1),
  'full-time',
  'Join our mobile development team to create innovative iOS and Android applications. You will work with React Native and native technologies to deliver high-quality mobile experiences.',
  '$2,200 - $3,000',
  'mobile@mobilefirst.ba',
  'https://mobilefirst.ba/careers',
  true,
  '["React Native", "iOS", "Android", "JavaScript", "Mobile Development"]'::jsonb
),
(
  'Graphic Designer',
  'Creative Studio',
  (SELECT id FROM cities WHERE key = 'sarajevo' LIMIT 1),
  'contract',
  'Freelance Graphic Designer needed for various design projects. You will create visual content for print and digital media, work with clients to understand their vision, and deliver creative solutions.',
  '$1,000 - $1,800',
  'design@creativestudio.ba',
  null,
  false,
  '["Adobe Creative Suite", "Photoshop", "Illustrator", "InDesign", "Branding"]'::jsonb
),
(
  'Project Manager',
  'PM Solutions',
  (SELECT id FROM cities WHERE key = 'banja-luka' LIMIT 1),
  'full-time',
  'Experienced Project Manager needed to lead cross-functional teams and deliver projects on time and within budget. You will work with clients and internal teams to ensure successful project outcomes.',
  '$2,000 - $2,800',
  'pm@pmsolutions.ba',
  'https://pmsolutions.ba/jobs',
  false,
  '["Project Management", "Agile", "Scrum", "Leadership", "Communication"]'::jsonb
);
