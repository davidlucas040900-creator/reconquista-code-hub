// src/components/LessonSidebar.tsx

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useUserDripAccess } from '@/hooks/useAdminDripContent';
import { CheckCircle, Circle, Lock, Calendar } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';

export function LessonSidebar() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Hook de acesso
  const { data: accessData } = useUserAccess();

  // Hook de drip content
  const { isModuleAccessible, isLessonAccessible } = useUserDripAccess(user?.id);

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

  // Verificar acesso ao curso
  const hasCourseAccess = accessData?.hasFullAccess ||
    accessData?.purchasedCourses?.includes(currentLesson?.module?.course?.slug || '');

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
        lessons: module.lessons?.sort((a: any, b: any) => a.order_index - b.order_index) || []
      })) || [];
    },
    enabled: !!currentLesson?.module?.course?.id,
  });

  // Buscar progresso
  const { data: progress } = useQuery({
    queryKey: ['user-progress', user?.id, currentLesson?.module?.course?.id],
    queryFn: async () => {
      if (!user?.id || !modules) return [];

      const lessonIds = modules.flatMap((m: any) => m.lessons?.map((l: any) => l.id) || []);

      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user.id)
        .in('lesson_id', lessonIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!modules,
  });

  // Formatar data de liberação
  const formatReleaseDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const handleLessonClick = (lesson: any, moduleId: string) => {
    // Verificar drip antes de navegar
    const lessonAccess = isLessonAccessible(lesson.id, moduleId);

    if (!lessonAccess.accessible) {
      toast.error('Aula bloqueada', {
        description: lessonAccess.releaseDate
          ? `Liberação em ${formatReleaseDate(lessonAccess.releaseDate)}`
          : 'Aguarde a liberação',
      });
      return;
    }

    navigate(`/aula/${lesson.id}`);
  };

  const isLessonCompleted = (lessonId: string) => {
    return progress?.some((p: any) => p.lesson_id === lessonId && p.is_completed) || false;
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
      {modules.map((module: any) => {
        // Verificar drip do módulo
        const moduleAccess = isModuleAccessible(module.id);
        const isModuleLocked = hasCourseAccess && !moduleAccess.accessible;

        return (
          <div key={module.id} className="mb-6">
            <div className={`px-4 py-3 ${isModuleLocked ? 'bg-yellow-900/20' : 'bg-zinc-900/50'}`}>
              <div className="flex items-center gap-2">
                {isModuleLocked && <Lock className="w-4 h-4 text-yellow-500" />}
                <h3 className={`font-semibold text-sm uppercase tracking-wide ${isModuleLocked ? 'text-yellow-500' : 'text-white'}`}>
                  {module.name}
                </h3>
              </div>
              {isModuleLocked && moduleAccess.releaseDate && (
                <div className="flex items-center gap-1 mt-1 text-yellow-500/80 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>Libera em {formatReleaseDate(moduleAccess.releaseDate)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 px-2 py-2">
              {module.lessons?.map((lesson: any, index: number) => {
                const isCompleted = isLessonCompleted(lesson.id);
                const isCurrent = lesson.id === lessonId;

                // Verificar drip da aula
                const lessonAccess = isLessonAccessible(lesson.id, module.id);
                const isLessonLocked = hasCourseAccess && !lessonAccess.accessible;

                // Aula não acessível se módulo bloqueado OU aula bloqueada
                const isLocked = isModuleLocked || isLessonLocked;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => !isLocked && handleLessonClick(lesson, module.id)}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all
                      ${isLocked
                        ? 'opacity-60 cursor-not-allowed'
                        : isCurrent
                          ? 'bg-purple-900/20 border border-purple-500/30'
                          : 'hover:bg-zinc-800/50'
                      }`}
                  >
                    <div className="flex-shrink-0">
                      {isLocked ? (
                        <Lock className="w-5 h-5 text-yellow-500" />
                      ) : isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : isCurrent ? (
                        <Circle className="w-5 h-5 text-purple-500 fill-purple-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500" />
                      )}
                    </div>

                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${
                        isLocked
                          ? 'text-gray-500'
                          : isCurrent
                            ? 'text-purple-400'
                            : 'text-white'
                      }`}>
                        {index + 1}. {lesson.title}
                      </p>
                      {lesson.duration_minutes && !isLocked && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {lesson.duration_minutes} min
                        </p>
                      )}
                      {isLessonLocked && lessonAccess.releaseDate && (
                        <p className="text-xs text-yellow-500/80 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatReleaseDate(lessonAccess.releaseDate)}
                        </p>
                      )}
                    </div>

                    <div className="flex-shrink-0 flex gap-1">
                      {lesson.is_bonus && !isLocked && (
                        <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded">
                          BÔNUS
                        </span>
                      )}
                      {lesson.is_free && !isLocked && (
                        <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded">
                          GRÁTIS
                        </span>
                      )}
                      {isLocked && (
                        <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-500 text-xs rounded">
                          BLOQUEADO
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}