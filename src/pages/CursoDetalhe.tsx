// src/pages/CursoDetalhe.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useUserDripAccess } from '@/hooks/useAdminDripContent';
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
  BookOpen,
  Calendar
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


// Links de checkout por curso
const checkoutLinks: Record<string, string> = {
  'codigo-reconquista': 'https://pay.lojou.app/p/qp5Vp',
  'deusa-na-cama': 'https://pay.lojou.app/p/pKPr7',
  'exclusivo-1-porcento': 'https://pay.lojou.app/p/qp5Vp',
};

interface Lesson {
  id: string;
  title: string;
  is_bonus: boolean;
  duration_minutes: number;
}

interface Module {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
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
  
  // Hook de drip content
  const { isModuleAccessible, isLessonAccessible } = useUserDripAccess(user?.id);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const hasAccess = accessData?.hasFullAccess || accessData?.purchasedCourses?.includes(courseSlug || '');

  // Auto-scroll do carrossel de capas dos módulos
  useEffect(() => {
    if (modules.length <= 1) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % modules.length);
    }, 4000);

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

  // Formatar data para exibição
  const formatReleaseDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  // Imagem atual do carrossel (capa do módulo)
  const currentModuleThumbnail = modules[carouselIndex]?.thumbnail;

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-noir-950">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Hero Section */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: currentModuleThumbnail
              ? `url(${currentModuleThumbnail})`
              : course?.thumbnail
                ? `url(${course.thumbnail})`
                : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/70 to-noir-950/30" />
        </div>

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10">
          <div className="px-4 md:px-8 py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Voltar</span>
            </button>
          </div>
        </header>

        {/* Course Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="max-w-4xl">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-playfair font-bold text-white mb-3">
              {course?.name}
            </h1>
            <p className="text-gray-300 text-sm md:text-base mb-4 max-w-2xl">
              {course?.description || 'Transforme sua vida com este curso exclusivo.'}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <BookOpen className="w-4 h-4 text-gold" />
                <span>{modules.length} módulos</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <PlayCircle className="w-4 h-4 text-gold" />
                <span>{getTotalLessons()} aulas</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-4 h-4 text-gold" />
                <span>{getTotalDuration()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <div className="space-y-3">
          {modules.map((mod, modIndex) => {
            const progress = getModuleProgress(mod);
            const isComplete = progress === 100;
            
            // Verificar acesso do módulo via drip
            const moduleAccess = isModuleAccessible(mod.id);
            const isModuleLocked = hasAccess && !moduleAccess.accessible;

            return (
              <div
                key={mod.id}
                className={`overflow-hidden rounded-xl border bg-noir-900/50 backdrop-blur-sm ${
                  isModuleLocked 
                    ? 'border-yellow-500/30' 
                    : 'border-white/10'
                }`}
              >
                <Collapsible 
                  open={expandedModules.has(mod.id) && !isModuleLocked} 
                  onOpenChange={() => !isModuleLocked && toggleModule(mod.id)}
                >
                  <CollapsibleTrigger 
                    className={`w-full p-4 md:p-5 text-left flex items-center gap-4 transition-colors ${
                      isModuleLocked 
                        ? 'cursor-not-allowed opacity-80' 
                        : 'hover:bg-white/5'
                    }`}
                    disabled={isModuleLocked}
                  >
                    {/* Module Thumbnail */}
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800">
                      {mod.thumbnail ? (
                        <img src={mod.thumbnail} alt={mod.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-zinc-800 flex items-center justify-center">
                          <span className="text-xl font-bold text-purple-400/50">{modIndex + 1}</span>
                        </div>
                      )}
                      
                      {/* Overlay de bloqueio no thumbnail */}
                      {isModuleLocked && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <Lock className="w-6 h-6 text-yellow-500" />
                        </div>
                      )}
                    </div>

                    {/* Module Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {isComplete && !isModuleLocked && (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        )}
                        {isModuleLocked && (
                          <Lock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                        <h3 className="font-semibold text-white text-sm md:text-base truncate">
                          {mod.name}
                        </h3>
                      </div>
                      
                      {isModuleLocked && moduleAccess.releaseDate ? (
                        <div className="flex items-center gap-1 text-yellow-500 text-xs md:text-sm">
                          <Calendar className="w-3 h-3" />
                          <span>Libera em {formatReleaseDate(moduleAccess.releaseDate)}</span>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xs md:text-sm mb-2">
                          {mod.lessons.length} aulas
                        </p>
                      )}
                      
                      {progress > 0 && !isModuleLocked && (
                        <div className="flex items-center gap-2">
                          <Progress value={progress} className="h-1.5 flex-1" />
                          <span className="text-xs text-gold font-medium">{progress}%</span>
                        </div>
                      )}
                    </div>

                    {/* Expand Icon */}
                    <div className="flex-shrink-0">
                      {isModuleLocked ? (
                        <div className="px-2 py-1 bg-yellow-500/10 rounded text-yellow-500 text-xs">
                          BLOQUEADO
                        </div>
                      ) : expandedModules.has(mod.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t border-white/5 bg-black/20">
                      {mod.lessons.map((lesson, i) => {
                        const completed = isLessonCompleted(lesson.id);
                        
                        // Verificar acesso da aula via drip
                        const lessonAccess = isLessonAccessible(lesson.id, mod.id);
                        const isLessonLocked = hasAccess && !lessonAccess.accessible;
                        
                        // Aula bloqueada se: não tem acesso OU drip não liberou
                        const cantAccess = !hasAccess || isLessonLocked;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => !cantAccess && navigate(`/aula/${lesson.id}`)}
                            disabled={cantAccess}
                            className={`w-full flex items-center gap-4 px-4 md:px-5 py-3 md:py-4 text-left border-b border-white/5 last:border-0 transition-colors ${      
                              cantAccess ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/5'
                            }`}
                          >
                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                              {!hasAccess || isLessonLocked ? (
                                <Lock className={`w-4 h-4 ${isLessonLocked ? 'text-yellow-500' : 'text-gray-500'}`} />
                              ) : completed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-500" />
                              )}
                            </div>

                            {/* Lesson Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs text-gray-500">
                                  {modIndex + 1}.{i + 1}
                                </span>
                                {lesson.is_bonus && (
                                  <span className="text-[10px] bg-gold/20 text-gold px-1.5 py-0.5 rounded font-medium">
                                    BÔNUS
                                  </span>
                                )}
                                {isLessonLocked && lessonAccess.releaseDate && (
                                  <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatReleaseDate(lessonAccess.releaseDate)}
                                  </span>
                                )}
                              </div>
                              <p className={`text-sm ${completed ? 'text-gray-400' : 'text-white'}`}>
                                {lesson.title}
                              </p>
                            </div>

                            {/* Duration */}
                            {lesson.duration_minutes && (
                              <span className="text-xs text-gray-500 flex-shrink-0">
                                {lesson.duration_minutes}min
                              </span>
                            )}

                            {/* Play Icon */}
                            {!cantAccess && (
                              <PlayCircle className="w-4 h-4 text-gray-500 flex-shrink-0" />
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
        </div>

        {/* CTA para não assinantes */}
        {!hasAccess && (
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-gold/20 to-purple-500/20 border border-gold/30 text-center">
            <Lock className="w-10 h-10 text-gold mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">
              Desbloqueie este curso
            </h3>
            <p className="text-gray-300 mb-4 text-sm">
              Adquira o acesso completo e comece sua transformação hoje.
            </p>
            <Button
              onClick={() => window.open(checkoutLinks[courseSlug || ''] || 'https://pay.lojou.app/p/qp5Vp', '_blank')}
              className="bg-gold hover:bg-gold-light text-noir-950 font-bold px-8 py-3 rounded-full"
            >
              QUERO ACESSO AGORA
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-noir-900/30">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-xs text-gray-500">
            © 2025 Reconquista. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}