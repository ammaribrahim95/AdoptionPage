-- Add date_of_birth column
ALTER TABLE pets ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Migrate existing data to date_of_birth based on age_value and age_unit
-- Assuming created_at is when the age was set
UPDATE pets 
SET date_of_birth = CASE
  WHEN age_unit = 'years' THEN (created_at - (age_value || ' years')::interval)::date
  WHEN age_unit = 'months' THEN (created_at - (age_value || ' months')::interval)::date
  ELSE created_at::date -- Fallback for bad data
END
WHERE age_value IS NOT NULL AND age_unit IS NOT NULL AND date_of_birth IS NULL;

-- Remove the old columns
ALTER TABLE pets DROP COLUMN IF EXISTS age_value;
ALTER TABLE pets DROP COLUMN IF EXISTS age_unit;
