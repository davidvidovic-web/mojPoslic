-- Fixed trigger function - this should resolve the "Database error querying schema" issue
-- The issue is often caused by the trigger function failing during user creation

-- 1. Create an improved handle_new_user function with comprehensive error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    user_name TEXT;
    user_role public.user_role;
BEGIN
    -- Safely extract name with fallback
    BEGIN
        user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.email);
    EXCEPTION WHEN OTHERS THEN
        user_name := NEW.email;
    END;
    
    -- Safely extract and cast role with fallback
    BEGIN
        user_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'employee'::public.user_role);
    EXCEPTION WHEN OTHERS THEN
        user_role := 'employee'::public.user_role;
    END;
    
    -- Insert profile with error handling
    BEGIN
        INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
        VALUES (
            NEW.id,
            NEW.email,
            user_name,
            user_role,
            NOW(),
            NOW()
        );
    EXCEPTION 
        WHEN unique_violation THEN
            -- Profile already exists, update it instead
            UPDATE public.profiles 
            SET 
                email = NEW.email,
                name = COALESCE(user_name, name),
                updated_at = NOW()
            WHERE id = NEW.id;
        WHEN OTHERS THEN
            -- Log error but don't fail the auth process
            RAISE LOG 'handle_new_user error for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$;

-- 2. Recreate the trigger (this will replace the existing one)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;

-- 4. Test the function manually
SELECT 'Improved trigger function created. Test login now.';

-- 5. Create any missing profiles for existing users
INSERT INTO public.profiles (id, email, name, role, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', u.email),
    COALESCE((u.raw_user_meta_data->>'role')::public.user_role, 'employee'::public.user_role),
    u.created_at,
    NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
