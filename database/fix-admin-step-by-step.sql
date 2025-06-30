-- Step-by-Step Admin Creation Fix
-- Run these queries one by one in your Supabase SQL Editor

-- STEP 1: Check if auth user exists (most likely issue)
SELECT 
    CASE 
        WHEN EXISTS(SELECT 1 FROM auth.users WHERE email = 'mail@davidvidovic.com') 
        THEN 'USER EXISTS - Proceed to Step 2'
        ELSE 'USER MISSING - Go to Dashboard and create user first!'
    END as status;

-- If STEP 1 shows "USER MISSING", stop here and:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add user"
-- 3. Email: mail@davidvidovic.com
-- 4. Password: vida97vida!@
-- 5. Check "Email Confirm" checkbox
-- 6. Click "Create user"
-- Then come back and run from STEP 1 again

-- STEP 2: Fix the profiles table (add role column if missing)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'employer', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'employee';

-- STEP 3: Create the admin profile (only works if auth user exists)
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

-- STEP 4: Verify it worked
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN 'SUCCESS: Admin profile created!'
        ELSE 'FAILED: No profile created (auth user missing?)'
    END as result,
    COUNT(*) as profiles_found
FROM public.profiles 
WHERE email = 'mail@davidvidovic.com' AND role = 'admin';

-- STEP 5: Show final details
SELECT 
    'Admin Details' as info,
    p.id,
    p.name,
    p.email,
    p.role,
    u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'mail@davidvidovic.com';
