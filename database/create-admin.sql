-- Admin User Creation Script for Supabase
-- Run this in your Supabase SQL Editor

-- First, we need to create the auth user
-- Note: You'll need to run this in parts or use the Supabase dashboard

-- Method 1: Using Supabase Dashboard (Recommended)
-- 1. Go to Authentication > Users in your Supabase dashboard
-- 2. Click "Add user"
-- 3. Enter:
--    - Email: mail@davidvidovic.com
--    - Password: vida97vida!@
--    - Email Confirm: true (check this box)
-- 4. Click "Create user"
-- 5. Copy the user ID from the created user
-- 6. Then run the profile creation SQL below with that user ID

-- Method 2: SQL Script (Run after getting user ID from dashboard)
-- Replace 'USER_ID_HERE' with the actual UUID from the created user

-- Example profile creation (replace USER_ID_HERE with actual UUID):
/*
INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
) VALUES (
    'USER_ID_HERE', -- Replace with actual user UUID
    'mail@davidvidovic.com',
    'SU Admin',
    'admin',
    NOW(),
    NOW()
);
*/

-- Alternative: If you have the user creation privileges, you can try this approach
-- (This might not work in all Supabase setups due to RLS policies)

-- Step 1: Temporarily disable RLS for profile insertion (run as superuser)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Create the admin profile directly (you'll still need the user UUID)
-- This assumes the auth.users record already exists
-- INSERT INTO public.profiles (
--     id,
--     email, 
--     name,
--     role,
--     created_at,
--     updated_at
-- ) 
-- SELECT 
--     id,
--     'mail@davidvidovic.com',
--     'SU Admin', 
--     'admin',
--     NOW(),
--     NOW()
-- FROM auth.users 
-- WHERE email = 'mail@davidvidovic.com';

-- Step 3: Re-enable RLS
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Fix the missing role column first!
-- The profiles table exists but is missing the role column.
-- Run these commands to fix it:

-- Create the user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'employer', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the missing role column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'employee';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles';

-- Step 1: Check if the auth user exists and get the UUID
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'mail@davidvidovic.com';

-- Step 2: Create the admin profile automatically (using the auth user)
-- This will automatically find the user ID and create the profile
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

-- Step 3: Verification query (run this to check if the admin was created successfully)
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
