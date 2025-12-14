// src/hooks/useUserProgress.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  watch_percentage: number;
  is_completed: boolean;
  completed_at: string | null;
  last_watched_at: string;
}

export function useUserProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as LessonProgress[];
    },
    enabled: !!user?.id,
  });
}

export function useUserCourseProgress(courseSlug: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['course-progress', user?.id, courseSlug],
    queryFn: async () => {
      if (!user?.id) return null;

      // Buscar curso com módulos e aulas
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          modules:course_modules(
            id,
            lessons:course_lessons(id)
          )
        `)
        .eq('slug', courseSlug)
        .single();

      if (courseError) throw courseError;

      // Buscar progresso do usuário
      const lessonIds = course.modules?.flatMap(m => m.lessons?.map(l => l.id) || []) || [];

      const { data: progress, error: progressError } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (progressError) throw progressError;

      // Calcular porcentagem
      const totalLessons = lessonIds.length;
      const completedLessons = progress?.filter(p => p.is_completed).length || 0;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        totalLessons,
        completedLessons,
        percentage,
        progress: progress as LessonProgress[]
      };
    },
    enabled: !!user?.id && !!courseSlug,
  });
}
