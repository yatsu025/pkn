-- Add new columns to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS student_type text,
ADD COLUMN IF NOT EXISTS upi_id text,
ADD COLUMN IF NOT EXISTS payment_method text;

-- Migrate existing data - map old upi column to upi_id if needed
UPDATE public.registrations 
SET upi_id = upi 
WHERE upi_id IS NULL AND upi IS NOT NULL;

-- Drop the old upi column after migration
ALTER TABLE public.registrations 
DROP COLUMN IF EXISTS upi;
