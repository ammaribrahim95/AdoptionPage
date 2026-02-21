-- Migration: Decouple Stories from Pets
-- 1. Add title column to adoption_updates (make it text, not null for new stories)
ALTER TABLE adoption_updates ADD COLUMN IF NOT EXISTS title text;

-- Backfill title for existing updates using a generic string so we can make it NOT NULL later if desired
UPDATE adoption_updates SET title = 'A Pawsitive Update!' WHERE title IS NULL;

-- 2. Add is_published status
ALTER TABLE adoption_updates ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;

-- Note: pet_id is already a UUID referencing pets(id) and is naturally nullable in Supabase unless explicitly marked NOT NULL.
