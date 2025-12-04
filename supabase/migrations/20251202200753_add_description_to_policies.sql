/*
  # Add description field to policies table

  1. Changes
    - Add `description` (text) column to `policies` table with a default empty string
    
  2. Notes
    - Using ALTER TABLE with IF NOT EXISTS check to safely add the column
    - Setting a default value to ensure existing rows have valid data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'policies' AND column_name = 'description'
  ) THEN
    ALTER TABLE policies ADD COLUMN description text DEFAULT '';
  END IF;
END $$;
