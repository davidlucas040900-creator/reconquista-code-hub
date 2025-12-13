// src/components/dashboard/HeroCarousel.tsx

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronRight, Lock } from 'lucide-react';
import { Course, Module } from '@/types';

interface HeroCarouselProps {
  courses: Course[];
  autoPlayInterval?: number;
}

interface SlideData {
  module: Module;
  course: Course;
  moduleIndex: number;
}

export function HeroCarousel({ courses, autoPlayInterval = 4000 }: HeroCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Criar array com TODOS os módulos de TODOS os cursos
  const allSlides: SlideData[] = useMemo(() => {
    const slides: SlideData[] = [];
    
    courses.forEach((course) => {
      course.modules.forEach((module, index) => {
        slides.push({
          module,
          course,
          moduleIndex: index + 1
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

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (allSlides.length === 0) return null;

  const currentSlide = allSlides[currentIndex];
  const isLocked = !currentSlide.course.isPurchased || currentSlide.module.isLocked;

  return (
    <section
      className="carousel-hero h-[60vh] md:h-[70vh]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="carousel-track h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {allSlides.map((slide, index) => {
          const slideIsLocked = !slide.course.isPurchased || slide.module.isLocked;
          
          return (
            <div key={`${slide.course.id}-${slide.module.id}`} className="carousel-slide h-full">
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={slide.module.image}
                  alt={slide.module.title}
                  className={`w-full h-full object-cover ${slideIsLocked ? 'opacity-70' : ''}`}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    {/* Course Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-4">
                      <span className="text-silk-300 text-xs font-medium uppercase tracking-wider">
                        {slide.course.name}
                      </span>
                    </div>

                    {/* Module Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 mb-6 ml-2">
                      <span className="text-gold text-sm font-medium">
                        MÓDULO {slide.moduleIndex}
                      </span>
                      {slideIsLocked && <Lock className="w-3 h-3 text-gold" />}
                    </div>

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
                      className={`${slideIsLocked ? 'btn-royal' : 'btn-gold'} text-lg group`}
                    >
                      {slideIsLocked ? (
                        <>
                          <Lock className="w-5 h-5" />
                          <span>DESBLOQUEAR ACESSO</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>COMEÇAR AGORA</span>
                        </>
                      )}
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicators - Mostrar apenas alguns dots se tiver muitos slides */}
      <div className="carousel-indicators">
        {allSlides.length <= 10 ? (
          // Se tiver 10 ou menos, mostra todos os dots
          allSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`carousel-dot ${index === currentIndex ? 'carousel-dot-active' : ''}`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))
        ) : (
          // Se tiver mais de 10, mostra contador
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm">
            <span className="text-gold font-medium">{currentIndex + 1}</span>
            <span className="text-silk-400">/</span>
            <span className="text-silk-400">{allSlides.length}</span>
          </div>
        )}
      </div>

      {/* Progress bar do auto-play */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div 
          className="h-full bg-gold transition-all ease-linear"
          style={{ 
            width: isPaused ? '0%' : '100%',
            transitionDuration: isPaused ? '0ms' : `${autoPlayInterval}ms`
          }}
          key={currentIndex}
        />
      </div>
    </section>
  );
}
