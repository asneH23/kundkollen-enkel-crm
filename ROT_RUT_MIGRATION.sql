-- Migration for ROT/RUT Support
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Update Customers table with Personnummer
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS person_number TEXT;

-- 2. Update Invoices table with ROT/RUT fields
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS rot_rut_type TEXT CHECK (rot_rut_type IN ('ROT', 'RUT')),
ADD COLUMN IF NOT EXISTS rot_rut_amount NUMERIC DEFAULT 0, -- The actual tax deduction amount (skattereduktion)
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0, -- The labor cost base (arbetskostnad)
ADD COLUMN IF NOT EXISTS property_designation TEXT; -- Fastighetsbeteckning (for ROT)

-- 3. Update Quotes table with ROT/RUT fields (to carry over to invoice)
ALTER TABLE public.quotes 
ADD COLUMN IF NOT EXISTS rot_rut_type TEXT CHECK (rot_rut_type IN ('ROT', 'RUT')),
ADD COLUMN IF NOT EXISTS rot_rut_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS labor_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS property_designation TEXT;

-- 4. Verify columns were added (Optional check)
COMMENT ON COLUMN public.invoices.rot_rut_amount IS 'The calculated tax deduction (30% or 50% of labor cost)';
COMMENT ON COLUMN public.invoices.labor_cost IS 'The part of the invoice amount that is eligible for ROT/RUT';
