-- Safe diagnostic without modifying auth.users table
-- This will help identify the trigger issue without requiring auth table permissions

-- 1. Check if the handle_new_user function can execute properly
-- Test with a sample profile creation (simulating what the trigger does)
DO $$
DECLARE
    test_id UUID := gen_random_uuid();
    test_email TEXT := 'test.trigger@example.com';
BEGIN
    -- Test the exact logic from handle_new_user function
    BEGIN
        INSERT INTO public.profiles (id, email, name, role)
        VALUES (
            test_id,
            test_email,
            COALESCE(NULL, test_email), -- Simulating raw_user_meta_data->>'name' being NULL
            COALESCE(NULL::public.user_role, 'employee'::public.user_role) -- Simulating role being NULL
        );
        
        RAISE NOTICE '✅ Profile creation logic works fine';
        
        -- Clean up
        DELETE FROM public.profiles WHERE id = test_id;
        RAISE NOTICE '✅ Test cleanup successful';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error in profile creation: %', SQLERRM;
        RAISE NOTICE 'Error detail: %', SQLSTATE;
    END;
END $$;

-- 2. Check the current handle_new_user function for potential issues
SELECT 
    routine_name,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- 3. Test if the issue is with user_role type casting
DO $$
BEGIN
    -- Test type casting that happens in the trigger
    BEGIN
        PERFORM 'employee'::public.user_role;
        RAISE NOTICE '✅ user_role casting works';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ user_role casting fails: %', SQLERRM;
    END;
    
    -- Test JSON extraction (this often fails)
    BEGIN
        PERFORM ('{"role": "admin"}'::jsonb)->>'role';
        RAISE NOTICE '✅ JSON extraction works';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ JSON extraction fails: %', SQLERRM;
    END;
END $$;
