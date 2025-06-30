-- Simple Admin User Creation
-- Run this in your Supabase SQL Editor after creating the user via Dashboard

-- Step 1: First create the user in Supabase Dashboard:
-- Go to Authentication > Users > Add user
-- Email: mail@davidvidovic.com
-- Password: vida97vida!@
-- Check "Email Confirm"

-- Step 2: Then run this SQL to create the admin profile:
INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
) 
SELECT 
    u.id,
    'mail@davidvidovic.com',
    'SU Admin',
    'admin'::user_role,
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'mail@davidvidovic.com'
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Step 3: Verify the admin was created
SELECT 
    p.id,
    p.name,
    p.email,
    p.role,
    p.created_at,
    u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'mail@davidvidovic.com';
