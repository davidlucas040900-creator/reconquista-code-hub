// src/hooks/useUserAccess.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserAccess() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return { hasFullAccess: false, purchasedCourses: [] };

      // Buscar perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_full_access')
        .eq('id', user.id)
        .single();

      // Buscar compras
      const { data: purchases } = await supabase
        .from('purchases')
        .select('lojou_product_name')
        .eq('user_id', user.id)
        .eq('status', 'active');

      // Mapear produtos para slugs de cursos
      const courseMapping: Record<string, string> = {
        'O Código da Reconquista': 'codigo-reconquista',
        'Código da Reconquista': 'codigo-reconquista',
        'A Deusa na Cama': 'deusa-na-cama',
        'Deusa na Cama': 'deusa-na-cama',
        'O Santuário': 'santuario',
        'Santuário': 'santuario',
        'ACESSO EXCLUSIVO': 'santuario',
      };

      const purchasedCourses: string[] = [];
      
      purchases?.forEach(p => {
        Object.entries(courseMapping).forEach(([productName, courseSlug]) => {
          if (p.lojou_product_name?.toLowerCase().includes(productName.toLowerCase())) {
            if (!purchasedCourses.includes(courseSlug)) {
              purchasedCourses.push(courseSlug);
            }
          }
        });
      });

      return {
        hasFullAccess: profile?.has_full_access || false,
        purchasedCourses,
      };
    },
    enabled: !!user?.id,
  });
}

export function useHasCourseAccess(courseSlug: string) {
  const { data } = useUserAccess();
  
  if (!data) return false;
  if (data.hasFullAccess) return true;
  return data.purchasedCourses.includes(courseSlug);
}

