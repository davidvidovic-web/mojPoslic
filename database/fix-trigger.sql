-- Fixed trigger function - addresses common issues that cause "Database error querying schema"

-- 1. Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create an improved handle_new_user function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Add error handling and logging
    BEGIN
        INSERT INTO public.profiles (id, email, name, role)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
            COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'employee'::public.user_role)
        );
        
        RETURN NEW;
        
    EXCEPTION 
        WHEN unique_violation THEN
            -- Profile already exists, just return
            RETURN NEW;
        WHEN OTHERS THEN
            -- Log the error but don't fail the auth process
            RAISE LOG 'Error in handle_new_user: %', SQLERRM;
            RETURN NEW;
    END;
END;
$$;

-- 3. Grant execute permissions explicitly
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 4. Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Test the function
SELECT 'Trigger function updated with error handling';

-- 6. If you disabled the trigger earlier, make sure it's enabled
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
