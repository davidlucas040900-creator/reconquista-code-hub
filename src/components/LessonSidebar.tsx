import { useNavigate, useParams } from 'react-router-dom';
import { getModuleLessons } from '@/data/lessons';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, Play, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface LessonSidebarProps {
  moduleNumber: number;
}

export function LessonSidebar({ moduleNumber }: LessonSidebarProps) {
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useAuth();
  const currentLessonId = parseInt(params.lessonId || '0');

  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const lessons = getModuleLessons(moduleNumber);

  // Carregar aulas completadas
  useEffect(() => {
    const fetchCompleted = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('user_lessons')
        .select('lesson_id, is_completed, module_id')
        .eq('user_id', user.id)
        .eq('module_id', moduleNumber)
        .eq('is_completed', true);

      if (data) {
        const completed = data.map((d) => d.lesson_id);
        setCompletedLessons(completed);
      }
    };

    fetchCompleted();
  }, [user, currentLessonId]);

  const moduleData = {
    1: { title: 'Reset Emocional', total: 8 },
    2: { title: 'Mapa da Mente Masculina', total: 8 },
    3: { title: 'Gatilhos da Memória Emocional', total: 4 },
    4: { title: 'A Frase de 5 Palavras', total: 4 },
    5: { title: 'Primeiro Contato Estratégico', total: 3 },
    6: { title: 'Domínio da Conversa', total: 6 },
    7: { title: 'Conquista Duradoura', total: 6 },
  };

  const currentModule = moduleData[moduleNumber as keyof typeof moduleData];
  const completedCount = lessons.filter((l) => completedLessons.includes(l.lesson)).length;
  const progressPercentage = Math.round((completedCount / lessons.length) * 100);

  return (
    <Card className="sticky top-24 border-border bg-card p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="mb-2 text-lg font-bold text-foreground">
          Módulo {moduleNumber}: {currentModule.title}
        </h3>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Progresso</span>
            <span className="font-semibold text-foreground">{progressPercentage}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {completedCount} de {lessons.length} aulas concluídas
        </p>
      </div>

      {/* Lista de Aulas */}
      <div className="scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent max-h-[600px] space-y-2 overflow-y-auto pr-2">
        {lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.lesson);
          const isCurrent = lesson.lesson === currentLessonId;

          return (
            <button
              key={lesson.lesson}
              onClick={() => navigate(`/modulo/${moduleNumber}/aula/${lesson.lesson}`)}
              className={`w-full rounded-lg p-3 text-left transition-all duration-200 ${
                isCurrent
                  ? 'border-2 border-primary bg-primary/20 shadow-lg'
                  : 'border-2 border-transparent bg-background hover:bg-muted'
              } ${isCompleted && !isCurrent ? 'opacity-70' : ''} `}
            >
              <div className="flex items-start gap-3">
                {/* Ícone de Status */}
                <div className="mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : isCurrent ? (
                    <Play className="h-5 w-5 text-primary" fill="currentColor" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      Aula {index + 1}
                    </span>
                    {lesson.isBonus && (
                      <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-400">
                        BÓNUS
                      </span>
                    )}
                  </div>
                  <p
                    className={`line-clamp-2 text-sm font-medium ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {lesson.title}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
