// src/hooks/useAdminDripContent.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminActions } from './useAdminActions';

export function useAdminDripContent() {
  const queryClient = useQueryClient();
  const { logAction } = useAdminActions();

  // Listar liberações agendadas
  const { data: releases, isLoading } = useQuery({
    queryKey: ['admin-drip-releases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_releases')
        .select('*, user:profiles(email), module:course_modules(name)')
        .order('release_date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Agendar liberação
  const scheduleReleaseMutation = useMutation({
    mutationFn: async ({
      userId,
      moduleId,
      releaseDate,
    }: {
      userId: string;
      moduleId: string;
      releaseDate: string;
    }) => {
      const { error } = await supabase.from('module_releases').insert({
        user_id: userId,
        module_id: moduleId,
        release_date: releaseDate,
      });

      if (error) throw error;

      await logAction('schedule_release', 'module', moduleId, { userId, releaseDate });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drip-releases'] });
      toast.success('Liberação agendada!');
    },
    onError: () => {
      toast.error('Erro ao agendar liberação');
    },
  });

  // Liberar módulo manualmente
  const releaseModuleMutation = useMutation({
    mutationFn: async ({ userId, moduleId }: { userId: string; moduleId: string }) => {
      const { error } = await supabase
        .from('module_releases')
        .update({ is_released: true, released_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('module_id', moduleId);

      if (error) throw error;

      await logAction('release_module', 'module', moduleId, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drip-releases'] });
      toast.success('Módulo liberado!');
    },
    onError: () => {
      toast.error('Erro ao liberar módulo');
    },
  });

  return {
    releases,
    isLoading,
    scheduleRelease: scheduleReleaseMutation.mutate,
    releaseModule: releaseModuleMutation.mutate,
  };
}
