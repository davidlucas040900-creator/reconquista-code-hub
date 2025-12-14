// src/components/dashboard/HeroCarousel.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CourseWithModules } from '@/hooks/useCourses';

interface HeroCarouselProps {
  courses: CourseWithModules[];
}

export function HeroCarousel({ courses }: HeroCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll
  useEffect(() => {
    if (courses.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % courses.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [courses.length]);

  if (!courses.length) {
    return (
      <section className="relative h-[50vh] md:h-[60vh] bg-gradient-to-b from-purple-900/20 to-noir-950 flex items-center justify-center">
        <p className="text-gray-400">Nenhum curso disponível</p>
      </section>
    );
  }

  const currentCourse = courses[currentIndex];
  const totalLessons = currentCourse.course_modules?.reduce(
    (acc, mod) => acc + (mod.course_lessons?.length || 0), 0
  ) || 0;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + courses.length) % courses.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % courses.length);
  };

  return (
    <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: currentCourse.thumbnail 
            ? `url(${currentCourse.thumbnail})` 
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir-950/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-end pb-12 px-4 md:px-8">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-purple-600/80 text-white text-xs font-semibold rounded-full">
              DESTAQUE
            </span>
            <span className="text-gray-400 text-sm">
              {currentCourse.course_modules?.length || 0} módulos  {totalLessons} aulas
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
            {currentCourse.name}
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-base md:text-lg mb-6 line-clamp-2">
            {currentCourse.description || 'Transforme sua vida com este curso exclusivo'}
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => navigate(`/curso/${currentCourse.slug}`)}
              className="bg-white text-black hover:bg-gray-200 font-semibold px-6 py-3"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Assistir
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/curso/${currentCourse.slug}`)}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Mais Informações
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {courses.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 md:opacity-70"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 hover:opacity-100 group-hover:opacity-100 md:opacity-70"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {courses.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {courses.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
