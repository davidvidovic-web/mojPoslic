-- Add 'company' to user_role enum
-- This script safely adds the new value to the existing enum

DO $$ 
BEGIN
    -- Check if 'company' already exists in the enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'company' 
        AND enumtypid = (
            SELECT oid FROM pg_type 
            WHERE typname = 'user_role'
        )
    ) THEN
        -- Add 'company' to the enum
        ALTER TYPE user_role ADD VALUE 'company';
        RAISE NOTICE '✅ Added "company" to user_role enum';
    ELSE
        RAISE NOTICE '⚠️ "company" already exists in user_role enum';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel as role_values 
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;
