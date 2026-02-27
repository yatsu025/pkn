-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT current_timestamp
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  age integer NOT NULL,
  address text NOT NULL,
  category text NOT NULL,
  upi text NOT NULL,
  payment_status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT current_timestamp
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_users (only admins can view/edit)
CREATE POLICY "Allow admins to view themselves" 
ON public.admin_users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Allow admins to update themselves" 
ON public.admin_users FOR UPDATE 
USING (auth.uid() = id);

-- RLS Policies for registrations (public read, but only admins can read/export)
-- We'll allow inserts without auth (for public registration), but restrict reads to authenticated admin users
CREATE POLICY "Allow public to insert registrations" 
ON public.registrations FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow admins to select all registrations" 
ON public.registrations FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid()
  )
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_registrations_name ON public.registrations (name);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations (email);
