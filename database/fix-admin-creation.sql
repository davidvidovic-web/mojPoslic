-- Diagnostic and Fix Script for Admin Creation
-- Run this step by step in your Supabase SQL Editor

-- STEP 1: Check if profiles table exists and has the role column
SELECT 
    table_name,
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- STEP 2: Check if user_role enum exists
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- STEP 3: If the above queries return no results, run the profiles.sql script first!
-- The profiles table needs to exist before creating admin users.

-- STEP 4: Check if the admin user already exists in auth.users
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
WHERE email = 'mail@davidvidovic.com';

-- STEP 5: Create admin profile (only run this after confirming table structure)
-- Replace 'USER_ID_FROM_STEP_4' with the actual UUID from step 4
INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
) VALUES (
    'USER_ID_FROM_STEP_4', -- Replace with actual UUID from step 4
    'mail@davidvidovic.com',
    'SU Admin',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- STEP 6: Verify admin creation
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

-- TROUBLESHOOTING: If you still get role column errors, the table might need to be recreated
-- Uncomment and run this only if needed:
/*
-- Drop and recreate the profiles table (WARNING: This will delete all existing profiles!)
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Then run the complete profiles.sql script to recreate everything
*/
