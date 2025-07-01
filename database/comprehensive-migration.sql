-- Comprehensive Database Migration for Prisma Schema Updates
-- This file contains all necessary migrations for the current Prisma schema

-- ============================================================================
-- ROLE MIGRATION: employer/employee → client/tasker
-- ============================================================================

-- Option 1: Safe migration with new enum (recommended for production)
DO $$
BEGIN
    -- Create new enum with updated values
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole_new') THEN
        CREATE TYPE "UserRole_new" AS ENUM ('admin', 'client', 'tasker');
    END IF;

    -- Add new column with new enum type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'role_new') THEN
        ALTER TABLE "users" ADD COLUMN "role_new" "UserRole_new";
    END IF;

    -- Migrate data from old role to new role
    UPDATE "users" SET "role_new" = 
      CASE 
        WHEN "role" = 'admin' THEN 'admin'::"UserRole_new"
        WHEN "role" = 'employer' THEN 'client'::"UserRole_new"
        WHEN "role" = 'employee' THEN 'tasker'::"UserRole_new"
        WHEN "role" = 'company' THEN 'client'::"UserRole_new"  -- Map company to client
        ELSE 'tasker'::"UserRole_new"  -- Default fallback
      END
    WHERE "role_new" IS NULL;

    -- Make new column NOT NULL (after data migration)
    ALTER TABLE "users" ALTER COLUMN "role_new" SET NOT NULL;

    -- Drop old column and rename new one
    ALTER TABLE "users" DROP COLUMN IF EXISTS "role";
    ALTER TABLE "users" RENAME COLUMN "role_new" TO "role";

    -- Drop old enum and rename new one
    DROP TYPE IF EXISTS "UserRole";
    ALTER TYPE "UserRole_new" RENAME TO "UserRole";

    -- Update default value
    ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'tasker'::"UserRole";
END $$;

-- ============================================================================
-- TRANSPORTATION FIELD UPDATES
-- ============================================================================

-- Update transportation responsibility field to use new terminology
UPDATE "JobListing" 
SET "transportation_responsibility" = 'tasker_responsible' 
WHERE "transportation_responsibility" = 'employee_responsible';

-- ============================================================================
-- CONNECTIONS SYSTEM SETUP
-- ============================================================================

-- Ensure connections fields exist and have proper defaults
DO $$
BEGIN
    -- Add connections field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'connections') THEN
        ALTER TABLE "users" ADD COLUMN "connections" INTEGER DEFAULT 10;
    END IF;

    -- Add connections_last_refresh field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'connectionsLastRefresh') THEN
        ALTER TABLE "users" ADD COLUMN "connectionsLastRefresh" TIMESTAMP;
    END IF;

    -- Update any NULL connections to default value
    UPDATE "users" SET "connections" = 10 WHERE "connections" IS NULL;
END $$;

-- ============================================================================
-- DATA CLEANUP
-- ============================================================================

-- Clean up any invalid or orphaned data
DELETE FROM "users" WHERE "email" IS NULL OR "email" = '';
DELETE FROM "JobListing" WHERE "companyName" IS NULL OR "companyName" = '';

-- ============================================================================
-- FINAL VERIFICATION QUERIES
-- ============================================================================

-- Verify role migration
SELECT 
    role, 
    COUNT(*) as count 
FROM "users" 
GROUP BY role 
ORDER BY role;

-- Verify transportation updates
SELECT 
    transportation_responsibility, 
    COUNT(*) as count 
FROM "JobListing" 
WHERE transportation_responsibility IS NOT NULL
GROUP BY transportation_responsibility;

-- Show sample user data
SELECT 
    id, 
    email, 
    name, 
    role, 
    connections,
    "createdAt"
FROM "users" 
LIMIT 5;
