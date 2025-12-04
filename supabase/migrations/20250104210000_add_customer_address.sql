-- Add address column to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment
COMMENT ON COLUMN customers.address IS 'Customer billing/visiting address';
