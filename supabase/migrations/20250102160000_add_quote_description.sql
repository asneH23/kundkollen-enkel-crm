-- Add description column to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS description TEXT;

-- Update RLS policies if necessary (usually not needed for adding a column if policies are table-wide)
-- But good to document what this enables
COMMENT ON COLUMN quotes.description IS 'Optional description/details for the quote';
