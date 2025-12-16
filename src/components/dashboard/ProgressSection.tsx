// src/components/dashboard/ProgressSection.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useUserAccess } from '@/hooks/useUserAccess';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { supabase } from '@/integrations/supabase/client';
import { Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CourseWithModules } from '@/hooks/useCourses';

interface ProgressSectionProps {
  courses: CourseWithModules[];
}

// Saudações personalizadas por curso
const courseGreetings: Record<string, { title: string; message: string }> = {
  'codigo-reconquista': {
    title: 'Bem-vinda à tua virada de jogo',
    message: 'O caminho da reconquista começa agora. Cada aula te aproxima dele.',
  },
  'deusa-na-cama': {
    title: 'Bem-vinda, Deusa',
    message: 'Prepara-te para dominar o desejo e despertar a paixão que ele nunca esquecerá.',
  },
  'santuario': {
    title: 'Bem-vinda ao Círculo do 1%',
    message: 'O teu poder é ilimitado. Aqui, tu te tornas imbatível.',
  },
};

export function ProgressSection({ courses }: ProgressSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: userProgress, isLoading } = useUserProgress();
  const { data: accessData } = useUserAccess();
  const { getLastLesson } = useVideoProgress();
  const [userName, setUserName] = useState<string>('');

  // Buscar nome do usuário do banco de dados
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user?.id) return;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      
      if (profile?.full_name) {
        // Pegar apenas o primeiro nome
        const firstName = profile.full_name.split(' ')[0];
        setUserName(firstName);
      }
    };

    fetchUserName();
  }, [user?.id]);

  if (!user) return null;

  const lastLesson = getLastLesson();
  const purchasedCourses = accessData?.purchasedCourses || [];
  const hasFullAccess = accessData?.hasFullAccess || false;

  // Determinar saudação baseada no curso principal
  const primaryCourse = purchasedCourses[0] || 'codigo-reconquista';
  const greeting = courseGreetings[primaryCourse] || courseGreetings['codigo-reconquista'];

  // Calcular progresso por curso
  const getCourseProgress = (course: CourseWithModules) => {
    if (!userProgress) return 0;
    
    const lessonIds = course.course_modules?.flatMap(
      m => m.course_lessons?.map(l => l.id) || []
    ) || [];
    
    if (lessonIds.length === 0) return 0;
    
    const completed = userProgress.filter(
      p => lessonIds.includes(p.lesson_id) && p.is_completed
    ).length;
    
    return Math.round((completed / lessonIds.length) * 100);
  };

  // Filtrar cursos com acesso
  const accessibleCourses = courses.filter(
    c => hasFullAccess || purchasedCourses.includes(c.slug)
  );

  // Nome para exibir (prioridade: nome do banco > metadata > primeiro nome do email)
  const displayName = userName || user.user_metadata?.name || user.email?.split('@')[0] || 'Querida';

  if (isLoading) {
    return (
      <section className="px-4 py-6 md:px-8">
        <div className="animate-pulse">
          <div className="h-32 bg-zinc-800/50 rounded-2xl"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 md:px-8">
      {/* Card Glassmorphism */}
      <div className="relative overflow-hidden rounded-2xl md:rounded-3xl">
        {/* Background com gradiente */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-noir-900/60 to-gold/20" />
        <div className="absolute inset-0 backdrop-blur-xl" />
        <div className="absolute inset-0 border border-white/10 rounded-2xl md:rounded-3xl" />
        
        {/* Decoração */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        {/* Conteúdo */}
        <div className="relative p-5 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Saudação */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-gold" />
                <span className="text-gold text-sm font-medium">
                  Olá, {displayName}
                </span>
              </div>
              
              <h2 className="text-xl md:text-2xl lg:text-3xl font-playfair font-bold text-white mb-2">
                {greeting.title}
              </h2>
              
              <p className="text-gray-300 text-sm md:text-base max-w-xl">
                {greeting.message}
              </p>

              {/* Botão Continuar */}
              {lastLesson && (
                <Button
                  onClick={() => navigate(`/aula/${lastLesson.lessonId}`)}
                  className="mt-4 bg-gold hover:bg-gold-light text-noir-950 font-semibold px-6 py-3 rounded-full shadow-lg shadow-gold/20"
                >
                  <Play className="w-4 h-4 mr-2 fill-current" />
                  Continuar de onde parou
                </Button>
              )}
            </div>

            {/* Progresso dos Cursos */}
            {accessibleCourses.length > 0 && (
              <div className="flex-shrink-0 w-full lg:w-80">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3">
                  Seu Progresso
                </p>
                <div className="space-y-3">
                  {accessibleCourses.map(course => {
                    const progress = getCourseProgress(course);
                    return (
                      <div key={course.id}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-white font-medium truncate pr-2">
                            {course.name}
                          </span>
                          <span className="text-gold font-semibold flex-shrink-0">
                            {progress}%
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${progress}%`,
                              background: 'linear-gradient(to right, #B8960F, #D4AF37, #E5C158)',
                              boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

