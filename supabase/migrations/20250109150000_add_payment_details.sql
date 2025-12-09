-- Add payment details columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bankgiro TEXT,
ADD COLUMN IF NOT EXISTS plusgiro TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS bic TEXT;
