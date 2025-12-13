// src/components/dashboard/ProgressSection.tsx

import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { User, Course } from '@/types';
import { getCourseProgress, getWelcomeMessage } from '@/data/mockData';

interface ProgressSectionProps {
  user: User;
  courses: Course[];
}

export function ProgressSection({ user, courses }: ProgressSectionProps) {
  const navigate = useNavigate();
  const purchasedCourses = courses.filter(c => c.isPurchased);
  const primaryCourse = purchasedCourses[0];

  const handleContinue = () => {
    if (user.lastLesson) {
      navigate(`/aula/${user.lastLesson.lessonId}`);
    } else if (primaryCourse) {
      navigate(`/curso/${primaryCourse.slug}`);
    }
  };

  if (purchasedCourses.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="glass-card p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Welcome Message */}
            <div className="flex-1">
              <p className="text-gold text-sm font-medium tracking-wider uppercase mb-2">
                 Olá, {user.name}
              </p>
              <p className="text-body text-lg mb-6">
                {primaryCourse && getWelcomeMessage(primaryCourse.slug)}
              </p>

              {/* Continue Button */}
              {user.lastLesson && (
                <button
                  onClick={handleContinue}
                  className="btn-gold group"
                >
                  <Play className="w-4 h-4" />
                  <span>Continuar: {user.lastLesson.title}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>

            {/* Progress Bars */}
            <div className="lg:w-80 space-y-4">
              {purchasedCourses.map((course) => {
                const progress = getCourseProgress(course.slug);
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
