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
      // PASSO 1: Buscar cursos
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (coursesError) throw coursesError;

      // PASSO 2: Para cada curso, buscar módulos
      const coursesWithModules = await Promise.all(
        (courses || []).map(async (course) => {
          const { data: modules, error: modulesError } = await supabase
            .from('course_modules')
            .select('*')
            .eq('course_id', course.id)
            .eq('is_active', true)
            .order('order_index');

          if (modulesError) throw modulesError;

          // PASSO 3: Para cada módulo, buscar aulas
          const modulesWithLessons = await Promise.all(
            (modules || []).map(async (module) => {
              const { data: lessons, error: lessonsError } = await supabase
                .from('course_lessons')
                .select('*')
                .eq('module_id', module.id)
                .eq('is_active', true)
                .order('order_index');

              if (lessonsError) throw lessonsError;

              return {
                ...module,
                topics: module.topics || [],
                course_lessons: lessons || []
              };
            })
          );

          return {
            ...course,
            course_modules: modulesWithLessons
          };
        })
      );

      return coursesWithModules as CourseWithModules[];
    },
  });
}
