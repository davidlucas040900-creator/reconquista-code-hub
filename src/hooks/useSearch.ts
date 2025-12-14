// src/hooks/useSearch.ts

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'course' | 'module' | 'lesson' | 'material';
  title: string;
  description?: string;
  thumbnail?: string;
  parentName?: string;
  url: string;
}

export function useSearch(query: string) {
  const [isSearching, setIsSearching] = useState(false);

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.length < 2) return [];
      
      setIsSearching(true);
      const searchTerm = `%${query}%`;
      const allResults: SearchResult[] = [];

      // Buscar cursos
      const { data: courses } = await supabase
        .from('courses')
        .select('id, name, description, thumbnail, slug')
        .ilike('name', searchTerm)
        .eq('is_active', true)
        .limit(5);

      courses?.forEach(course => {
        allResults.push({
          id: course.id,
          type: 'course',
          title: course.name,
          description: course.description,
          thumbnail: course.thumbnail,
          url: `/curso/${course.slug}`
        });
      });

      // Buscar módulos
      const { data: modules } = await supabase
        .from('course_modules')
        .select('id, name, description, thumbnail, course_id, courses(name, slug)')
        .ilike('name', searchTerm)
        .eq('is_active', true)
        .limit(5);

      modules?.forEach((mod: any) => {
        allResults.push({
          id: mod.id,
          type: 'module',
          title: mod.name,
          description: mod.description,
          thumbnail: mod.thumbnail,
          parentName: mod.courses?.name,
          url: `/curso/${mod.courses?.slug}`
        });
      });

      // Buscar aulas
      const { data: lessons } = await supabase
        .from('course_lessons')
        .select('id, title, description, module_id, course_modules(name, courses(name))')
        .ilike('title', searchTerm)
        .eq('is_active', true)
        .limit(10);

      lessons?.forEach((lesson: any) => {
        allResults.push({
          id: lesson.id,
          type: 'lesson',
          title: lesson.title,
          description: lesson.description,
          parentName: `${lesson.course_modules?.courses?.name} > ${lesson.course_modules?.name}`,
          url: `/aula/${lesson.id}`
        });
      });

      // Buscar materiais
      const { data: materials } = await supabase
        .from('materials')
        .select('id, title, description, type, courses(name)')
        .ilike('title', searchTerm)
        .eq('is_active', true)
        .limit(5);

      materials?.forEach((material: any) => {
        allResults.push({
          id: material.id,
          type: 'material',
          title: material.title,
          description: material.description,
          parentName: material.courses?.name,
          url: `/materiais`
        });
      });

      setIsSearching(false);
      return allResults;
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  });

  return {
    results: results || [],
    isLoading: isLoading || isSearching,
  };
}
