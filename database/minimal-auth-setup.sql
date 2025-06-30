-- Alternative approach: Create a minimal auth setup without triggers
-- Use this if the trigger is causing issues

-- 1. Temporarily remove the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create a simpler profile creation approach
-- This function can be called manually after successful auth
CREATE OR REPLACE FUNCTION public.create_profile_for_user(user_id UUID, user_email TEXT, user_name TEXT DEFAULT NULL, user_role TEXT DEFAULT 'employee')
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_profile public.profiles;
BEGIN
    INSERT INTO public.profiles (id, email, name, role)
    VALUES (
        user_id,
        user_email,
        COALESCE(user_name, user_email),
        user_role::public.user_role
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name),
        updated_at = NOW()
    RETURNING * INTO new_profile;
    
    RETURN new_profile;
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.create_profile_for_user(UUID, TEXT, TEXT, TEXT) TO authenticated, anon;

-- 4. Create profiles for any existing users who don't have them
INSERT INTO public.profiles (id, email, name, role)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', u.email),
    'employee'::public.user_role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

SELECT 'Auth setup simplified - triggers removed, manual profile creation available';
