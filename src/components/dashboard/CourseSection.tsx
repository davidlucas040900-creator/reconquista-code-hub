// src/components/dashboard/CourseSection.tsx

import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock, Play } from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import type { CourseWithModules, ModuleWithLessons } from '@/hooks/useCourses';

interface CourseSectionProps {
  course: CourseWithModules;
  activeTopicFilter: string;
}

// Descrições dos cursos
const courseDescriptions: Record<string, string> = {
  'codigo-reconquista': 'A tua jornada passo a passo para o trazer de volta.',
  'deusa-na-cama': 'Torna-te irresistível e faz ele implorar por mais.',
  'santuario': 'O círculo exclusivo das mulheres que dominam o jogo.',
};

// Descrições resumidas dos módulos do Santuário (por slug)
const santuarioModuleDescriptions: Record<string, string> = {
  'poder-onisciencia': 'Detecta mentiras e nunca mais seja enganada.',
  'campo-batalha-digital': 'Aprenda a fazer posts estratégicos que ativam ciúmes e desejo.',
  'acesso-cerebro': 'Respostas que desarmam qualquer ego masculino.',
  'blacklist-masculina': 'Neutraliza homens perigosos antes que magoem.',
  'protocolo-emergencia': 'Áudios de emergência para momentos críticos',
  'diario-deusa': 'Áudios contra momentos de fraqueza.',
  'mentorias-lives': 'Descubra as estratégias exatas usadas para reverterem as situações mais difíceis.',
};

export function CourseSection({ course, activeTopicFilter }: CourseSectionProps) {
  const navigate = useNavigate();
  const { data: userProgress } = useUserProgress();
  const { data: accessData } = useUserAccess();
  const { getProgress, getLastLesson } = useVideoProgress();

  const hasAccess = accessData?.hasFullAccess || accessData?.purchasedCourses?.includes(course.slug);
  const isSantuario = course.slug === 'santuario';

  // Filtrar módulos por tópico
  const filteredModules = activeTopicFilter === 'all'
    ? course.course_modules || []
    : (course.course_modules || []).filter(module => 
        (module as any).topics?.includes(activeTopicFilter)
      );

  if (!filteredModules.length) {
    return null;
  }

  // Calcular progresso por módulo
  const getModuleProgress = (module: ModuleWithLessons) => {
    if (!userProgress || !module.course_lessons?.length) return 0;

    const lessonIds = module.course_lessons.map(l => l.id);
    const completed = userProgress.filter(
      p => lessonIds.includes(p.lesson_id) && p.is_completed
    ).length;

    return Math.round((completed / module.course_lessons.length) * 100);
  };

  // Encontrar última aula assistida do módulo
  const getLastWatchedLesson = (module: ModuleWithLessons) => {
    const lessons = module.course_lessons || [];
    for (const lesson of lessons) {
      const progress = getProgress(lesson.id);
      if (progress && progress.percentage > 0 && progress.percentage < 100) {
        return lesson;
      }
    }
    // Se nenhuma em progresso, retorna a primeira não completada
    for (const lesson of lessons) {
      const progressData = userProgress?.find(p => p.lesson_id === lesson.id);
      if (!progressData?.is_completed) {
        return lesson;
      }
    }
    return lessons[0];
  };

  const handleModuleClick = (module: ModuleWithLessons) => {
    if (!hasAccess) {
      window.open('https://pay.lojou.co/codigo-reconquista', '_blank');
      return;
    }

    const targetLesson = getLastWatchedLesson(module);
    if (targetLesson) {
      navigate(`/aula/${targetLesson.id}`);
    }
  };

  return (
    <section className="px-4 py-6 md:px-8 md:py-8">
      {/* Header do Curso */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-playfair font-bold text-white">
            {course.name}
          </h2>
          <button
            onClick={() => navigate(`/curso/${course.slug}`)}
            className="flex items-center gap-1 text-gold hover:text-gold-light transition-colors text-sm font-medium"
          >
            Ver todos
            <ChevronRight className="w-4 w-4" />
          </button>
        </div>
        <p className="text-gray-400 text-sm md:text-base">
          {courseDescriptions[course.slug] || course.description}
        </p>
      </div>

      {/* Slider de Módulos */}
      <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {filteredModules.map((module) => {
          const progress = getModuleProgress(module);
          const isCompleted = progress === 100;
          const moduleDescription = isSantuario ? santuarioModuleDescriptions[module.slug] : null;

          return (
            <div
              key={module.id}
              className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] group"
            >
              {/* Thumbnail - Clicável */}
              <div
                onClick={() => handleModuleClick(module)}
                className="relative aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden bg-zinc-800 shadow-lg cursor-pointer"
              >
                {/* Imagem */}
                {module.thumbnail ? (
                  <img
                    src={module.thumbnail}
                    alt={module.name}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      hasAccess 
                        ? 'group-hover:scale-110' 
                        : 'opacity-30 grayscale-0'
                    }`}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br from-purple-900/60 to-noir-900 ${
                    !hasAccess ? 'opacity-30' : ''
                  }`} />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {!hasAccess && (
                  <div className="absolute bottom-3 right-3">
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20">
                      <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 text-white/80" />
                    </div>
                  </div>
                )}

                {hasAccess && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-xl shadow-gold/30">
                      <Play className="w-5 h-5 md:w-6 md:h-6 text-noir-950 fill-current ml-0.5" />
                    </div>
                  </div>
                )}

                {hasAccess && progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1">
                    <div
                      className={`h-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-gold'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Descrição - APENAS para módulos do Santuário */}
              {moduleDescription && (
                <p className="mt-2 text-xs text-silk-400 leading-tight px-1">
                  {moduleDescription}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
