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
  modules?: ModuleWithLessons[];
}

export interface ModuleWithLessons {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  order_index: number;
  is_active: boolean;
  lessons?: Lesson[];
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
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          modules:course_modules(
            *,
            lessons:course_lessons(*)
          )
        `)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      // Ordenar módulos e aulas
      const coursesWithSortedData = data?.map(course => ({
        ...course,
        modules: course.modules
          ?.sort((a, b) => a.order_index - b.order_index)
          .map(module => ({
            ...module,
            lessons: module.lessons?.sort((a, b) => a.order_index - b.order_index) || []
          })) || []
      }));

      return coursesWithSortedData as CourseWithModules[];
    },
  });
}
