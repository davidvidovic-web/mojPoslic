-- Update job_listings table to add missing columns
-- Run this in your Supabase SQL Editor

-- Add missing columns to job_listings table
ALTER TABLE job_listings 
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS benefits TEXT,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS application_url TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Update existing records to use contact_email from email field
UPDATE job_listings 
SET contact_email = email 
WHERE contact_email IS NULL;

-- Rename website to application_url for clarity (optional)
-- UPDATE job_listings 
-- SET application_url = website 
-- WHERE application_url IS NULL AND website IS NOT NULL;

-- Verification query
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'job_listings'
ORDER BY ordinal_position;
