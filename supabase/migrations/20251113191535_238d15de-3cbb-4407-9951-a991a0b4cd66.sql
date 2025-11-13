-- Add lesson_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_lessons' 
    AND column_name = 'lesson_number'
  ) THEN
    ALTER TABLE public.user_lessons ADD COLUMN lesson_number integer NOT NULL DEFAULT 1;
  END IF;
END $$;