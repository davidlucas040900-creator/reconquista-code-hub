// src/components/LessonSidebar.tsx

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Circle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export function LessonSidebar() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Buscar módulo atual e aulas
  const { data: currentLesson } = useQuery({
    queryKey: ['current-lesson', lessonId],
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

  // Buscar todos os módulos do curso
  const { data: modules } = useQuery({
    queryKey: ['course-modules', currentLesson?.module?.course?.id],
    queryFn: async () => {
      if (!currentLesson?.module?.course?.id) return [];

      const { data, error } = await supabase
        .from('course_modules')
        .select(`
          *,
          lessons:course_lessons(*)
        `)
        .eq('course_id', currentLesson.module.course.id)
        .order('order_index');

      if (error) throw error;

      return data?.map(module => ({
        ...module,
        lessons: module.lessons?.sort((a, b) => a.order_index - b.order_index) || []
      })) || [];
    },
    enabled: !!currentLesson?.module?.course?.id,
  });

  //  CORRIGIDO: user_lesson_progress
  const { data: progress } = useQuery({
    queryKey: ['user-progress', user?.id, currentLesson?.module?.course?.id],
    queryFn: async () => {
      if (!user?.id || !modules) return [];

      const lessonIds = modules.flatMap(m => m.lessons?.map(l => l.id) || []);

      const { data, error } = await supabase
        .from('user_lesson_progress') //  TABELA CORRETA
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!modules,
  });

  const handleLessonClick = (lesson: any) => {
    navigate(`/aula/${lesson.id}`);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.some(p => p.lesson_id === lessonId && p.is_completed) || false;
  };

  if (!modules) {
    return (
      <div className="p-4 text-center text-gray-400">
        Carregando...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {modules.map((module) => (
        <div key={module.id} className="mb-6">
          <div className="px-4 py-3 bg-zinc-900/50">
            <h3 className="font-semibold text-white text-sm uppercase tracking-wide">
              {module.name}
            </h3>
          </div>

          <div className="space-y-1 px-2 py-2">
            {module.lessons?.map((lesson, index) => {
              const isCompleted = isLessonCompleted(lesson.id);
              const isCurrent = lesson.id === lessonId;

              return (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonClick(lesson)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all
                    ${isCurrent 
                      ? 'bg-purple-900/20 border border-purple-500/30' 
                      : 'hover:bg-zinc-800/50'
                    }`}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : isCurrent ? (
                      <Circle className="w-5 h-5 text-purple-500 fill-purple-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>

                  <div className="flex-1 text-left">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-purple-400' : 'text-white'}`}>
                      {index + 1}. {lesson.title}
                    </p>
                    {lesson.duration_minutes && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {lesson.duration_minutes} min
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex gap-1">
                    {lesson.is_bonus && (
                      <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded">
                        BÔNUS
                      </span>
                    )}
                    {lesson.is_free && (
                      <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded">
                        GRÁTIS
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
