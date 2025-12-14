import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { useUserCourseProgress } from '@/hooks/useUserProgress';
import { CourseWithModules } from '@/hooks/useCourses';
import { LessonProgress } from '@/hooks/useUserProgress';

interface ProgressSectionProps {
  user: any;
  courses: CourseWithModules[];
  userProgress: LessonProgress[];
}

export function ProgressSection({ user, courses, userProgress }: ProgressSectionProps) {
  const navigate = useNavigate();

  // Buscar último progresso
  const lastProgress = userProgress
    ?.sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime())[0];

  const handleContinue = () => {
    if (lastProgress) {
      navigate(`/aula/${lastProgress.lesson_id}`);
    } else if (courses.length > 0) {
      navigate(`/curso/${courses[0].slug}`);
    }
  };

  if (!user || courses.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Welcome Message */}
            <div className="flex-1">
              <p className="text-gold text-sm font-medium tracking-wider uppercase mb-2">
                 Olá, {user.email?.split('@')[0]}
              </p>
              <p className="text-body text-lg mb-6">
                Bem-vinda à tua jornada de transformação.
              </p>

              {/* Continue Button */}
              {lastProgress && (
                <button
                  onClick={handleContinue}
                  className="btn-gold group"
                >
                  <Play className="w-4 h-4" />
                  <span>Continuar onde parou</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Progress Bars */}
            <div className="lg:w-80 space-y-4">
              {courses.slice(0, 3).map((course) => {
                const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
                const completedLessons = userProgress.filter(p => 
                  p.is_completed && 
                  course.modules?.some(m => m.lessons?.some(l => l.id === p.lesson_id))
                ).length;
                const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

                return (
                  <div key={course.id}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-silk-300 truncate pr-4">
                        {course.name}
                      </span>
                      <span className="text-sm text-gold font-medium">
                        {progress}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
