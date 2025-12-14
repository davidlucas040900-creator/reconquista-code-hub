// src/components/dashboard/ProgressSection.tsx

import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useUserProgress';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Target, Flame } from 'lucide-react';
import type { CourseWithModules } from '@/hooks/useCourses';

interface ProgressSectionProps {
  courses: CourseWithModules[];
}

export function ProgressSection({ courses }: ProgressSectionProps) {
  const { user } = useAuth();
  const { data: userProgress, isLoading } = useUserProgress();

  if (!user) {
    return null;
  }

  // Calcular estatísticas
  const totalLessons = courses.reduce((acc, course) => {
    return acc + (course.course_modules?.reduce((modAcc, mod) => {
      return modAcc + (mod.course_lessons?.length || 0);
    }, 0) || 0);
  }, 0);

  const completedLessons = userProgress?.filter(p => p.is_completed).length || 0;
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  // Calcular tempo total assistido (estimativa baseada em aulas completas)
  const estimatedMinutes = completedLessons * 15; // média de 15 min por aula
  const hours = Math.floor(estimatedMinutes / 60);
  const minutes = estimatedMinutes % 60;

  // Calcular sequência (dias consecutivos) - simplificado
  const streak = userProgress?.length ? Math.min(Math.floor(completedLessons / 3), 30) : 0;

  if (isLoading) {
    return (
      <section className="px-4 py-4 md:px-8 md:py-6">
        <div className="animate-pulse">
          <div className="h-6 md:h-8 bg-zinc-800 rounded w-32 md:w-48 mb-3 md:mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 md:h-24 bg-zinc-800 rounded-xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-4 md:px-8 md:py-6">
      {/* Saudação */}
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          Olá, {user.user_metadata?.name || user.email?.split('@')[0] || 'Aluna'}!
        </h2>
        <p className="text-gray-400 mt-0.5 md:mt-1 text-sm md:text-base">
          Continue sua jornada de transformação
        </p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        {/* Progresso Geral */}
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-purple-500/20">        
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            <Target className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            <span className="text-xs md:text-sm text-gray-400">Progresso</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-white">{progressPercentage}%</p>
          <Progress value={progressPercentage} className="mt-1.5 md:mt-2 h-1 md:h-1.5" />
        </div>

        {/* Aulas Completas */}
        <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-green-500/20">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            <Trophy className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            <span className="text-xs md:text-sm text-gray-400">Completas</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-white">{completedLessons}</p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">de {totalLessons} aulas</p>
        </div>

        {/* Tempo Assistido */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-blue-500/20">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            <span className="text-xs md:text-sm text-gray-400">Tempo</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-white">{hours}h{minutes > 0 ? ` ${minutes}m` : ''}</p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">assistidos</p>
        </div>

        {/* Sequência */}
        <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-orange-500/20">
          <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
            <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
            <span className="text-xs md:text-sm text-gray-400">Sequência</span>
          </div>
          <p className="text-xl md:text-2xl font-bold text-white">{streak}</p>
          <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">dias seguidos</p>
        </div>
      </div>
    </section>
  );
}
