-- Add sales_goal column for user sales targets
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS sales_goal NUMERIC;

-- Add avatar_url, phone, and address columns for complete profile functionality
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;