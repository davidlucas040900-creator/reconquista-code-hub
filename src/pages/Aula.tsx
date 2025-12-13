import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  is_bonus: boolean;
  module_id: string;
}

interface Module {
  id: string;
  name: string;
  course_id: string;
}

interface SidebarLesson {
  id: string;
  title: string;
  is_completed: boolean;
  order_index: number;
}

interface SidebarModule {
  id: string;
  name: string;
  order_index: number;
  lessons: SidebarLesson[];
}

export default function Aula() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [sidebarModules, setSidebarModules] = useState<SidebarModule[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [prevLesson, setPrevLesson] = useState<string | null>(null);
  const [nextLesson, setNextLesson] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && lessonId) {
      fetchLesson();
    }
  }, [user, lessonId]);

  const fetchLesson = async () => {
    if (!user || !lessonId) return;

    const { data: lessonData } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (!lessonData) {
      navigate('/dashboard');
      return;
    }

    setLesson(lessonData);

    const { data: moduleData } = await supabase
      .from('course_modules')
      .select('id, name, course_id')
      .eq('id', lessonData.module_id)
      .single();

    setModule(moduleData);

    const { data: progressData } = await supabase
      .from('user_lesson_progress')
      .select('is_completed, watch_percentage')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    if (progressData) {
      setIsCompleted(progressData.is_completed);
      setWatchProgress(progressData.watch_percentage || 0);
    }

    if (moduleData) {
      const { data: allModules } = await supabase
        .from('course_modules')
        .select('id, name, order_index')
        .eq('course_id', moduleData.course_id)
        .eq('is_active', true)
        .order('order_index');

      if (allModules) {
        const modulesWithLessons = await Promise.all(
          allModules.map(async (mod) => {
            const { data: lessonsData } = await supabase
              .from('course_lessons')
              .select('id, title, order_index')
              .eq('module_id', mod.id)
              .eq('is_active', true)
              .order('order_index');

            const lessonIds = lessonsData?.map(l => l.id) || [];
            const { data: progressList } = await supabase
              .from('user_lesson_progress')
              .select('lesson_id, is_completed')
              .eq('user_id', user.id)
              .in('lesson_id', lessonIds);

            const progressMap = new Map(
              (progressList || []).map(p => [p.lesson_id, p.is_completed])
            );

            return {
              ...mod,
              lessons: (lessonsData || []).map(l => ({
                ...l,
                is_completed: progressMap.get(l.id) || false,
              })),
            };
          })
        );

        setSidebarModules(modulesWithLessons);

        const allLessons = modulesWithLessons.flatMap(m => m.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === lessonId);

        setPrevLesson(currentIndex > 0 ? allLessons[currentIndex - 1].id : null);
        setNextLesson(currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1].id : null);
      }
    }

    await supabase.from('access_logs').insert({
      user_id: user.id,
      action: 'lesson_view',
      metadata: { lesson_id: lessonId },
    });

    setLoading(false);
  };

  const handleProgress = async (percentage: number) => {
    setWatchProgress(percentage);

    if (!user || !lessonId) return;

    await supabase.from('user_lesson_progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      watch_percentage: percentage,
      last_watched_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,lesson_id'
    });
  };

  const handleComplete = async () => {
    if (!user || !lessonId) return;

    await supabase.from('user_lesson_progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
      watch_percentage: 100,
      last_watched_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,lesson_id'
    });

    setIsCompleted(true);
    toast.success(' Aula concluída!');

    setSidebarModules(prev =>
      prev.map(mod => ({
        ...mod,
        lessons: mod.lessons.map(l =>
          l.id === lessonId ? { ...l, is_completed: true } : l
        ),
      }))
    );

    if (nextLesson) {
      setTimeout(() => {
        navigate(`/aula/${nextLesson}`);
      }, 2000);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-sm">
        <div className="px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                onClick={() => navigate('/dashboard')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="hidden sm:block">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{module?.name}</p>
                <h1 className="text-sm font-medium text-zinc-100 truncate max-w-md">
                  {lesson?.title}
                </h1>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* ========== MAIN CONTENT ========== */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Video Player */}
            {lesson?.video_url ? (
              <div className="rounded-lg overflow-hidden border border-zinc-800/50">
                <VideoPlayer
                  youtubeId={lesson.video_url}
                  onProgress={handleProgress}
                  onComplete={handleComplete}
                />
              </div>
            ) : (
              <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center border border-zinc-800/50">
                <p className="text-zinc-500">Vídeo não disponível</p>
              </div>
            )}

            {/* Lesson Info */}
            <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-zinc-100 mb-2">
                    {lesson?.title}
                  </h1>
                  {lesson?.is_bonus && (
                    <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded font-medium">
                      AULA BÔNUS
                    </span>
                  )}
                </div>

                <Button
                  onClick={handleComplete}
                  disabled={isCompleted}
                  className={isCompleted 
                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700" 
                    : "bg-amber-500 text-zinc-900 hover:bg-amber-400 font-medium"
                  }
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Concluída
                    </>
                  ) : (
                    'Marcar como concluída'
                  )}
                </Button>
              </div>

              {lesson?.description && (
                <p className="text-zinc-400 mb-4">{lesson.description}</p>
              )}

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-500">Progresso da aula</span>
                  <span className="text-zinc-400 font-medium tabular-nums">{watchProgress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                    style={{ width: `${watchProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {prevLesson ? (
                <Button
                  variant="outline"
                  className="border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  onClick={() => navigate(`/aula/${prevLesson}`)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              ) : (
                <div />
              )}

              {nextLesson && (
                <Button 
                  className="bg-amber-500 text-zinc-900 hover:bg-amber-400 font-medium"
                  onClick={() => navigate(`/aula/${nextLesson}`)}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* ========== SIDEBAR ========== */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 z-40
          w-80 bg-zinc-900/50 border-l border-zinc-800/50
          transform transition-transform lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full overflow-y-auto p-4">
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-4">
              Conteúdo do curso
            </h2>

            <div className="space-y-6">
              {sidebarModules.map((mod, modIndex) => (
                <div key={mod.id}>
                  <p className="text-xs text-zinc-500 mb-2">
                    MÓDULO {modIndex + 1}  {mod.name}
                  </p>

                  <div className="space-y-1">
                    {mod.lessons.map((sideLesson, lessonIndex) => (
                      <button
                        key={sideLesson.id}
                        onClick={() => {
                          navigate(`/aula/${sideLesson.id}`);
                          setSidebarOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded text-left text-sm transition-colors
                          ${sideLesson.id === lessonId
                            ? 'bg-zinc-800 text-zinc-100'
                            : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                          }
                        `}
                      >
                        {sideLesson.is_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                        )}
                        <span className="truncate">
                          {modIndex + 1}.{lessonIndex + 1} {sideLesson.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
