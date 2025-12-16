// src/pages/Cursos.tsx
// Atualizado: Mostra todos os cursos, com bloqueio visual para nao comprados

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useUserAccess } from '@/hooks/useUserAccess';
import { Button } from '@/components/ui/button';
import { ChevronLeft, BookOpen, Loader2, Lock, Crown } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: number | null;
  totalLessons: number;
  completedLessons: number;
  hasAccess: boolean;
}

// Links de checkout por curso
const checkoutLinks: Record<string, string> = {
  'codigo-reconquista': 'https://pay.lojou.app/p/HJo0Q',
  'deusa-na-cama': 'https://pay.lojou.app/p/pKPr7',
  'exclusivo-1-porcento': 'https://pay.lojou.app/p/qp5Vp',
  'santuario': 'https://pay.lojou.app/p/santuario',
};

export default function Cursos() {
  const { user, loading: authLoading } = useAuth();
  const { data: accessData, isLoading: accessLoading } = useUserAccess();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && accessData !== undefined) {
      fetchCourses();
    }
  }, [user, accessData]);

  const fetchCourses = async () => {
    if (!user) return;

    const { data: coursesData } = await supabase
      .from('courses')
      .select('id, name, slug, description, thumbnail, price')
      .eq('is_active', true)
      .order('order_index');

    if (coursesData) {
      const coursesWithProgress = await Promise.all(
        coursesData.map(async (course) => {
          // Verificar acesso
          const hasAccess = accessData?.hasFullAccess || 
                           accessData?.purchasedCourses?.includes(course.slug) || 
                           false;

          // Contar aulas apenas se tiver acesso
          let totalLessons = 0;
          let completedLessons = 0;

          const { data: modules } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', course.id);

          if (modules && modules.length > 0) {
            const moduleIds = modules.map(m => m.id);

            const { count: total } = await supabase
              .from('course_lessons')
              .select('*', { count: 'exact', head: true })
              .in('module_id', moduleIds)
              .eq('is_active', true);

            totalLessons = total || 0;

            if (hasAccess) {
              const { data: lessons } = await supabase
                .from('course_lessons')
                .select('id')
                .in('module_id', moduleIds);

              if (lessons && lessons.length > 0) {
                const lessonIds = lessons.map(l => l.id);

                const { count: completed } = await supabase
                  .from('user_lesson_progress')
                  .select('*', { count: 'exact', head: true })
                  .eq('user_id', user.id)
                  .in('lesson_id', lessonIds)
                  .eq('is_completed', true);

                completedLessons = completed || 0;
              }
            }
          }

          return {
            ...course,
            totalLessons,
            completedLessons,
            hasAccess,
          };
        })
      );

      setCourses(coursesWithProgress);
    }

    setLoading(false);
  };

  const handleCourseClick = (course: Course) => {
    if (course.hasAccess) {
      navigate(`/curso/${course.slug}`);
    } else {
      // Abrir link de checkout
      const checkoutUrl = checkoutLinks[course.slug] || 'https://codigodareconquista.com';
      window.open(checkoutUrl, '_blank');
    }
  };

  if (authLoading || loading || accessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex h-14 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-medium text-zinc-100">Cursos</h1>
          </div>
        </div>
      </header>

      {/* ========== MAIN ========== */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {courses.length === 0 ? (
          <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/50">
              <BookOpen className="h-6 w-6 text-zinc-500" />
            </div>
            <p className="text-sm text-zinc-500">Nenhum curso disponivel.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const progress = course.totalLessons > 0
                ? Math.round((course.completedLessons / course.totalLessons) * 100)
                : 0;
              const isStarted = course.completedLessons > 0;

              return (
                <button
                  key={course.id}
                  onClick={() => handleCourseClick(course)}
                  className={`group w-full overflow-hidden rounded-lg border text-left transition-all ${
                    course.hasAccess
                      ? 'border-zinc-800/50 bg-zinc-900/30 hover:border-zinc-700/50 hover:bg-zinc-900/50'
                      : 'border-amber-500/20 bg-gradient-to-r from-zinc-900/50 to-amber-900/10 hover:border-amber-500/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="relative aspect-video flex-shrink-0 bg-zinc-800/50 sm:aspect-auto sm:w-48">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.name}
                          className={`h-full w-full object-cover ${!course.hasAccess ? 'opacity-60' : ''}`}
                        />
                      ) : (
                        <div className="flex h-full min-h-[120px] w-full items-center justify-center">
                          <BookOpen className="h-8 w-8 text-zinc-600" />
                        </div>
                      )}
                      
                      {/* Badge de acesso */}
                      {!course.hasAccess && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="flex items-center gap-2 rounded-full bg-amber-500/90 px-3 py-1.5 text-xs font-semibold text-black">
                            <Lock className="h-3 w-3" />
                            DESBLOQUEAR
                          </div>
                        </div>
                      )}

                      {/* Barra de progresso */}
                      {course.hasAccess && isStarted && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                          <div
                            className="h-full bg-amber-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-1 flex-col p-4 sm:p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <h2 className={`font-medium ${course.hasAccess ? 'text-zinc-100 group-hover:text-white' : 'text-amber-100'}`}>
                            {course.name}
                          </h2>
                          {!course.hasAccess && (
                            <Lock className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        {course.hasAccess && isStarted && (
                          <span className="flex-shrink-0 text-xs font-medium text-amber-500">
                            {progress}%
                          </span>
                        )}
                      </div>

                      {course.description && (
                        <p className={`mb-4 line-clamp-2 text-sm ${course.hasAccess ? 'text-zinc-500' : 'text-zinc-400'}`}>
                          {course.description}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between border-t border-zinc-800/50 pt-3">
                        <span className="text-sm text-zinc-500">
                          {course.totalLessons} aulas
                        </span>
                        
                        {course.hasAccess ? (
                          <span className="text-sm text-zinc-400">
                            {isStarted ? 'Continuar' : 'Comecar'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm font-medium text-amber-500">
                            <Crown className="h-4 w-4" />
                            {course.price ? `${course.price} MZN` : 'Ver preco'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="mt-auto border-t border-zinc-800/50">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <p className="text-center text-xs text-zinc-600">
            2024 Reconquista. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

