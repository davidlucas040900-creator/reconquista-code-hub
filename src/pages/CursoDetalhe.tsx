// src/pages/CursoDetalhe.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserAccess } from '@/hooks/useUserAccess';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronRight, 
  PlayCircle, 
  CheckCircle,
  Circle,
  Loader2, 
  Lock,
  Clock,
  BookOpen
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Module {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  lessons: { id: string; title: string; is_bonus: boolean; duration_minutes: number }[];
}

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
}

export default function CursoDetalhe() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: userProgress } = useUserProgress();
  const { data: accessData } = useUserAccess();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const hasAccess = accessData?.hasFullAccess || accessData?.purchasedCourses?.includes(courseSlug || '');

  // Auto-scroll do carrossel de capas
  useEffect(() => {
    if (modules.length <= 1) return;
    
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % modules.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [modules.length]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && courseSlug) {
      fetchCourse();
    }
  }, [user, courseSlug]);

  const fetchCourse = async () => {
    const { data: courseData } = await supabase
      .from('courses')
      .select('*')
      .eq('slug', courseSlug)
      .single();

    if (!courseData) {
      navigate('/cursos');
      return;
    }

    setCourse(courseData);

    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('id, name, description, thumbnail')
      .eq('course_id', courseData.id)
      .eq('is_active', true)
      .order('order_index');

    if (modulesData) {
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (mod) => {
          const { data: lessons } = await supabase
            .from('course_lessons')
            .select('id, title, is_bonus, duration_minutes')
            .eq('module_id', mod.id)
            .eq('is_active', true)
            .order('order_index');
          return { ...mod, lessons: lessons || [] };
        })
      );
      setModules(modulesWithLessons);
      if (modulesWithLessons.length > 0) {
        setExpandedModules(new Set([modulesWithLessons[0].id]));
      }
    }

    setLoading(false);
  };

  const toggleModule = (id: string) => {
    const newSet = new Set(expandedModules);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedModules(newSet);
  };

  const isLessonCompleted = (lessonId: string) => {
    return userProgress?.some(p => p.lesson_id === lessonId && p.is_completed) || false;
  };

  const getModuleProgress = (module: Module) => {
    if (!userProgress || !module.lessons.length) return 0;
    const completed = module.lessons.filter(l => isLessonCompleted(l.id)).length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  const getTotalDuration = () => {
    const totalMinutes = modules.reduce((acc, mod) => 
      acc + mod.lessons.reduce((a, l) => a + (l.duration_minutes || 0), 0), 0
    );
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const getTotalLessons = () => {
    return modules.reduce((acc, mod) => acc + mod.lessons.length, 0);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-950">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-noir-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-14 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-medium text-zinc-100 truncate">{course?.name}</h1>
          </div>
        </div>
      </header>

      {/* ========== CARROSSEL DE CAPAS DOS MÓDULOS ========== */}
      <section className="py-6 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Carrossel automático - NÃO clicável */}
          <div className="relative overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
            >
              {modules.map((mod) => (
                <div 
                  key={mod.id} 
                  className="w-full flex-shrink-0 aspect-[16/9] relative"
                >
                  {mod.thumbnail ? (
                    <img
                      src={mod.thumbnail}
                      alt={mod.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-zinc-800 flex items-center justify-center">
                      <span className="text-4xl font-bold text-purple-400/50">
                        {modules.indexOf(mod) + 1}
                      </span>
                    </div>
                  )}
                  {/* Overlay com gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-noir-950/80 via-transparent to-transparent" />
                </div>
              ))}
            </div>

            {/* Indicadores */}
            {modules.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {modules.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === carouselIndex
                        ? 'w-6 bg-gold'
                        : 'w-1.5 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stats do curso */}
          <div className="flex justify-center gap-6 mt-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {modules.length} módulos
            </span>
            <span className="flex items-center gap-1">
              <PlayCircle className="w-4 h-4" />
              {getTotalLessons()} aulas
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getTotalDuration()}
            </span>
          </div>
        </div>
      </section>

      {/* ========== LISTA DE MÓDULOS ========== */}
      <main className="mx-auto max-w-4xl px-4 pb-8 space-y-3">
        {modules.map((mod, modIndex) => {
          const progress = getModuleProgress(mod);
          const isComplete = progress === 100;

          return (
            <div key={mod.id} className="overflow-hidden rounded-lg border border-zinc-800/50 bg-zinc-900/30">
              <Collapsible open={expandedModules.has(mod.id)} onOpenChange={() => toggleModule(mod.id)}>
                <CollapsibleTrigger className="w-full p-5 text-left flex items-center gap-4 hover:bg-zinc-900/50">
                  {expandedModules.has(mod.id) ? (
                    <ChevronDown className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-wider text-zinc-500">
                        Módulo {modIndex + 1}
                      </span>
                      {isComplete && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <h3 className="mt-0.5 font-medium text-zinc-100">{mod.name}</h3>
                    {progress > 0 && !isComplete && (
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={progress} className="h-1 flex-1" />
                        <span className="text-xs text-gold">{progress}%</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm tabular-nums text-zinc-400 flex-shrink-0">
                    {mod.lessons.length} aulas
                  </span>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-zinc-800/50">
                    {mod.lessons.map((lesson, i) => {
                      const completed = isLessonCompleted(lesson.id);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => hasAccess ? navigate(`/aula/${lesson.id}`) : null}
                          disabled={!hasAccess}
                          className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-zinc-900/50 border-b border-zinc-800/30 last:border-0 group ${
                            !hasAccess ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {!hasAccess ? (
                            <Lock className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                          ) : completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-zinc-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs text-zinc-500 tabular-nums">
                                {modIndex + 1}.{i + 1}
                              </span>
                              {lesson.is_bonus && (
                                <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-medium">
                                  BÔNUS
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-zinc-200 group-hover:text-zinc-100">
                              {lesson.title}
                            </p>
                          </div>
                          {lesson.duration_minutes && (
                            <span className="text-xs text-zinc-500">
                              {lesson.duration_minutes}min
                            </span>
                          )}
                          {hasAccess && (
                            <PlayCircle className="h-4 w-4 text-zinc-600 flex-shrink-0 group-hover:text-zinc-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          );
        })}

        {/* CTA para não assinantes */}
        {!hasAccess && (
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-r from-gold/10 to-purple-500/10 border border-gold/20 text-center">
            <Lock className="w-8 h-8 text-gold mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Desbloqueie este curso</h3>
            <p className="text-zinc-400 mb-4 text-sm">
              Adquira o acesso completo e comece sua transformação.
            </p>
            <Button
              onClick={() => window.open('https://pay.lojou.co/codigo-reconquista', '_blank')}
              className="bg-gold hover:bg-gold-light text-noir-950 font-bold px-6 py-2 rounded-full"
            >
              QUERO ACESSO AGORA
            </Button>
          </div>
        )}
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="mt-auto border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="mx-auto max-w-4xl px-4 py-6">
          <p className="text-center text-xs text-zinc-600">
             2025 Reconquista. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
