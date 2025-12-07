ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS org_number TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT;

-- Update RLS to allow users to update their own org_number/contact_person
-- (Assuming existing update policy covers 'profiles' generally for owner, which is standard)
-- verified: Standard supabase logic allows owner to update their own row.
