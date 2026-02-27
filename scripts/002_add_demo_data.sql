-- This script adds demo admin credentials and sample registrations
-- Admin Credentials:
-- Email: admin@prayagrajnovel.com
-- Password: Admin@12345

-- Note: You need to create the auth user first through Supabase UI or API
-- For demo purposes, we'll add sample registrations that show real-time data

-- Insert sample registrations to demonstrate the admin dashboard
INSERT INTO public.registrations (name, email, phone, age, address, category, upi, payment_status, created_at)
VALUES
  ('राज कुमार', 'raj.kumar@email.com', '9876543210', 18, 'प्रयागराज, उत्तर प्रदेश', 'School', 'rajkumar@upi', 'completed', NOW() - INTERVAL '2 days'),
  ('प्रिया शर्मा', 'priya.sharma@email.com', '9876543211', 20, 'इलाहाबाद, उत्तर प्रदेश', 'UG-Student', 'priya.sharma@upi', 'completed', NOW() - INTERVAL '1 day'),
  ('अमित पांडे', 'amit.pande@email.com', '9876543212', 19, 'हरिद्वार, उत्तर प्रदेश', 'School', 'amit.pande@upi', 'pending', NOW() - INTERVAL '12 hours'),
  ('नीता वर्मा', 'neeta.verma@email.com', '9876543213', 21, 'वाराणसी, उत्तर प्रदेश', 'UG-Student', 'neeta.verma@upi', 'completed', NOW() - INTERVAL '6 hours'),
  ('विश्वजीत सिंह', 'vishwajeet.singh@email.com', '9876543214', 22, 'लखनऊ, उत्तर प्रदेश', 'Other', 'vishwajeet@upi', 'pending', NOW() - INTERVAL '2 hours');

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON public.registrations (payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations (created_at);
