// src/pages/CursoDetalhe.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronDown, 
  ChevronRight, 
  PlayCircle, 
  CheckCircle2,
  Circle,
  Loader2 
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface Course {
  id: string;
  name: string;
  description: string | null;
}

interface Module {
  id: string;
  name: string;
  order_index: number;
  lessons: Lesson[];
  completedCount: number;
}

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number | null;
  is_bonus: boolean;
  is_completed: boolean;
  order_index: number;
}

export default function CursoDetalhe() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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
    if (!user) return;

    // Buscar curso
    const { data: courseData } = await supabase
      .from('courses')
      .select('id, name, description')
      .eq('slug', courseSlug)
      .eq('is_active', true)
      .single();

    if (!courseData) {
      navigate('/cursos');
      return;
    }

    setCourse(courseData);

    // Buscar módulos
    const { data: modulesData } = await supabase
      .from('course_modules')
      .select('id, name, order_index')
      .eq('course_id', courseData.id)
      .eq('is_active', true)
      .order('order_index');

    if (modulesData) {
      // Para cada módulo, buscar aulas e progresso
      const modulesWithLessons = await Promise.all(
        modulesData.map(async (mod) => {
          const { data: lessonsData } = await supabase
            .from('course_lessons')
            .select('id, title, duration_minutes, is_bonus, order_index')
            .eq('module_id', mod.id)
            .eq('is_active', true)
            .order('order_index');

          // Buscar progresso do usuário
          const lessonIds = lessonsData?.map(l => l.id) || [];
          const { data: progressData } = await supabase
            .from('user_lesson_progress')
            .select('lesson_id, is_completed')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds);

          const progressMap = new Map(
            (progressData || []).map(p => [p.lesson_id, p.is_completed])
          );

          const lessons = (lessonsData || []).map(lesson => ({
            ...lesson,
            is_completed: progressMap.get(lesson.id) || false,
          }));

          const completedCount = lessons.filter(l => l.is_completed).length;

          return {
            ...mod,
            lessons,
            completedCount,
          };
        })
      );

      setModules(modulesWithLessons);

      // Expandir primeiro módulo
      if (modulesWithLessons.length > 0) {
        setExpandedModules(new Set([modulesWithLessons[0].id]));
      }
    }

    setLoading(false);
  };

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.completedCount, 0);
  const overallProgress = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4">
          <div className="flex h-14 items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground truncate">
              {course?.name}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6">
          {/* Course Info */}
          {course?.description && (
            <p className="text-muted-foreground">{course.description}</p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">
              {modules.length} módulos
            </span>
            <span className="text-muted-foreground">
              {totalLessons} aulas
            </span>
            <span className="text-muted-foreground">
              {completedLessons} concluídas
            </span>
          </div>

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className="text-muted-foreground">Progresso do curso</span>
              <span className="font-medium text-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>

          {/* Modules */}
          <div className="space-y-3">
            {modules.map((mod, modIndex) => {
              const moduleProgress = mod.lessons.length > 0
                ? Math.round((mod.completedCount / mod.lessons.length) * 100)
                : 0;

              return (
                <Card key={mod.id} className="overflow-hidden">
                  <Collapsible
                    open={expandedModules.has(mod.id)}
                    onOpenChange={() => toggleModule(mod.id)}
                  >
                    <CollapsibleTrigger className="w-full p-4 text-left">
                      <div className="flex items-center gap-3">
                        {expandedModules.has(mod.id) ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              Módulo {modIndex + 1}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • {mod.lessons.length} aulas
                            </span>
                          </div>
                          <h3 className="font-medium text-foreground">{mod.name}</h3>
                        </div>

                        <span className="text-sm text-muted-foreground flex-shrink-0">
                          {moduleProgress}%
                        </span>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="border-t border-border">
                        {mod.lessons.map((lesson, lessonIndex) => (
                          <button
                            key={lesson.id}
                            onClick={() => navigate(`/aula/${lesson.id}`)}
                            className="w-full flex items-center gap-3 p-4 text-left hover:bg-accent/50 transition-colors border-b border-border last:border-0"
                          >
                            {lesson.is_completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {modIndex + 1}.{lessonIndex + 1}
                                </span>
                                {lesson.is_bonus && (
                                  <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded">
                                    Bônus
                                  </span>
                                )}
                              </div>
                              <p className="font-medium text-foreground truncate">
                                {lesson.title}
                              </p>
                            </div>

                            {lesson.duration_minutes && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {lesson.duration_minutes} min
                              </span>
                            )}

                            <PlayCircle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
