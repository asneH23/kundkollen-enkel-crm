-- Fix customer deletion behavior
-- Change from CASCADE to SET NULL so quotes and reminders are preserved when customer is deleted

-- Drop existing foreign key constraints
ALTER TABLE public.quotes 
DROP CONSTRAINT IF EXISTS quotes_customer_id_fkey;

ALTER TABLE public.reminders 
DROP CONSTRAINT IF EXISTS reminders_customer_id_fkey;

-- Recreate with SET NULL instead of CASCADE
ALTER TABLE public.quotes 
ADD CONSTRAINT quotes_customer_id_fkey 
FOREIGN KEY (customer_id) 
REFERENCES public.customers(id) 
ON DELETE SET NULL;

ALTER TABLE public.reminders 
ADD CONSTRAINT reminders_customer_id_fkey 
FOREIGN KEY (customer_id) 
REFERENCES public.customers(id) 
ON DELETE SET NULL;

