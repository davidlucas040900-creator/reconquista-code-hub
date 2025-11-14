import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getLessonData, getNextLesson, getPreviousLesson, getModuleLessons } from '@/data/lessons';
import { VideoPlayer } from '@/components/VideoPlayer';
import { LessonSidebar } from '@/components/LessonSidebar';
import { ModuleCompletionCard } from '@/components/ModuleCompletionCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, BookOpen } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Lesson() {
  const params = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [moduleProgress, setModuleProgress] = useState(0);

  const moduleNumber = parseInt(params.moduleId || '0');
  const lessonNumber = parseInt(params.lessonId || '0');

  // Verificar autenticação
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Carregar dados da aula
  useEffect(() => {
    const data = getLessonData(moduleNumber, lessonNumber);

    if (!data) {
      toast.error('Aula não encontrada');
      navigate('/dashboard');
      return;
    }

    setLesson(data);
  }, [moduleNumber, lessonNumber]);

  // Calcular progresso do módulo
  useEffect(() => {
    const calculateModuleProgress = async () => {
      if (!user) return;

      const moduleLessons = getModuleLessons(moduleNumber);
      
      const { data } = await supabase
        .from('user_lessons')
        .select('is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      const completedCount = data?.length || 0;
      const percentage = Math.round((completedCount / moduleLessons.length) * 100);
      setModuleProgress(percentage);
    };

    calculateModuleProgress();
  }, [user, moduleNumber, lessonNumber]);

  const handleProgress = async (percentage: number) => {
    setProgress(percentage);

    if (!user || !lesson) return;

    // Salvar progresso no Supabase
    await supabase.from('user_lessons').upsert({
      user_id: user.id,
      lesson_id: lessonNumber,
      watch_percentage: percentage,
      last_watched_at: new Date().toISOString(),
    });
  };

  const handleComplete = async () => {
    if (!user || !lesson) return;

    await supabase.from('user_lessons').upsert({
      user_id: user.id,
      lesson_id: lessonNumber,
      is_completed: true,
      completed_at: new Date().toISOString(),
    });

    toast.success('🎉 Aula concluída!', {
      description: 'Parabéns por mais uma conquista!'
    });
  };

  if (loading || !lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando aula...</p>
        </div>
      </div>
    );
  }

  const nextLesson = getNextLesson(moduleNumber, lessonNumber);
  const prevLesson = getPreviousLesson(moduleNumber, lessonNumber);
  const isLastLessonOfModule = !nextLesson || nextLesson.module !== moduleNumber;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center font-bold text-primary-foreground shadow-lg">
                CR
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="w-4 h-4" />
                <span>Módulo {moduleNumber}</span>
                <span>•</span>
                <span>Aula {lessonNumber}</span>
                {lesson.isBonus && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold">
                      BÓNUS
                    </span>
                  </>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
          {/* Video Section */}
          <div className="space-y-6">
            {/* Video Player */}
            <VideoPlayer
              youtubeId={lesson.videoId}
              onProgress={handleProgress}
              onComplete={handleComplete}
            />

            {/* Module Completion Card */}
            {isLastLessonOfModule && (
              <ModuleCompletionCard
                currentModule={moduleNumber}
                completedPercentage={moduleProgress}
              />
            )}

            {/* Lesson Info */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text">
                {lesson.title}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {lesson.description}
              </p>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progresso desta aula</span>
                  <span className="font-semibold text-foreground">{progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 flex-wrap">
              {prevLesson ? (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/modulo/${prevLesson.module}/aula/${prevLesson.lesson}`)}
                  className="flex-1 min-w-[200px] gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Aula Anterior
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 min-w-[200px] gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar ao Início
                </Button>
              )}

              {nextLesson && (
                <Button
                  onClick={() => navigate(`/modulo/${nextLesson.module}/aula/${nextLesson.lesson}`)}
                  className="flex-1 min-w-[200px] bg-primary hover:bg-primary/90 gap-2 font-semibold"
                >
                  Próxima Aula
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <LessonSidebar moduleNumber={moduleNumber} />
          </div>
        </div>
      </div>
    </div>
  );
}
