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
        .select('lesson_id, is_completed')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      if (data) {
        const completed = data.map(d => d.lesson_id);
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
  const completedCount = lessons.filter(l => completedLessons.includes(l.lesson)).length;
  const progressPercentage = Math.round((completedCount / lessons.length) * 100);

  return (
    <Card className="bg-card border-border p-6 sticky top-24">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-foreground mb-2">
          Módulo {moduleNumber}: {currentModule.title}
        </h3>
        
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progresso</span>
            <span className="font-semibold text-foreground">{progressPercentage}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
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
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.lesson);
          const isCurrent = lesson.lesson === currentLessonId;

          return (
            <button
              key={lesson.lesson}
              onClick={() => navigate(`/modulo/${moduleNumber}/aula/${lesson.lesson}`)}
              className={`
                w-full text-left p-3 rounded-lg transition-all duration-200
                ${isCurrent 
                  ? 'bg-primary/20 border-2 border-primary shadow-lg' 
                  : 'bg-background hover:bg-muted border-2 border-transparent'
                }
                ${isCompleted && !isCurrent ? 'opacity-70' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Ícone de Status */}
                <div className="flex-shrink-0 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : isCurrent ? (
                    <Play className="w-5 h-5 text-primary" fill="currentColor" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                      Aula {index + 1}
                    </span>
                    {lesson.isBonus && (
                      <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded">
                        BÓNUS
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-medium line-clamp-2 ${isCurrent ? 'text-foreground' : 'text-muted-foreground'}`}>
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
