// src/components/dashboard/CourseSection.tsx

import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock, Play, CheckCircle } from 'lucide-react';
import { useUserProgress } from '@/hooks/useUserProgress';
import type { CourseWithModules, ModuleWithLessons } from '@/hooks/useCourses';

interface CourseSectionProps {
  course: CourseWithModules;
  activeTopicFilter: string;
}

export function CourseSection({ course, activeTopicFilter }: CourseSectionProps) {
  const navigate = useNavigate();
  const { data: userProgress } = useUserProgress();

  // Calcular progresso por módulo
  const getModuleProgress = (module: ModuleWithLessons) => {
    if (!userProgress || !module.course_lessons?.length) return 0;
    
    const lessonIds = module.course_lessons.map(l => l.id);
    const completed = userProgress.filter(
      p => lessonIds.includes(p.lesson_id) && p.is_completed
    ).length;
    
    return Math.round((completed / module.course_lessons.length) * 100);
  };

  // Filtrar módulos (por enquanto mostra todos)
  const filteredModules = course.course_modules || [];

  if (!filteredModules.length) {
    return null;
  }

  return (
    <section className="px-4 py-6 md:px-8">
      {/* Header do Curso */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {course.name}
          </h2>
          <span className="text-sm text-gray-400">
            {filteredModules.length} módulos
          </span>
        </div>
        <button 
          onClick={() => navigate(`/curso/${course.slug}`)}
          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors text-sm"
        >
          Ver todos
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll Horizontal de Módulos */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {filteredModules.map((module, index) => {
          const progress = getModuleProgress(module);
          const isCompleted = progress === 100;
          const firstLesson = module.course_lessons?.[0];

          return (
            <div
              key={module.id}
              onClick={() => firstLesson && navigate(`/aula/${firstLesson.id}`)}
              className="flex-shrink-0 w-[280px] md:w-[320px] group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-zinc-800">
                {module.thumbnail ? (
                  <img 
                    src={module.thumbnail} 
                    alt={module.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-zinc-800 flex items-center justify-center">
                    <span className="text-4xl font-bold text-purple-400/50">
                      {index + 1}
                    </span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-black fill-current ml-1" />
                  </div>
                </div>

                {/* Progress Bar */}
                {progress > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <div 
                      className={`h-full transition-all ${isCompleted ? 'bg-green-500' : 'bg-purple-500'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}

                {/* Badge */}
                {isCompleted && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completo
                  </div>
                )}
              </div>

              {/* Info */}
              <div>
                <h3 className="text-white font-semibold text-sm md:text-base line-clamp-1 group-hover:text-purple-400 transition-colors">
                  {module.name}
                </h3>
                <p className="text-gray-400 text-xs mt-1">
                  {module.course_lessons?.length || 0} aulas
                  {progress > 0 && progress < 100 && (
                    <span className="text-purple-400 ml-2"> {progress}% concluído</span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
