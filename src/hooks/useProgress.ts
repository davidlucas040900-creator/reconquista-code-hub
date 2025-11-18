import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProgress = (moduleId: number, lessonId: number) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Carregar progresso existente
  useEffect(() => {
    if (!user) return;

    const loadProgress = async () => {
      const { data } = await supabase
        .from('user_lessons')
        .select('watch_percentage, is_completed')
        .eq('user_id', user.id)
        .eq('module_id', moduleId)
        .eq('lesson_id', lessonId)
        .maybeSingle();

      if (data) {
        setProgress(data.watch_percentage || 0);
        setIsCompleted(data.is_completed || false);
      }
    };

    loadProgress();
  }, [user, moduleId, lessonId]);

  // Atualizar progresso
  const updateProgress = async (percentage: number) => {
    if (!user) return;

    setProgress(percentage);

    await supabase.from('user_lessons').upsert({
      user_id: user.id,
      module_id: moduleId,
      lesson_id: lessonId,
      watch_percentage: percentage,
      is_completed: percentage >= 90,
      completed_at: percentage >= 90 ? new Date().toISOString() : null,
    });

    if (percentage >= 90 && !isCompleted) {
      setIsCompleted(true);
      // Atualizar estatísticas globais
      await updateGlobalStats();
    }
  };

  // Atualizar estatísticas globais
  const updateGlobalStats = async () => {
    if (!user) return;

    const { data: stats } = await supabase
      .from('user_stats')
      .select('lessons_completed')
      .eq('user_id', user.id)
      .maybeSingle();

    if (stats) {
      await supabase
        .from('user_stats')
        .update({
          lessons_completed: stats.lessons_completed + 1,
        })
        .eq('user_id', user.id);
    } else {
      // Criar stats se não existir
      await supabase.from('user_stats').insert({
        user_id: user.id,
        lessons_completed: 1,
      });
    }
  };

  return { progress, isCompleted, updateProgress };
};
