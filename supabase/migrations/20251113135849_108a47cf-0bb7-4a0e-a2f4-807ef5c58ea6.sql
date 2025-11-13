-- Add new fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'mensal' CHECK (subscription_tier IN ('semanal', 'mensal', 'vitalicio')),
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone;

-- Create user_modules table for drip content
CREATE TABLE IF NOT EXISTS public.user_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  module_number integer NOT NULL CHECK (module_number BETWEEN 1 AND 7),
  module_name text NOT NULL,
  release_date timestamp with time zone NOT NULL,
  is_released boolean DEFAULT false NOT NULL,
  is_completed boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, module_number)
);

-- Enable RLS on user_modules
ALTER TABLE public.user_modules ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_modules
CREATE POLICY "Users can view their own modules"
  ON public.user_modules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own modules"
  ON public.user_modules FOR UPDATE
  USING (auth.uid() = user_id);

-- Rename module_progress to user_lessons and adjust structure
ALTER TABLE public.module_progress 
RENAME TO user_lessons;

-- Add lesson_number column if not exists
ALTER TABLE public.user_lessons
ADD COLUMN IF NOT EXISTS lesson_number integer DEFAULT 1;

-- Update existing RLS policies for user_lessons
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_lessons;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_lessons;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_lessons;
DROP POLICY IF EXISTS "Users can delete their own progress" ON public.user_lessons;

CREATE POLICY "Users can view their own lessons"
  ON public.user_lessons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lessons"
  ON public.user_lessons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lessons"
  ON public.user_lessons FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lessons"
  ON public.user_lessons FOR DELETE
  USING (auth.uid() = user_id);

-- Function to initialize user modules on signup
CREATE OR REPLACE FUNCTION public.initialize_user_modules()
RETURNS TRIGGER AS $$
DECLARE
  modules jsonb := '[
    {"number": 1, "name": "Reset Emocional", "days_delay": 0},
    {"number": 2, "name": "Mapa da Mente Masculina", "days_delay": 2},
    {"number": 3, "name": "Gatilhos da Memória Emocional", "days_delay": 4},
    {"number": 4, "name": "A Frase de 5 Palavras", "days_delay": 6},
    {"number": 5, "name": "Primeiro Contato Estratégico", "days_delay": 8},
    {"number": 6, "name": "Domínio da Conversa", "days_delay": 10},
    {"number": 7, "name": "Conquista Duradoura", "days_delay": 12}
  ]'::jsonb;
  module jsonb;
BEGIN
  FOR module IN SELECT * FROM jsonb_array_elements(modules)
  LOOP
    INSERT INTO public.user_modules (
      user_id,
      module_number,
      module_name,
      release_date,
      is_released
    ) VALUES (
      NEW.id,
      (module->>'number')::integer,
      module->>'name',
      now() + ((module->>'days_delay')::integer || ' days')::interval,
      (module->>'days_delay')::integer = 0
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to initialize modules on user creation
DROP TRIGGER IF EXISTS on_user_modules_init ON public.profiles;
CREATE TRIGGER on_user_modules_init
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_modules();

-- Function to release modules based on date
CREATE OR REPLACE FUNCTION public.release_modules()
RETURNS void AS $$
BEGIN
  UPDATE public.user_modules
  SET is_released = true
  WHERE release_date <= now()
    AND is_released = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_modules_user_id ON public.user_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_user_modules_release_date ON public.user_modules(release_date) WHERE is_released = false;
CREATE INDEX IF NOT EXISTS idx_user_lessons_user_module ON public.user_lessons(user_id, module_id, lesson_id);