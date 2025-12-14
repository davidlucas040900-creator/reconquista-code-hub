// src/hooks/useAdminCustomization.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminActions } from './useAdminActions';

export function useAdminCustomization() {
  const queryClient = useQueryClient();
  const { logAction } = useAdminActions();

  // Buscar customizações
  const { data: customization, isLoading } = useQuery({
    queryKey: ['platform-customization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_customization')
        .select('*');

      if (error) throw error;

      // Converter array em objeto
      const result: Record<string, any> = {};
      data?.forEach((item) => {
        result[item.key] = item.value;
      });

      return result;
    },
  });

  // Atualizar customização
  const updateCustomizationMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('platform_customization')
        .upsert({ key, value }, { onConflict: 'key' });

      if (error) throw error;

      await logAction('update_customization', 'platform', key, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-customization'] });
      toast.success('Customização atualizada!');
    },
    onError: () => {
      toast.error('Erro ao atualizar customização');
    },
  });

  return {
    customization,
    isLoading,
    updateCustomization: updateCustomizationMutation.mutate,
  };
}
