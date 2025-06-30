-- Complete Admin Setup Script
-- Run this entire script in your Supabase SQL Editor

-- Step 1: Create enum and add role column if missing
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'employer', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'employee';

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Step 2: Check if auth user exists
DO $$
DECLARE
    user_exists boolean;
    user_id uuid;
BEGIN
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'mail@davidvidovic.com') INTO user_exists;
    
    IF NOT user_exists THEN
        RAISE NOTICE 'ERROR: User mail@davidvidovic.com does not exist in auth.users!';
        RAISE NOTICE 'Please create the user first using the Supabase Dashboard:';
        RAISE NOTICE '1. Go to Authentication > Users';
        RAISE NOTICE '2. Click "Add user"';
        RAISE NOTICE '3. Email: mail@davidvidovic.com';
        RAISE NOTICE '4. Password: vida97vida!@';
        RAISE NOTICE '5. Check "Email Confirm"';
        RAISE EXCEPTION 'User must be created first';
    ELSE
        SELECT id FROM auth.users WHERE email = 'mail@davidvidovic.com' INTO user_id;
        RAISE NOTICE 'Found user with ID: %', user_id;
    END IF;
END $$;

-- Step 3: Create admin profile
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

-- Step 4: Verify success
SELECT 
    'SUCCESS: Admin user created!' as status,
    p.id,
    p.name,
    p.email,
    p.role,
    p.created_at,
    u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'mail@davidvidovic.com';
