-- Fix Missing Role Column in Profiles Table
-- Run this in your Supabase SQL Editor to add the missing role column

-- Step 1: Create the user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'employer', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add the role column to the existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'employee';

-- Step 3: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Step 4: Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 5: Now create the admin profile
-- First, check if the auth user exists
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'mail@davidvidovic.com';

-- Step 6: Create/update the admin profile (replace USER_ID_HERE with actual UUID from step 5)
INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    created_at,
    updated_at
) VALUES (
    'USER_ID_HERE', -- Replace with actual UUID from step 5
    'mail@davidvidovic.com',
    'SU Admin',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- Step 7: Verify the admin was created successfully
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
