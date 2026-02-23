-- DB Upgrade Migration Script
-- Run this in your Supabase SQL Editor to upgrade the existing schema

-- 1. Upgrade 'pets' table
ALTER TABLE pets
  ADD COLUMN IF NOT EXISTS age_value integer,
  ADD COLUMN IF NOT EXISTS age_unit text check (age_unit in ('months', 'years')),
  ADD COLUMN IF NOT EXISTS medical_notes text,
  ADD COLUMN IF NOT EXISTS featured boolean default false,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default timezone('utc'::text, now());

-- 2. Upgrade 'adoption_updates' table
-- (Commented out because your table might already have 'content' instead of 'message')
-- ALTER TABLE adoption_updates RENAME COLUMN message TO content;
ALTER TABLE adoption_updates ADD COLUMN IF NOT EXISTS images text[] default '{}';

-- 3. Create 'adoption_applications' table
CREATE TABLE IF NOT EXISTS adoption_applications (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets(id) on delete cascade,
  applicant_name text not null,
  email text not null,
  phone text not null,
  housing_type text not null,
  experience text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS for adoption_applications
ALTER TABLE adoption_applications ENABLE ROW LEVEL SECURITY;

-- 5. Create policies for adoption_applications
-- Admins can read/update/delete/insert
CREATE POLICY "Allow authenticated full access applications" ON adoption_applications FOR ALL TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
-- Public can only insert new applications (Submit form)
CREATE POLICY "Allow public insert application" ON adoption_applications FOR INSERT TO public WITH CHECK (status = 'pending');

-- Run this entirely!
