import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LessonProgress {
  module_id: number;
  lesson_id: number;
  lesson_number: number;
  completed: boolean;
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
      const { data, error } = await supabase
        .from('user_lessons')
        .select('module_id, lesson_id, lesson_number, completed')
        .eq('user_id', user.id);

      if (!error && data) {
        setProgress(data);
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  const markLessonComplete = async (moduleId: number, lessonId: number, lessonNumber: number = 1) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_lessons')
      .upsert({
        user_id: user.id,
        module_id: moduleId,
        lesson_id: lessonId,
        lesson_number: lessonNumber,
        completed: true,
        completed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,module_id,lesson_id'
      });

    if (!error) {
      setProgress(prev => [
        ...prev.filter(p => !(p.module_id === moduleId && p.lesson_id === lessonId)),
        { module_id: moduleId, lesson_id: lessonId, lesson_number: lessonNumber, completed: true }
      ]);
    }
  };

  const isLessonCompleted = (moduleId: number, lessonId: number) => {
    return progress.some(
      p => p.module_id === moduleId && p.lesson_id === lessonId && p.completed
    );
  };

  const getModuleProgress = (moduleId: number, totalLessons: number) => {
    const completedLessons = progress.filter(
      p => p.module_id === moduleId && p.completed
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
