-- =====================================================
-- MIGRATION: Estrutura Completa de Cursos
-- Adiciona tabelas para gerenciar cursos via Admin
-- =====================================================

-- 1. TABELA DE CURSOS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  thumbnail TEXT,
  price DECIMAL(10,2),
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE MÃƒâ€œDULOS DO CURSO
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, slug)
);

-- 3. TABELA DE AULAS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,  -- YouTube ID
  video_provider TEXT DEFAULT 'youtube',
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_bonus BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE PROGRESSO DE AULAS (substitui module_progress)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  watch_percentage INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- =====================================================
-- ÃƒÂNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_course_modules_course ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_lessons_module ON public.course_lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON public.user_lesson_progress(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Courses: todos podem ver cursos ativos
CREATE POLICY "Anyone can view active courses" ON public.courses
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage courses" ON public.courses
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Modules: todos podem ver mÃƒÂ³dulos ativos
CREATE POLICY "Anyone can view active modules" ON public.course_modules
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage modules" ON public.course_modules
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Lessons: todos podem ver aulas ativas
CREATE POLICY "Anyone can view active lessons" ON public.course_lessons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage lessons" ON public.course_lessons
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User Progress: usuÃƒÂ¡rio vÃƒÂª apenas seu progresso
CREATE POLICY "Users view own progress" ON public.user_lesson_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own progress" ON public.user_lesson_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress" ON public.user_lesson_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_courses_updated_at ON public.courses;
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_course_modules_updated_at ON public.course_modules;
CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON public.course_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_course_lessons_updated_at ON public.course_lessons;
CREATE TRIGGER update_course_lessons_updated_at BEFORE UPDATE ON public.course_lessons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- INSERIR CURSOS INICIAIS
-- =====================================================

-- Curso 1: O CÃƒÂ³digo da Reconquista
INSERT INTO public.courses (name, slug, description, thumbnail, price, order_index)
VALUES (
  'O CÃƒÂ³digo da Reconquista',
  'codigo-reconquista',
  'Curso completo de reconquista amorosa com estratÃƒÂ©gias comprovadas.',
  'https://pub-335435355c6548d7987945a540eca66b.r2.dev/MODULO%201.webp',
  197.00,
  1
) ON CONFLICT (slug) DO NOTHING;

-- Curso 2: A Deusa na Cama
INSERT INTO public.courses (name, slug, description, thumbnail, price, order_index)
VALUES (
  'A Deusa na Cama',
  'deusa-na-cama',
  'MÃƒÂ³dulo premium de seduÃƒÂ§ÃƒÂ£o avanÃƒÂ§ada com tÃƒÂ©cnicas secretas que transformam momentos ÃƒÂ­ntimos em experiÃƒÂªncias inesquecÃƒÂ­veis.',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
  597.00,
  2
) ON CONFLICT (slug) DO NOTHING;
