// src/components/dashboard/CourseSection.tsx

import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock, Play, Calendar, Clock } from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { useUserDripAccess } from '@/hooks/useAdminDripContent';
import { useAuth } from '@/contexts/AuthContext';
import type { CourseWithModules, ModuleWithLessons } from '@/hooks/useCourses';

interface CourseSectionProps {
  course: CourseWithModules;
  activeTopicFilter: string;
}

// Links de checkout por curso
const checkoutLinks: Record<string, string> = {
  'codigo-reconquista': 'https://pay.lojou.app/p/HJo0Q',
  'deusa-na-cama': 'https://pay.lojou.app/p/pKPr7',
  'exclusivo-1-porcento': 'https://pay.lojou.app/p/qp5Vp',
};

// Descrições dos cursos
const courseDescriptions: Record<string, string> = {
  'codigo-reconquista': 'A tua jornada passo a passo para o trazer de volta.',
  'deusa-na-cama': 'Torna-te irresistível e faz ele implorar por mais.',
  'santuario': 'O círculo exclusivo das mulheres que dominam o jogo.',
};

// Descrições resumidas dos módulos do Santuário (por slug)
const santuarioModuleDescriptions: Record<string, string> = {
  'poder-onisciencia': 'Detecta mentiras e nunca mais seja enganada.',
  'campo-batalha-digital': 'Posts estratégicos que ativam ciúmes e desejo.',
  'acesso-cerebro': 'Respostas que desarmam qualquer ego masculino.',
  'blacklist-masculina': 'Neutraliza homens perigosos e poupe anos de sofrimento',
  'protocolo-emergencia': 'Áudios de emergência para momentos críticos',
  'diario-deusa': 'Áudios contra momentos de fraqueza.',
  'mentorias-lives': 'Acelere seus resultados 10x mais rápido',
};

export function CourseSection({ course, activeTopicFilter }: CourseSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProgress } = useUserProgress();
  const { data: accessData } = useUserAccess();
  const { getProgress, getLastLesson } = useVideoProgress();
  
  // ✅ ADICIONAR: Hook de Drip Content
  const { isModuleAccessible } = useUserDripAccess(user?.id);

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
    // ✅ ADICIONAR: Verificação de drip
    const moduleAccess = isModuleAccessible(module.id);
    
    if (!hasAccess) {
      // Não tem acesso ao curso - redireciona para checkout
      window.open(checkoutLinks[course.slug] || 'https://pay.lojou.app/p/qp5Vp', '_blank');
      return;
    }
    
    if (!moduleAccess.accessible) {
      // Tem acesso ao curso mas módulo está bloqueado por drip - vai para página do curso
      navigate(`/curso/${course.slug}`);
      return;
    }

    // Módulo acessível - vai para aula
    const targetLesson = getLastWatchedLesson(module);
    if (targetLesson) {
      navigate(`/aula/${targetLesson.id}`);
    }
  };

  // Formatar data de liberação
  const formatReleaseDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).replace('.', '');
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
            <ChevronRight className="w-4 h-4" />
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
          
          // ✅ ADICIONAR: Verificação de drip para cada módulo
          const moduleAccess = isModuleAccessible(module.id);
          const isModuleLocked = hasAccess && !moduleAccess.accessible;

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
                      hasAccess && !isModuleLocked
                        ? 'group-hover:scale-110'
                        : 'opacity-30 grayscale'
                    }`}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br from-purple-900/60 to-noir-900 ${
                    !hasAccess || isModuleLocked ? 'opacity-30' : ''
                  }`} />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* ✅ MODIFICAR: Ícones de bloqueio */}
                {(!hasAccess || isModuleLocked) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/80 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 mb-2">
                      {isModuleLocked ? (
                        <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
                      ) : (
                        <Lock className="w-5 h-5 md:w-6 md:h-6 text-white/80" />
                      )}
                    </div>
                    {isModuleLocked && moduleAccess.releaseDate && (
                      <div className="px-2 py-1 bg-yellow-500/20 rounded-full backdrop-blur-sm">
                        <span className="text-xs text-yellow-300 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatReleaseDate(moduleAccess.releaseDate)}
                        </span>
                      </div>
                    )}
                    {!hasAccess && (
                      <span className="text-xs text-white/60 font-medium">
                        BLOQUEADO
                      </span>
                    )}
                  </div>
                )}

                {/* Play button - só mostra se tiver acesso total */}
                {hasAccess && !isModuleLocked && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gold/90 flex items-center justify-center shadow-xl shadow-gold/30">
                      <Play className="w-5 h-5 md:w-6 md:h-6 text-noir-950 fill-current ml-0.5" />
                    </div>
                  </div>
                )}

                {/* Progress bar - só mostra se tiver acesso e não estiver bloqueado */}
                {hasAccess && !isModuleLocked && progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1">
                    <div
                      className={`h-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-gold'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Nome do módulo - sempre visível */}
              <h3 className="mt-2 text-sm font-medium text-white px-1 line-clamp-2">
                {module.name}
              </h3>

              {/* Descrição - APENAS para módulos do Santuário */}
              {moduleDescription && (
                <p className="mt-1 text-xs text-gray-400 leading-tight px-1 line-clamp-2">
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