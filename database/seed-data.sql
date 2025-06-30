-- Sample cities for testing
INSERT INTO cities (key, name_bs, name_en, is_special, sort_order, is_active) VALUES
  ('sarajevo', 'Sarajevo', 'Sarajevo', true, 1, true),
  ('banja-luka', 'Banja Luka', 'Banja Luka', true, 2, true),
  ('tuzla', 'Tuzla', 'Tuzla', true, 3, true),
  ('zenica', 'Zenica', 'Zenica', false, 4, true),
  ('mostar', 'Mostar', 'Mostar', true, 5, true),
  ('bijeljina', 'Bijeljina', 'Bijeljina', false, 6, true),
  ('prijedor', 'Prijedor', 'Prijedor', false, 7, true),
  ('doboj', 'Doboj', 'Doboj', false, 8, true),
  ('trebinje', 'Trebinje', 'Trebinje', false, 9, true),
  ('brcko', 'Brčko', 'Brcko', false, 10, true)
ON CONFLICT (key) DO NOTHING;

-- Sample job listings for testing
INSERT INTO job_listings (title, company, city_id, type, description, salary, email, website, is_featured, tags) VALUES
  ('Senior Frontend Developer', 'TechCorp', (SELECT id FROM cities WHERE key = 'sarajevo' LIMIT 1), 'full-time', 
   'We are looking for an experienced frontend developer to join our growing team. You will be responsible for building modern web applications using React, TypeScript, and other cutting-edge technologies.',
   '$50,000 - $70,000', 'jobs@techcorp.ba', 'https://techcorp.ba', true,
   '["React", "TypeScript", "JavaScript", "CSS", "HTML"]'::jsonb),
  
  ('Marketing Specialist', 'Digital Agency', (SELECT id FROM cities WHERE key = 'banja-luka' LIMIT 1), 'full-time',
   'Join our dynamic marketing team and help create compelling campaigns for our clients. Experience with digital marketing, social media, and content creation required.',
   'Competitive salary', 'hr@digitalagency.ba', 'https://digitalagency.ba', false,
   '["Marketing", "Social Media", "Content Creation", "SEO"]'::jsonb),
  
  ('Backend Developer', 'StartupBH', (SELECT id FROM cities WHERE key = 'tuzla' LIMIT 1), 'remote',
   'Remote backend developer position for a fast-growing fintech startup. Work with Node.js, PostgreSQL, and modern cloud technologies.',
   '$40,000 - $60,000', 'careers@startupbh.com', 'https://startupbh.com', true,
   '["Node.js", "PostgreSQL", "AWS", "Docker", "API"]'::jsonb),
  
  ('Graphic Designer', 'Creative Studio', (SELECT id FROM cities WHERE key = 'mostar' LIMIT 1), 'part-time',
   'Part-time graphic designer needed for various projects. Must have experience with Adobe Creative Suite and a strong portfolio.',
   '$20 - $30/hour', 'design@creativestudio.ba', null, false,
   '["Adobe Photoshop", "Adobe Illustrator", "Design", "Branding"]'::jsonb),
  
  ('Data Analyst', 'Analytics Pro', (SELECT id FROM cities WHERE key = 'sarajevo' LIMIT 1), 'contract',
   'Contract position for data analyst with experience in SQL, Python, and data visualization tools. 6-month contract with possibility of extension.',
   '$3,000/month', 'contact@analyticspro.ba', 'https://analyticspro.ba', false,
   '["SQL", "Python", "Data Analysis", "Tableau", "Excel"]'::jsonb)
ON CONFLICT DO NOTHING;
