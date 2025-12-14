// src/hooks/useUserPurchases.ts

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserPurchases() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-purchases', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });
}

export function useHasCourseAccess(courseSlug: string) {
  const { user } = useAuth();
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('has_full_access')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: purchases } = useUserPurchases();

  // Se tem acesso completo (admin ou acesso especial)
  if (profile?.has_full_access) return true;

  // Verificar se comprou este curso específico
  const hasPurchased = purchases?.some(p => 
    p.product?.slug === courseSlug
  ) || false;

  return hasPurchased;
}
