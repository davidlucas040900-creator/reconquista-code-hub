// src/components/dashboard/CourseSection.tsx

import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight } from 'lucide-react';
import { CourseWithModules } from '@/hooks/useCourses';
import { LessonProgress } from '@/hooks/useUserProgress';
import { useHasCourseAccess } from '@/hooks/useUserPurchases';

interface CourseSectionProps {
  course: CourseWithModules;
  userProgress: LessonProgress[];
}

export function CourseSection({ course, userProgress }: CourseSectionProps) {
  const navigate = useNavigate();
  const hasAccess = useHasCourseAccess(course.slug);

  const handleModuleClick = (moduleId: string) => {
    if (!hasAccess) {
      // Navegar para página de vendas
      window.open(`/vendas/${course.slug}`, '_blank');
    } else {
      navigate(`/curso/${course.slug}?module=${moduleId}`);
    }
  };

  // Calcular progresso de cada módulo
  const getModuleProgress = (moduleId: string) => {
    const module = course.modules?.find(m => m.id === moduleId);
    if (!module || !module.lessons) return 0;

    const totalLessons = module.lessons.length;
    if (totalLessons === 0) return 0;

    const completedLessons = module.lessons.filter(lesson =>
      userProgress.find(p => p.lesson_id === lesson.id && p.is_completed)
    ).length;

    return Math.round((completedLessons / totalLessons) * 100);
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="heading-section">{course.name}</h2>
            <p className="text-body mt-1">{course.description}</p>
          </div>
          
          {hasAccess && (
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
          {course.modules?.map((module) => {
            const isLocked = !hasAccess;
            const progress = getModuleProgress(module.id);

            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className="scroll-item w-40 md:w-48"
              >
                <div className="card-module">
                  {/* Image */}
                  <img
                    src={module.thumbnail || 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80'}
                    alt={module.name}
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
                        className="h-full bg-gold transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* Module Title (hover) */}
                  <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-sm font-semibold line-clamp-2">
                      {module.name}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
