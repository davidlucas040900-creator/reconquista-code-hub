// src/pages/Aula.tsx

<<<<<<< HEAD
import { useEffect, useState, useRef } from 'react';
=======
import { useEffect, useState } from 'react';
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  PlayCircle,
  Loader2,
  Menu,
  X
} from 'lucide-react';
=======
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2 } from 'lucide-react';
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
<<<<<<< HEAD
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
=======
  is_bonus: boolean;
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)
}

export default function Aula() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
<<<<<<< HEAD

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [sidebarModules, setSidebarModules] = useState<SidebarModule[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [watchProgress, setWatchProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [prevLesson, setPrevLesson] = useState<string | null>(null);
  const [nextLesson, setNextLesson] = useState<string | null>(null);
=======
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)

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
<<<<<<< HEAD
    if (!user || !lessonId) return;

    // Buscar aula
    const { data: lessonData } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('id', lessonId)
      .single();

    if (!lessonData) {
=======
    if (!user) return;

    const { data } = await supabase
      .from('course_lessons')
      .select('id, title, description, video_url, is_bonus')
      .eq('id', lessonId)
      .single();

    if (!data) {
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)
      navigate('/dashboard');
      return;
    }

<<<<<<< HEAD
    setLesson(lessonData);

    // Buscar módulo
    const { data: moduleData } = await supabase
      .from('course_modules')
      .select('id, name, course_id')
      .eq('id', lessonData.module_id)
      .single();

    setModule(moduleData);

    // Buscar progresso do usuário
    const { data: progressData } = await supabase
      .from('user_lesson_progress')
      .select('is_completed, watch_percentage')
=======
    setLesson(data);

    const { data: progress } = await supabase
      .from('user_lesson_progress')
      .select('is_completed')
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

<<<<<<< HEAD
    if (progressData) {
      setIsCompleted(progressData.is_completed);
      setWatchProgress(progressData.watch_percentage || 0);
    }

    // Buscar todos os módulos e aulas para a sidebar
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

        // Encontrar aula anterior e próxima
        const allLessons = modulesWithLessons.flatMap(m => m.lessons);
        const currentIndex = allLessons.findIndex(l => l.id === lessonId);

        if (currentIndex > 0) {
          setPrevLesson(allLessons[currentIndex - 1].id);
        } else {
          setPrevLesson(null);
        }

        if (currentIndex < allLessons.length - 1) {
          setNextLesson(allLessons[currentIndex + 1].id);
        } else {
          setNextLesson(null);
        }
      }
    }

    // Registrar acesso
    await supabase.from('access_logs').insert({
      user_id: user.id,
      action: 'lesson_view',
      metadata: { lesson_id: lessonId },
    });

=======
    setIsCompleted(progress?.is_completed || false);
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)
    setLoading(false);
  };

  const markAsComplete = async () => {
    if (!user || !lessonId) return;

    await supabase.from('user_lesson_progress').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
      watch_percentage: 100,
      last_watched_at: new Date().toISOString(),
<<<<<<< HEAD
    }, {
      onConflict: 'user_id,lesson_id'
    });

    setIsCompleted(true);
    toast.success('Aula marcada como concluída!');

    // Atualizar sidebar
    setSidebarModules(prev => 
      prev.map(mod => ({
        ...mod,
        lessons: mod.lessons.map(l => 
          l.id === lessonId ? { ...l, is_completed: true } : l
        ),
      }))
    );
=======
    }, { onConflict: 'user_id,lesson_id' });

    setIsCompleted(true);
    toast.success('Aula marcada como concluída!');
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
<<<<<<< HEAD
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="hidden sm:block">
                <p className="text-xs text-muted-foreground">{module?.name}</p>
                <h1 className="font-medium text-foreground truncate max-w-md">
                  {lesson?.title}
                </h1>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
=======
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="px-4">
          <div className="flex h-14 items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-medium text-foreground truncate">{lesson?.title}</h1>
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)
          </div>
        </div>
      </header>

<<<<<<< HEAD
      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {lesson?.video_url ? (
                <iframe
                  src={`https://www.youtube.com/embed/${lesson.video_url}?rel=0`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white/50">Vídeo não disponível</p>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-xl font-semibold text-foreground mb-1">
                    {lesson?.title}
                  </h1>
                  {lesson?.is_bonus && (
                    <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-1 rounded">
                      Aula Bônus
                    </span>
                  )}
                </div>

                <Button
                  onClick={markAsComplete}
                  disabled={isCompleted}
                  variant={isCompleted ? 'outline' : 'default'}
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
                <p className="text-muted-foreground">{lesson.description}</p>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {prevLesson ? (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/aula/${prevLesson}`)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              ) : (
                <div />
              )}

              {nextLesson && (
                <Button onClick={() => navigate(`/aula/${nextLesson}`)}>
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 right-0 z-40
          w-80 bg-background border-l border-border
          transform transition-transform lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full overflow-y-auto p-4">
            <h2 className="font-semibold text-foreground mb-4">Conteúdo do curso</h2>

            <div className="space-y-4">
              {sidebarModules.map((mod, modIndex) => (
                <div key={mod.id}>
                  <p className="text-xs text-muted-foreground mb-2">
                    Módulo {modIndex + 1}: {mod.name}
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
                          w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-colors
                          ${sideLesson.id === lessonId 
                            ? 'bg-accent text-accent-foreground' 
                            : 'hover:bg-accent/50 text-muted-foreground'
                          }
                        `}
                      >
                        {sideLesson.is_completed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 flex-shrink-0" />
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

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
=======
      <main className="max-w-4xl mx-auto p-4 lg:p-6 space-y-6">
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          {lesson?.video_url ? (
            <iframe
              src={`https://www.youtube.com/embed/${lesson.video_url}?rel=0`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-white/50">Vídeo não disponível</p>
            </div>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground mb-1">{lesson?.title}</h1>
            {lesson?.is_bonus && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Bônus</span>
            )}
            {lesson?.description && (
              <p className="text-muted-foreground mt-2">{lesson.description}</p>
            )}
          </div>

          <Button onClick={markAsComplete} disabled={isCompleted} variant={isCompleted ? 'outline' : 'default'}>
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
      </main>
    </div>
  );
}
>>>>>>> 21190ae (fix: adicionar arquivos de páginas faltantes)
