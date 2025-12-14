// src/components/dashboard/HeroCarousel.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { CourseWithModules } from '@/hooks/useCourses';
import { useHasCourseAccess } from '@/hooks/useUserPurchases';

interface HeroCarouselProps {
  courses: CourseWithModules[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ courses, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filtrar apenas cursos com acesso ou mostrar todos se nenhum comprado
  const displayCourses = courses.length > 0 ? courses : [];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayCourses.length);
  }, [displayCourses.length]);

  useEffect(() => {
    if (isPaused || displayCourses.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, autoPlayInterval, displayCourses.length]);

  if (displayCourses.length === 0) {
    return (
      <section className="h-[70vh] md:h-[80vh] flex items-center justify-center bg-gradient-to-b from-noir-900 to-noir-950">
        <div className="text-center">
          <h2 className="heading-hero mb-4">Bem-vinda</h2>
          <p className="text-body text-lg">Carregando seus cursos...</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="carousel-hero h-[70vh] md:h-[80vh]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="carousel-track h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayCourses.map((course) => {
          const firstModule = course.modules?.[0];
          
          return (
            <div key={course.id} className="carousel-slide h-full">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80'}
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    {/* Course Name */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 mb-6">
                      <span className="text-gold text-sm font-medium">
                        {course.name}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="heading-hero mb-4">
                      {firstModule?.name || course.name}
                    </h2>

                    {/* Description */}
                    <p className="text-body text-lg mb-8 max-w-lg">
                      {firstModule?.description || course.description}
                    </p>

                    {/* CTA */}
                    <button
                      onClick={() => navigate(`/curso/${course.slug}`)}
                      className="btn-gold text-lg group"
                    >
                      <Play className="w-5 h-5" />
                      <span>COMEÇAR AGORA</span>
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators */}
      {displayCourses.length > 1 && (
        <div className="carousel-indicators">
          {displayCourses.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`carousel-dot ${index === currentIndex ? 'carousel-dot-active' : ''}`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
