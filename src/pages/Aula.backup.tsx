// src/pages/Aula.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useUserDripAccess } from '@/hooks/useAdminDripContent';
import { VideoPlayer } from '@/components/VideoPlayer';
import { LessonSidebar } from '@/components/LessonSidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ChevronLeft, ChevronRight, Home, CheckCircle, List, X, Lock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function Aula() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [watchProgress, setWatchProgress] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hook de acesso (compra)
  const { data: accessData } = useUserAccess();

  // Hook de drip content
  const { isLessonAccessible, isModuleAccessible } = useUserDripAccess(user?.id);

  // Verificar autenticação
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Buscar dados da aula atual
  const { data: lesson, isLoading: lessonLoading } = useQuery({
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

  // Verificar acesso após carregar a aula
  const hasAccess = accessData?.hasFullAccess || accessData?.purchasedCourses?.includes(lesson?.module?.course?.slug || '');

  // Verificar drip content
  const lessonAccess = lesson ? isLessonAccessible(lesson.id, lesson.module_id) : { accessible: true };
  const isLessonLocked = hasAccess && !lessonAccess.accessible;

  // Redirecionar se aula bloqueada
  useEffect(() => {
    if (lesson && !lessonLoading && isLessonLocked) {
      toast.error('Esta aula ainda não está liberada', {
        description: lessonAccess.releaseDate
          ? `Liberação em ${formatReleaseDate(lessonAccess.releaseDate)}`
          : 'Aguarde a liberação pelo administrador',
      });
      navigate(`/curso/${lesson.module?.course?.slug}`);
    }
  }, [lesson, lessonLoading, isLessonLocked, lessonAccess.releaseDate, navigate]);

  // Buscar todas as aulas do módulo para navegação
  const { data: moduleLessons } = useQuery({
    queryKey: ['module-lessons', lesson?.module?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('id, title, order_index, module_id')
        .eq('module_id', lesson?.module?.id)
        .order('order_index');

      if (error) throw error;
      return data;
    },
    enabled: !!lesson?.module?.id,
  });

  // Buscar progresso do usuário para esta aula
  const { data: userProgress } = useQuery({
    queryKey: ['lesson-progress', user?.id, lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', user!.id)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id && !!lessonId,
  });

  // Mutation para salvar progresso
  const saveProgress = useMutation({
    mutationFn: async ({ percentage, completed }: { percentage: number; completed?: boolean }) => {
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user!.id,
          lesson_id: lessonId,
          watch_percentage: percentage,
          is_completed: completed || percentage >= 90,
          completed_at: completed || percentage >= 90 ? new Date().toISOString() : null,
          last_watched_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-progress'] });
    },
  });

  // Marcar como completa
  const markAsCompleted = async () => {
    await saveProgress.mutateAsync({ percentage: 100, completed: true });
    toast.success('Aula concluída!', {
      description: 'Parabéns por mais uma conquista!',
    });
  };

  // Handler de progresso do vídeo
  const handleProgress = (percentage: number) => {
    setWatchProgress(percentage);

    // Salvar a cada 10% de progresso
    if (percentage % 10 === 0 && percentage > 0) {
      saveProgress.mutate({ percentage });
    }
  };

  // Formatar data de liberação
  const formatReleaseDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Navegação entre aulas - RESPEITANDO DRIP
  const currentIndex = moduleLessons?.findIndex(l => l.id === lessonId) ?? -1;

  // Encontrar aula anterior acessível
  const findPrevAccessibleLesson = () => {
    if (!moduleLessons || currentIndex <= 0) return null;

    for (let i = currentIndex - 1; i >= 0; i--) {
      const prevLesson = moduleLessons[i];
      const prevAccess = isLessonAccessible(prevLesson.id, prevLesson.module_id);
      if (prevAccess.accessible) {
        return prevLesson;
      }
    }
    return null;
  };

  // Encontrar próxima aula acessível
  const findNextAccessibleLesson = () => {
    if (!moduleLessons || currentIndex >= moduleLessons.length - 1) return null;

    for (let i = currentIndex + 1; i < moduleLessons.length; i++) {
      const nextLesson = moduleLessons[i];
      const nextAccess = isLessonAccessible(nextLesson.id, nextLesson.module_id);
      if (nextAccess.accessible) {
        return nextLesson;
      }
    }
    return null;
  };

  const prevLesson = findPrevAccessibleLesson();
  const nextLesson = findNextAccessibleLesson();

  // Verificar se há próxima aula (mesmo bloqueada) para mostrar indicador
  const hasNextLessonBlocked = currentIndex < (moduleLessons?.length ?? 0) - 1 && !nextLesson;

  if (authLoading || lessonLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-gray-400">Carregando aula...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">Aula não encontrada</p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Se a aula está bloqueada, não renderizar (o useEffect já redireciona)
  if (isLessonLocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-950">
        <div className="text-center">
          <Lock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <p className="text-yellow-400 mb-2">Aula bloqueada</p>
          <p className="text-gray-400 text-sm mb-4">Redirecionando...</p>
        </div>
      </div>
    );
  }

  const isCompleted = userProgress?.is_completed || false;

  return (
    <div className="min-h-screen bg-noir-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-noir-950/95 backdrop-blur-lg">
        <div className="px-4">
          <div className="flex h-14 items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <button
                onClick={() => navigate(`/curso/${lesson.module?.course?.slug}`)}
                className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline text-sm truncate max-w-[150px]">
                  {lesson.module?.course?.name}
                </span>
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="gap-1 text-gray-400 hover:text-white"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>

              {/* Mobile: Botão para abrir sidebar */}
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="lg:hidden gap-1">
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Aulas</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px] p-0 bg-zinc-900 border-zinc-800">
                  <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                    <h2 className="font-semibold text-white">Conteúdo do Curso</h2>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <LessonSidebar />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Video Section */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Video Player */}
          <div className="rounded-xl overflow-hidden bg-black mb-4 lg:mb-6">
            <VideoPlayer
              videoUrl={lesson.video_url}
              onProgress={handleProgress}
              onComplete={markAsCompleted}
            />
          </div>

          {/* Lesson Info */}
          <div className="mb-4 lg:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
              <div className="min-w-0">
                <p className="text-sm text-purple-400 mb-1">
                  {lesson.module?.name}
                </p>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                  {lesson.title}
                </h1>
              </div>

              {isCompleted ? (
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-2 rounded-lg flex-shrink-0 self-start">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm font-medium">Concluída</span>
                </div>
              ) : (
                <Button
                  onClick={markAsCompleted}
                  variant="outline"
                  size="sm"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10 flex-shrink-0 self-start"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Marcar como concluída</span>
                  <span className="sm:hidden">Concluir</span>
                </Button>
              )}
            </div>

            {lesson.description && (
              <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
                {lesson.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs sm:text-sm mb-2">
                <span className="text-gray-400">Progresso desta aula</span>
                <span className="text-white font-medium">{watchProgress}%</span>
              </div>
              <div className="h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
                  style={{ width: `${watchProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {prevLesson ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/aula/${prevLesson.id}`)}
                className="flex-1 gap-2 border-zinc-700 text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="truncate">Anterior</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate(`/curso/${lesson.module?.course?.slug}`)}
                className="flex-1 gap-2 border-zinc-700 text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="truncate">Voltar ao Curso</span>
              </Button>
            )}

            {nextLesson ? (
              <Button
                onClick={() => navigate(`/aula/${nextLesson.id}`)}
                className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700 text-sm"
              >
                <span className="truncate">Próxima Aula</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : hasNextLessonBlocked ? (
              <Button
                disabled
                className="flex-1 gap-2 bg-yellow-600/20 text-yellow-500 cursor-not-allowed text-sm"
              >
                <Lock className="h-4 w-4" />
                <span className="truncate">Próxima Bloqueada</span>
              </Button>
            ) : null}
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-[350px] xl:w-[400px] border-l border-zinc-800 bg-zinc-900/50">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="font-semibold text-white">Conteúdo do Curso</h2>
            </div>
            <LessonSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}