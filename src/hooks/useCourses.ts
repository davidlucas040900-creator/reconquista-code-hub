// src/hooks/useCourses.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CourseWithModules {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  price: number;
  is_active: boolean;
  order_index: number;
  course_modules?: ModuleWithLessons[];
}

export interface ModuleWithLessons {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  order_index: number;
  is_active: boolean;
  topics?: string[];
  course_lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number;
  order_index: number;
  is_bonus: boolean;
  is_free: boolean;
  is_active: boolean;
}

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      console.log('[useCourses] Iniciando busca otimizada...');
      const startTime = Date.now();

      // QUERY ÚNICA COM JOINS
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select(`
          *,
          course_modules!course_modules_course_id_fkey (
            *,
            course_lessons!course_lessons_module_id_fkey (
              *
            )
          )
        `)
        .eq('is_active', true)
        .eq('course_modules.is_active', true)
        .eq('course_modules.course_lessons.is_active', true)
        .order('order_index')
        .order('order_index', { foreignTable: 'course_modules' })
        .order('order_index', { foreignTable: 'course_modules.course_lessons' });

      if (coursesError) {
        console.error('[useCourses] Erro:', coursesError);
        throw coursesError;
      }

      const elapsed = Date.now() - startTime;
      console.log(`[useCourses] Concluido em ${elapsed}ms`);

      // Transformar dados
      const coursesWithModules = (courses || []).map(course => ({
        ...course,
        course_modules: (course.course_modules || []).map(module => ({
          ...module,
          topics: module.topics || [],
          course_lessons: module.course_lessons || []
        }))
      }));

      return coursesWithModules as CourseWithModules[];
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    cacheTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
  });
}
