// src/hooks/useLesson.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export function useLesson() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar aula atual
  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_lessons')
        .select(`
          *,
          module:course_modules(
            *,
            course:courses(*)
          )
        `)
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!lessonId,
  });

  //  CORRIGIDO: user_lesson_progress
  const { data: progress } = useQuery({
    queryKey: ['lesson-progress', user?.id, lessonId],
    queryFn: async () => {
      if (!user?.id || !lessonId) return null;

      const { data, error } = await supabase
        .from('user_lesson_progress') //  TABELA CORRETA
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!lessonId,
  });

  // Mutation para atualizar progresso
  const updateProgressMutation = useMutation({
    mutationFn: async ({ watchPercentage, isCompleted }: { 
      watchPercentage: number; 
      isCompleted: boolean;
    }) => {
      if (!user?.id || !lessonId) throw new Error('Missing user or lesson');

      const { data, error } = await supabase
        .from('user_lesson_progress') //  TABELA CORRETA
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          watch_percentage: watchPercentage,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          last_watched_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress', user?.id, lessonId] });
      queryClient.invalidateQueries({ queryKey: ['user-progress', user?.id] });
    },
  });

  // Função para marcar como concluída
  const markAsCompleted = async () => {
    try {
      await updateProgressMutation.mutateAsync({
        watchPercentage: 100,
        isCompleted: true,
      });
      toast.success('Aula concluída! ');
    } catch (error) {
      console.error('Erro ao marcar aula como concluída:', error);
      toast.error('Erro ao salvar progresso');
    }
  };

  // Função para atualizar progresso de visualização
  const updateWatchProgress = async (percentage: number) => {
    if (!user?.id || !lessonId) return;

    try {
      await updateProgressMutation.mutateAsync({
        watchPercentage: Math.round(percentage),
        isCompleted: percentage >= 90,
      });
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  };

  return {
    lesson,
    progress,
    isLoading,
    markAsCompleted,
    updateWatchProgress,
    isUpdating: updateProgressMutation.isPending,
  };
}
