// src/components/dashboard/CourseSection.tsx

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight } from 'lucide-react';
import { Course } from '@/types';

interface CourseSectionProps {
  course: Course;
  activeTopicFilter: string;
}

export function CourseSection({ course, activeTopicFilter }: CourseSectionProps) {
  const navigate = useNavigate();

  // Filtrar MÓDULOS pelo tópico selecionado
  const filteredModules = useMemo(() => {
    if (activeTopicFilter === 'all') {
      return course.modules;
    }
    // Filtra módulos que pertencem ao tópico do curso
    // Se o curso tem o tópico selecionado, mostra todos os módulos
    // Senão, não mostra nenhum módulo
    if (course.topics.includes(activeTopicFilter)) {
      return course.modules;
    }
    return [];
  }, [course, activeTopicFilter]);

  // Se não há módulos para mostrar, não renderiza a seção
  if (filteredModules.length === 0) {
    return null;
  }

  const handleModuleClick = (moduleId: string, isLocked: boolean) => {
    if (isLocked) {
      window.open(`/vendas/${course.slug}`, '_blank');
    } else {
      navigate(`/curso/${course.slug}?module=${moduleId}`);
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="heading-section">{course.name}</h2>
            <p className="text-body mt-1">{course.tagline}</p>
          </div>
          
          {course.isPurchased && (
            <button
              onClick={() => navigate(`/curso/${course.slug}`)}
              className="btn-ghost hidden md:flex items-center gap-2"
            >
              <span>Ver Tudo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modules Slider */}
        <div className="scroll-container">
          {filteredModules.map((module) => {
            const isLocked = !course.isPurchased || module.isLocked;
            const progress = module.lessonsCount > 0
              ? (module.completedLessons / module.lessonsCount) * 100
              : 0;

            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id, isLocked)}
                className="scroll-item w-40 md:w-48"
              >
                <div className="card-module">
                  {/* Image - SEM BLUR, apenas opacidade reduzida se bloqueado */}
                  <img
                    src={module.image}
                    alt={module.title}
                    className={`card-module-image ${isLocked ? 'opacity-60' : ''}`}
                  />

                  {/* Overlay gradiente */}
                  <div className="card-module-overlay" />

                  {/* Cadeado pequeno no canto inferior direito */}
                  {isLocked && (
                    <div className="absolute bottom-3 right-3 z-10">
                      <div className="w-7 h-7 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center border border-gold/30">
                        <Lock className="w-3.5 h-3.5 text-gold" />
                      </div>
                    </div>
                  )}

                  {/* Progress Indicator */}
                  {!isLocked && progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div
                        className="h-full bg-gold"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
