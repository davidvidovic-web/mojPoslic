-- Diagnostic Script - Run this to check what's happening
-- Run each query separately to diagnose the issue

-- 1. Check if the auth user exists
SELECT 
    'Auth User Check' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN 'AUTH USER DOES NOT EXIST - Must create in Dashboard first!'
        ELSE 'Auth user exists'
    END as status
FROM auth.users 
WHERE email = 'mail@davidvidovic.com';

-- 2. If auth user exists, show details
SELECT 
    'Auth User Details' as info,
    id,
    email,
    email_confirmed_at,
    created_at,
    last_sign_in_at
FROM auth.users 
WHERE email = 'mail@davidvidovic.com';

-- 3. Check if profile exists
SELECT 
    'Profile Check' as check_type,
    COUNT(*) as count,
    CASE 
        WHEN COUNT(*) = 0 THEN 'NO PROFILE EXISTS'
        ELSE 'Profile exists'
    END as status
FROM public.profiles 
WHERE email = 'mail@davidvidovic.com';

-- 4. If profile exists, show details
SELECT 
    'Profile Details' as info,
    id,
    email,
    name,
    role,
    created_at
FROM public.profiles 
WHERE email = 'mail@davidvidovic.com';

-- 5. Check table structure
SELECT 
    'Table Structure' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. Test the INSERT query without actually inserting
SELECT 
    'Would Insert' as test,
    u.id,
    'mail@davidvidovic.com' as email,
    'SU Admin' as name,
    'admin'::user_role as role,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
WHERE u.email = 'mail@davidvidovic.com';
