import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LessonProgress {
  id: string;
  user_id: string;
  module_number: number;
  lesson_number: number;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useModuleProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const { data, error } = await (supabase as any)
        .from('user_lessons')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setProgress(data as LessonProgress[]);
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  const markLessonComplete = async (moduleId: number, lessonId: number) => {
    if (!user) return;

    const { error } = await (supabase as any)
      .from('user_lessons')
      .upsert({
        user_id: user.id,
        module_number: moduleId,
        lesson_number: lessonId,
        is_completed: true,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,module_number,lesson_number'
      });

    if (!error) {
      setProgress(prev => [
        ...prev.filter(p => !(p.module_number === moduleId && p.lesson_number === lessonId)),
        { 
          user_id: user.id,
          module_number: moduleId, 
          lesson_number: lessonId, 
          is_completed: true,
          completed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          id: crypto.randomUUID()
        }
      ]);
    }
  };

  const isLessonCompleted = (moduleId: number, lessonId: number) => {
    return progress.some(
      p => p.module_number === moduleId && p.lesson_number === lessonId && p.is_completed
    );
  };

  const getModuleProgress = (moduleId: number, totalLessons: number) => {
    const completedLessons = progress.filter(
      p => p.module_number === moduleId && p.is_completed
    ).length;
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  return {
    progress,
    loading,
    markLessonComplete,
    isLessonCompleted,
    getModuleProgress,
  };
};
