-- ═══════════════════════════════════════════
-- STRIDE DASHBOARD — DATABASE SETUP
-- Run this in Supabase SQL Editor (one-time)
-- ═══════════════════════════════════════════

-- 1. Create the leads table
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  company TEXT,
  launching TEXT,
  budget TEXT,
  timeline TEXT,
  link TEXT,
  submitted TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to INSERT (so the website form can submit leads)
CREATE POLICY "Anyone can insert leads"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Only logged-in users can SELECT (view leads)
CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

-- 5. Only logged-in users can UPDATE (change status)
CREATE POLICY "Authenticated users can update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true);

-- 6. Only logged-in users can DELETE
CREATE POLICY "Authenticated users can delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (true);
