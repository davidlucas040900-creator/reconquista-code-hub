// src/components/dashboard/HeroCarousel.tsx

import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserAccess } from '@/hooks/useUserAccess';
import type { CourseWithModules } from '@/hooks/useCourses';

interface HeroCarouselProps {
  courses: CourseWithModules[];
}

// Descrições dos módulos
const moduleDescriptions: Record<string, string> = {
  'RESET EMOCIONAL': 'Aprende a parar de agir pela emoção e descobre a melhor técnica de reconquista.',
  'MAPA DA MENTE MASCULINA': 'Entende como ele pensa e o que realmente o faz voltar para ti.',
  'GATILHOS DA MEMÓRIA EMOCIONAL': 'Ativa as memórias que fazem ele sentir saudades de ti.',
  'A FRASE DE 5 PALAVRAS': 'A mensagem secreta que abre o coração dele novamente.',
  'PRIMEIRO CONTATO ESTRATÉGICO': 'Como e quando falar com ele para maximizar o impacto.',
  'DOMÍNIO DA CONVERSA': 'Técnicas para conduzir qualquer conversa a teu favor.',
  'CONQUISTA DURADOURA': 'Garante que ele nunca mais vai querer te deixar.',
  'O DESPERTAR DA DEUSA': 'Descobre o poder que existe dentro de ti.',
  'O TOQUE VICIANTE': 'Aprende a tocá-lo de forma que ele nunca vai esquecer.',
  'O SEGREDO ORAL': 'Técnicas que vão deixá-lo completamente viciado em ti.',
  'A CAVALGADA DA DEUSA': 'Domine a arte de estar por cima com confiança absoluta.',
  'O BIG BANG SONORO': 'Os sons e palavras que aceleram o prazer dele.',
  'SEGREDOS PROFUNDOS': 'Técnicas avançadas para conexão íntima profunda.',
  'DEVOÇÃO ETERNA': 'Faça-o devotado a ti para sempre.',
  'MENTORIAS E LIVES': 'Acesso exclusivo a mentorias ao vivo e conteúdo premium.',
  'O Poder da Onisciência': 'Veja e entenda tudo sobre ele antes mesmo dele saber.',
  'O Campo de Batalha Digital': 'Domine as redes sociais para reconquistar.',
  'Acesso ao Cérebro Dele': 'Técnicas de psicologia aplicada à reconquista.',
  'A Blacklist Masculina': 'O que nunca fazer se queres ele de volta.',
  'O Protocolo de Emergência': 'Plano de ação para situações críticas.',
  'O Diário da Deusa (BÓNUS)': 'Exercícios diários para sua transformação.',
};

// CTAs personalizados
const moduleCTAs: Record<string, string> = {
  'RESET EMOCIONAL': 'COMEÇAR O RESET AGORA',
  'MAPA DA MENTE MASCULINA': 'DESVENDAR A MENTE DELE',
  'GATILHOS DA MEMÓRIA EMOCIONAL': 'ATIVAR OS GATILHOS',
  'A FRASE DE 5 PALAVRAS': 'DESCOBRIR A FRASE',
  'PRIMEIRO CONTATO ESTRATÉGICO': 'INICIAR O CONTATO',
  'DOMÍNIO DA CONVERSA': 'DOMINAR A CONVERSA',
  'CONQUISTA DURADOURA': 'GARANTIR A CONQUISTA',
  'O DESPERTAR DA DEUSA': 'DESPERTAR AGORA',
  'O TOQUE VICIANTE': 'APRENDER O TOQUE',
  'O SEGREDO ORAL': 'DESCOBRIR O SEGREDO',
  'A CAVALGADA DA DEUSA': 'DOMINAR A TÉCNICA',
  'O BIG BANG SONORO': 'APRENDER OS SONS',
  'SEGREDOS PROFUNDOS': 'EXPLORAR OS SEGREDOS',
  'DEVOÇÃO ETERNA': 'CONQUISTAR DEVOÇÃO',
  'MENTORIAS E LIVES': 'ACESSAR MENTORIAS',
  'O Poder da Onisciência': 'OBTER ONISCIÊNCIA',
  'O Campo de Batalha Digital': 'DOMINAR O DIGITAL',
  'Acesso ao Cérebro Dele': 'ACESSAR O CÉREBRO',
  'A Blacklist Masculina': 'VER A BLACKLIST',
  'O Protocolo de Emergência': 'ATIVAR PROTOCOLO',
  'O Diário da Deusa (BÓNUS)': 'COMEÇAR O DIÁRIO',
};

// Função para embaralhar array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function HeroCarousel({ courses }: HeroCarouselProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const { data: accessData } = useUserAccess();

  // Extrair e embaralhar todos os módulos (ordem aleatória)
  const allModules = useMemo(() => {
    const modules = courses.flatMap(course => 
      (course.course_modules || []).map(module => ({
        ...module,
        courseSlug: course.slug,
        courseName: course.name,
      }))
    );
    return shuffleArray(modules);
  }, [courses]);

  // Auto-scroll
  useEffect(() => {
    if (allModules.length <= 1) return;

    const interval = setInterval(() => {
      if (!isTransitioning) {
        goToNext();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [allModules.length, isTransitioning]);

  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + allModules.length) % allModules.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % allModules.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  // Touch handlers para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrevious();
    }
  };

  if (!allModules.length) {
    return (
      <section className="relative h-[70vh] md:h-[80vh] bg-gradient-to-b from-purple-900/20 to-noir-950 flex items-center justify-center">
        <p className="text-gray-400">Nenhum módulo disponível</p>
      </section>
    );
  }

  const currentModule = allModules[currentIndex];
  const hasAccess = accessData?.hasFullAccess || accessData?.purchasedCourses?.includes(currentModule.courseSlug);
  const firstLesson = currentModule.course_lessons?.[0];

  const handleClick = () => {
    if (hasAccess && firstLesson) {
      navigate(`/aula/${firstLesson.id}`);
    } else {
      window.open('https://pay.lojou.co/codigo-reconquista', '_blank');
    }
  };

  return (
    <section 
      className="relative h-[70vh] md:h-[80vh] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: currentModule.thumbnail
            ? `url(${currentModule.thumbnail})`
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        }}
      >
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir-950 via-noir-950/50 to-noir-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-noir-950/70 via-transparent to-noir-950/70" />
      </div>

      {/* Content - SEM TÍTULO, apenas descrição */}
      <div className="relative h-full flex items-center justify-center text-center px-4">
        <div className="max-w-3xl">
          {/* Descrição - Grande e centralizada */}
          <p className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed mb-8 md:mb-10">
            {moduleDescriptions[currentModule.name] || currentModule.description || 'Transforme sua vida com este módulo exclusivo.'}
          </p>

          {/* CTA Button */}
          <Button
            onClick={handleClick}
            className="bg-gold hover:bg-gold-light text-noir-950 font-bold text-sm md:text-base px-8 py-4 md:px-10 md:py-5 rounded-full shadow-xl shadow-gold/30 transition-all hover:scale-105"
          >
            {moduleCTAs[currentModule.name] || 'COMEÇAR AGORA'}
          </Button>
        </div>
      </div>

      {/* Navigation Arrows - Desktop */}
      {allModules.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm items-center justify-center transition-all border border-white/10"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm items-center justify-center transition-all border border-white/10"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {allModules.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {allModules.slice(0, 10).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-gold'
                  : 'w-2 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
          {allModules.length > 10 && (
            <span className="text-white/40 text-xs ml-2">+{allModules.length - 10}</span>
          )}
        </div>
      )}
    </section>
  );
}
