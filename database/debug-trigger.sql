-- Debug and fix trigger issues that might cause "Database error querying schema"
-- The error often happens when the handle_new_user function fails during auth

-- 1. First, let's check if the trigger function can execute properly
-- Test the function manually with a dummy user
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test@example.com';
BEGIN
    -- Try to execute the function logic manually
    BEGIN
        INSERT INTO public.profiles (id, email, name, role)
        VALUES (
            test_user_id,
            test_email,
            test_email,
            'employee'::public.user_role
        );
        
        RAISE NOTICE 'Manual profile creation successful';
        
        -- Clean up test data
        DELETE FROM public.profiles WHERE id = test_user_id;
        RAISE NOTICE 'Test data cleaned up';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error in manual profile creation: %', SQLERRM;
    END;
END $$;

-- 2. Check if the function has proper permissions
SELECT 
    routine_name,
    routine_type,
    security_type,
    is_deterministic
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- 3. Temporarily disable the trigger to test if auth works without it
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- You should test login now (it should work without profile creation)
-- If it works, the issue is with the trigger function

-- 4. Re-enable the trigger (run this after testing)
-- ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

RAISE NOTICE 'Trigger disabled. Test login now. If it works, run the fix below.';
