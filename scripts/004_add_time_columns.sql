-- Add time tracking columns to quiz_results table
ALTER TABLE public.quiz_results 
ADD COLUMN IF NOT EXISTS total_time_taken float8,
ADD COLUMN IF NOT EXISTS per_question_time jsonb;

-- Update existing records if any (optional)
UPDATE public.quiz_results 
SET total_time_taken = 0 
WHERE total_time_taken IS NULL;
