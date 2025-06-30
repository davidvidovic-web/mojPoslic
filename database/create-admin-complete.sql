-- Complete Admin Creation Script
-- Run this if you have superuser access to create both auth user and profile

-- Note: This may not work in all Supabase setups due to security restrictions
-- The dashboard method is more reliable

BEGIN;

-- Temporarily disable RLS for admin creation
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Insert the admin user into auth.users (this might fail due to RLS)
-- INSERT INTO auth.users (
--     id,
--     instance_id,
--     email,
--     encrypted_password,
--     email_confirmed_at,
--     created_at,
--     updated_at,
--     role,
--     aud
-- ) VALUES (
--     gen_random_uuid(),
--     '00000000-0000-0000-0000-000000000000',
--     'mail@davidvidovic.com',
--     crypt('vida97vida!@', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW(),
--     'authenticated',
--     'authenticated'
-- );

-- Create the profile (assumes auth user exists)
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
    'admin',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'mail@davidvidovic.com'
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Verification
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
