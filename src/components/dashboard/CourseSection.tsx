// src/components/dashboard/CourseSection.tsx

import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight } from 'lucide-react';
import { Course } from '@/types';

interface CourseSectionProps {
  course: Course;
}

export function CourseSection({ course }: CourseSectionProps) {
  const navigate = useNavigate();

  const handleModuleClick = (moduleId: string, isLocked: boolean) => {
    if (isLocked) {
      // Navegar para página de vendas
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
          {course.modules.map((module) => {
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
                  {/* Image */}
                  <img
                    src={module.image}
                    alt={module.title}
                    className={`card-module-image ${isLocked ? 'card-module-locked' : ''}`}
                  />

                  {/* Overlay */}
                  <div className="card-module-overlay" />

                  {/* Lock Icon */}
                  {isLocked && (
                    <div className="lock-overlay">
                      <Lock className="lock-icon" />
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
