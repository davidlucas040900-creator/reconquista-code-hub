// src/components/dashboard/HeroCarousel.tsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { Course, Module } from '@/types';

interface HeroCarouselProps {
  courses: Course[];
  autoPlayInterval?: number;
}

interface SlideData {
  module: Module;
  course: Course;
}

export function HeroCarousel({ courses, autoPlayInterval = 5000 }: HeroCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Criar array com TODOS os módulos de TODOS os cursos
  const allSlides: SlideData[] = useMemo(() => {
    const slides: SlideData[] = [];
    
    courses.forEach((course) => {
      course.modules.forEach((module) => {
        slides.push({
          module,
          course,
        });
      });
    });
    
    return slides;
  }, [courses]);

  // Avançar para próximo slide (loop infinito)
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allSlides.length);
  }, [allSlides.length]);

  // Auto-play com loop infinito
  useEffect(() => {
    if (isPaused || allSlides.length <= 1) return;

    const interval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, autoPlayInterval, allSlides.length]);

  const handleSlideClick = (slide: SlideData) => {
    const isLocked = !slide.course.isPurchased || slide.module.isLocked;
    
    if (isLocked) {
      window.open(`/vendas/${slide.course.slug}`, '_blank');
    } else {
      navigate(`/curso/${slide.course.slug}?module=${slide.module.id}`);
    }
  };

  if (allSlides.length === 0) return null;

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
        {allSlides.map((slide) => (
          <div key={`${slide.course.id}-${slide.module.id}`} className="carousel-slide h-full">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.module.image}
                alt={slide.module.title}
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
                  {/* Title */}
                  <h2 className="heading-hero mb-4">
                    {slide.module.title}
                  </h2>

                  {/* Description */}
                  <p className="text-body text-lg mb-8 max-w-lg">
                    {slide.module.description}
                  </p>

                  {/* CTA */}
                  <button
                    onClick={() => handleSlideClick(slide)}
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
        ))}
      </div>

      {/* Indicators */}
      {allSlides.length > 1 && (
        <div className="carousel-indicators">
          {allSlides.map((_, index) => (
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
