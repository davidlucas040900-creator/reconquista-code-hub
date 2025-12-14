// src/pages/Aula.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayer } from '@/components/VideoPlayer';
import { LessonSidebar } from '@/components/LessonSidebar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Aula() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [watchProgress, setWatchProgress] = useState(0);

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

  // Buscar todas as aulas do módulo para navegação
  const { data: moduleLessons } = useQuery({
    queryKey: ['module-lessons', lesson?.module?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_lessons')
        .select('id, title, order_index')
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
    toast.success(' Aula concluída!', {
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

  // Navegação entre aulas
  const currentIndex = moduleLessons?.findIndex(l => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? moduleLessons?.[currentIndex - 1] : null;
  const nextLesson = currentIndex < (moduleLessons?.length ?? 0) - 1 ? moduleLessons?.[currentIndex + 1] : null;

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

  const isCompleted = userProgress?.is_completed || false;

  return (
    <div className="min-h-screen bg-noir-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-noir-950/95 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/curso/${lesson.module?.course?.slug}`)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">{lesson.module?.course?.name}</span>
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2 border-zinc-700"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Video Section */}
        <div className="flex-1 p-4 lg:p-8">
          {/* Video Player */}
          <div className="rounded-xl overflow-hidden bg-black mb-6">
            <VideoPlayer
              videoUrl={lesson.video_url}
              onProgress={handleProgress}
              onComplete={markAsCompleted}
            />
          </div>

          {/* Lesson Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-sm text-purple-400 mb-1">
                  {lesson.module?.name}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {lesson.title}
                </h1>
              </div>
              
              {isCompleted ? (
                <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-2 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Concluída</span>
                </div>
              ) : (
                <Button
                  onClick={markAsCompleted}
                  variant="outline"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/10"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Marcar como concluída
                </Button>
              )}
            </div>

            {lesson.description && (
              <p className="text-gray-400 leading-relaxed">
                {lesson.description}
              </p>
            )}

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progresso desta aula</span>
                <span className="text-white font-medium">{watchProgress}%</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-300"
                  style={{ width: `${watchProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-wrap gap-4">
            {prevLesson ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/aula/${prevLesson.id}`)}
                className="flex-1 min-w-[200px] gap-2 border-zinc-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Aula Anterior
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => navigate(`/curso/${lesson.module?.course?.slug}`)}
                className="flex-1 min-w-[200px] gap-2 border-zinc-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Voltar ao Curso
              </Button>
            )}

            {nextLesson && (
              <Button
                onClick={() => navigate(`/aula/${nextLesson.id}`)}
                className="flex-1 min-w-[200px] gap-2 bg-purple-600 hover:bg-purple-700"
              >
                Próxima Aula
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[400px] border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-900/50">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden">
            <LessonSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
