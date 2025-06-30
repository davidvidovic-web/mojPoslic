-- Create job_listings table
-- Run this in your Supabase SQL Editor

-- Create job_listings table
CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  city_id UUID REFERENCES cities(id),
  type TEXT NOT NULL CHECK (type IN ('full-time', 'part-time', 'contract', 'remote', 'quick-job')),
  description TEXT NOT NULL,
  salary TEXT, -- Flexible salary field (e.g., "$50,000 - $70,000", "Competitive", etc.)
  email TEXT NOT NULL, -- Required contact email
  website TEXT, -- Optional company website/application URL
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  tags JSONB DEFAULT '[]'::jsonb, -- Array of tags
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_listings_created_at ON job_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_listings_is_active ON job_listings(is_active);
CREATE INDEX IF NOT EXISTS idx_job_listings_type ON job_listings(type);
CREATE INDEX IF NOT EXISTS idx_job_listings_city_id ON job_listings(city_id);
CREATE INDEX IF NOT EXISTS idx_job_listings_posted_by ON job_listings(posted_by);
CREATE INDEX IF NOT EXISTS idx_job_listings_is_featured ON job_listings(is_featured);

-- Enable Row Level Security (RLS)
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Anyone can view active job listings" ON job_listings;
CREATE POLICY "Anyone can view active job listings" ON job_listings
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Authenticated users can insert job listings" ON job_listings;
CREATE POLICY "Authenticated users can insert job listings" ON job_listings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can update own job listings" ON job_listings;
CREATE POLICY "Users can update own job listings" ON job_listings
  FOR UPDATE USING (auth.uid() = posted_by);

DROP POLICY IF EXISTS "Users can delete own job listings" ON job_listings;
CREATE POLICY "Users can delete own job listings" ON job_listings
  FOR DELETE USING (auth.uid() = posted_by);

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_job_listings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_job_listings_updated_at ON job_listings;
CREATE TRIGGER update_job_listings_updated_at
  BEFORE UPDATE ON job_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_job_listings_updated_at();
