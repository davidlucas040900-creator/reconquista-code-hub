// src/hooks/useUserAccess.ts
// Corrigido: Busca acessos de user_courses + purchases

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserAccessData {
  hasFullAccess: boolean;
  purchasedCourses: string[];
  courseAccess: {
    courseId: string;
    courseSlug: string;
    courseName: string;
  }[];
}

export function useUserAccess() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-access', user?.id],
    queryFn: async (): Promise<UserAccessData> => {
      if (!user?.id) {
        return { hasFullAccess: false, purchasedCourses: [], courseAccess: [] };
      }

      console.log('[useUserAccess] Buscando acessos para:', user.id);

      // 1. Buscar perfil (has_full_access)
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_full_access')
        .eq('id', user.id)
        .single();

      const hasFullAccess = profile?.has_full_access || false;
      console.log('[useUserAccess] has_full_access:', hasFullAccess);

      // Se tem acesso total, buscar todos os cursos
      if (hasFullAccess) {
        const { data: allCourses } = await supabase
          .from('courses')
          .select('id, slug, name')
          .eq('is_active', true);

        const courseAccess: UserAccessData['courseAccess'] = [];
        const purchasedCourses: string[] = [];

        if (allCourses) {
          allCourses.forEach((course: any) => {
            courseAccess.push({
              courseId: course.id,
              courseSlug: course.slug,
              courseName: course.name
            });
            purchasedCourses.push(course.slug);
          });
        }

        console.log('[useUserAccess] Acesso total - todos os cursos:', purchasedCourses);
        return { hasFullAccess: true, purchasedCourses, courseAccess };
      }

      // 2. Buscar acessos da tabela user_courses (sem is_active)
      const { data: userCourses, error: ucError } = await supabase
        .from('user_courses')
        .select(`
          course_id,
          courses (
            id,
            slug,
            name
          )
        `)
        .eq('user_id', user.id);

      if (ucError) {
        console.error('[useUserAccess] Erro ao buscar user_courses:', ucError);
      }

      const courseAccess: UserAccessData['courseAccess'] = [];
      const purchasedCourses: string[] = [];

      if (userCourses) {
        userCourses.forEach((uc: any) => {
          if (uc.courses) {
            const course = uc.courses;
            courseAccess.push({
              courseId: course.id,
              courseSlug: course.slug,
              courseName: course.name
            });
            if (!purchasedCourses.includes(course.slug)) {
              purchasedCourses.push(course.slug);
            }
          }
        });
      }

      console.log('[useUserAccess] Cursos com acesso:', purchasedCourses);

      // 3. Fallback: Se nao tiver em user_courses, verificar purchases
      if (purchasedCourses.length === 0) {
        const { data: purchases } = await supabase
          .from('purchases')
          .select('lojou_product_name, product_name')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (purchases && purchases.length > 0) {
          console.log('[useUserAccess] Fallback: encontradas', purchases.length, 'compras');

          const productToCourse: Record<string, string> = {
            'codigo': 'codigo-reconquista',
            'reconquista': 'codigo-reconquista',
            'deusa': 'deusa-na-cama',
            'exclusivo': 'exclusivo-1-porcento',
            '1%': 'exclusivo-1-porcento',
            'santuario': 'santuario',
          };

          purchases.forEach(p => {
            const productName = (p.lojou_product_name || p.product_name || '').toLowerCase();
            
            Object.entries(productToCourse).forEach(([keyword, courseSlug]) => {
              if (productName.includes(keyword) && !purchasedCourses.includes(courseSlug)) {
                purchasedCourses.push(courseSlug);
              }
            });
          });

          console.log('[useUserAccess] Cursos via fallback:', purchasedCourses);
        }
      }

      return {
        hasFullAccess,
        purchasedCourses,
        courseAccess
      };
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useHasCourseAccess(courseSlug: string): boolean {
  const { data } = useUserAccess();

  if (!data) return false;
  if (data.hasFullAccess) return true;
  return data.purchasedCourses.includes(courseSlug);
}
