import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Check, Circle, Lock } from 'lucide-react';

interface Module {
  id: string;
  number: number;
  name: string;
  lessons: Lesson[];
  progress: number;
}

interface Lesson {
  id: string;
  number: number;
  title: string;
  duration?: number;
  is_completed: boolean;
  is_locked: boolean;
}

export default function CourseView() {
  const { courseSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && courseSlug) {
      loadCourse();
    }
  }, [user, courseSlug]);

  const loadCourse = async () => {
    try {
      // Mock data (conectar com banco real depois)
      setCourse({
        name: 'Código da Reconquista',
        description: 'Aprende as estratégias poderosas para reconquistar e dominar relacionamentos',
      });

      setModules([
        {
          id: '1',
          number: 1,
          name: 'Fundamentos da Reconquista',
          progress: 60,
          lessons: [
            { id: '1', number: 1, title: 'Introdução ao Código', duration: 10, is_completed: true, is_locked: false },
            { id: '2', number: 2, title: 'Mindset de Poder', duration: 15, is_completed: true, is_locked: false },
            { id: '3', number: 3, title: 'A Psicologia Masculina', duration: 20, is_completed: false, is_locked: false },
          ],
        },
        {
          id: '2',
          number: 2,
          name: 'Técnicas Avançadas',
          progress: 0,
          lessons: [
            { id: '4', number: 1, title: 'O Silêncio Estratégico', duration: 18, is_completed: false, is_locked: false },
            { id: '5', number: 2, title: 'Comunicação de Alto Valor', duration: 22, is_completed: false, is_locked: false },
          ],
        },
      ]);

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.is_locked) return;
    navigate(`/cursos/${courseSlug}/aula/${lesson.id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter(l => l.is_completed).length,
    0
  );
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Course Header */}
        <div className="mb-12">
          <h1 className="mb-2 text-3xl font-semibold text-foreground">
            {course?.name}
          </h1>
          <p className="text-muted-foreground">
            {course?.description}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span>{modules.length} módulos</span>
            <span>{totalLessons} aulas</span>
            <span>{completedLessons} concluídas</span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Progresso Geral</span>
              <span className="text-muted-foreground">
                {Math.round(overallProgress)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </div>
        </div>

        {/* Modules */}
        <div className="space-y-6">
          {modules.map((module) => (
            <Card key={module.id} className="border-border p-6">
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between">
                  <h2 className="text-lg font-medium text-foreground">
                    Módulo {module.number}: {module.name}
                  </h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{module.lessons.length} aulas</span>
                  <span>
                    {module.lessons.filter(l => l.is_completed).length} concluídas
                  </span>
                </div>
                {module.progress > 0 && (
                  <Progress value={module.progress} className="mt-3 h-1" />
                )}
              </div>

              {/* Lessons */}
              <div className="space-y-2">
                {module.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => handleLessonClick(lesson)}
                    className={`group flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      lesson.is_locked
                        ? 'cursor-not-allowed border-transparent bg-muted/50'
                        : 'border-transparent hover:border-border hover:bg-accent'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${
                      lesson.is_completed
                        ? 'border-foreground bg-foreground'
                        : lesson.is_locked
                        ? 'border-muted-foreground/30'
                        : 'border-border'
                    }`}>
                      {lesson.is_locked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : lesson.is_completed ? (
                        <Check className="h-4 w-4 text-background" />
                      ) : (
                        <Play className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className={`text-sm font-medium ${
                        lesson.is_locked
                          ? 'text-muted-foreground'
                          : 'text-foreground'
                      }`}>
                        {lesson.title}
                      </div>
                      {lesson.duration && (
                        <div className="text-xs text-muted-foreground">
                          {lesson.duration} min
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}