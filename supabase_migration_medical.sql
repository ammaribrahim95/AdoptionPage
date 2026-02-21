-- Add explicit boolean flags for medical care to the pets table
ALTER TABLE pets 
  ADD COLUMN is_dewormed BOOLEAN DEFAULT false,
  ADD COLUMN is_deflea BOOLEAN DEFAULT false,
  ADD COLUMN is_vaccinated BOOLEAN DEFAULT false,
  ADD COLUMN is_potty_trained BOOLEAN DEFAULT false,
  ADD COLUMN is_neutered BOOLEAN DEFAULT false,
  ADD COLUMN vaccination_date DATE;

-- Note: The existing 'medical_notes' text column can remain for extended text explanations.
