-- Add business_email, phone, and address columns to profiles table
-- These fields are used for PDF generation and company information

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment to explain the business_email field
COMMENT ON COLUMN profiles.business_email IS 'Business email address shown on PDF quotes and used for customer contact';
COMMENT ON COLUMN profiles.phone IS 'Business phone number for company contact information';
COMMENT ON COLUMN profiles.address IS 'Business address for company information';
