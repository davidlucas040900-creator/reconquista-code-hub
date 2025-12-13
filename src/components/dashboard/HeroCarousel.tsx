// src/components/dashboard/HeroCarousel.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { Course } from '@/types';

interface HeroCarouselProps {
  courses: Course[];
  autoPlayInterval?: number;
}

export function HeroCarousel({ courses, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const purchasedCourses = courses.filter(c => c.isPurchased);
  const displayCourses = purchasedCourses.length > 0 ? purchasedCourses : courses;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayCourses.length);
  }, [displayCourses.length]);

  useEffect(() => {
    if (isPaused || displayCourses.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, autoPlayInterval, displayCourses.length]);

  const handleModuleClick = (course: Course) => {
    if (course.isPurchased) {
      navigate(`/curso/${course.slug}`);
    } else {
      // Navegar para página de vendas
      window.open(`/vendas/${course.slug}`, '_blank');
    }
  };

  if (displayCourses.length === 0) return null;

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
        {displayCourses.map((course, index) => (
          <div key={course.id} className="carousel-slide h-full">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={course.heroImage}
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
                  {/* Module Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 mb-6">
                    <span className="text-gold text-sm font-medium">
                      MÓDULO {index + 1}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="heading-hero mb-4">
                    {course.modules[0]?.title || course.name}
                  </h2>

                  {/* Description */}
                  <p className="text-body text-lg mb-8 max-w-lg">
                    {course.modules[0]?.description || course.description}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={() => handleModuleClick(course)}
                    className="btn-gold text-lg group"
                  >
                    <Play className="w-5 h-5" />
                    <span>
                      {course.isPurchased ? 'COMEÇAR AGORA' : 'DESBLOQUEAR ACESSO'}
                    </span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
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
