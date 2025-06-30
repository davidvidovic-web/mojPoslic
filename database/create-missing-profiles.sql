-- Manual Profile Creation for Existing Users
-- Run this if you have existing auth.users but no profiles

-- 1. Check existing users without profiles
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data,
    p.id as profile_exists
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 2. Create profiles for existing users
INSERT INTO public.profiles (id, email, name, role)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as name,
    COALESCE((u.raw_user_meta_data->>'role')::public.user_role, 'employee'::public.user_role) as role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 3. Verify all users now have profiles
SELECT 
    COUNT(*) as total_users,
    COUNT(p.id) as users_with_profiles
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;
