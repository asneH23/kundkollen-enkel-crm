-- Add org_number to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS org_number TEXT;
