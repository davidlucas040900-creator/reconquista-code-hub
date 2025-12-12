// src/pages/Cursos.tsx

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, BookOpen, Loader2 } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  totalLessons: number;
  completedLessons: number;
}

export default function Cursos() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;

    const { data: coursesData } = await supabase
      .from('courses')
      .select('id, name, slug, description, thumbnail')
      .eq('is_active', true)
      .order('order_index');

    if (coursesData) {
      const coursesWithProgress = await Promise.all(
        coursesData.map(async (course) => {
          const { data: modules } = await supabase
            .from('course_modules')
            .select('id')
            .eq('course_id', course.id);
          
          let totalLessons = 0;
          let completedLessons = 0;

          if (modules && modules.length > 0) {
            const moduleIds = modules.map(m => m.id);
            
            const { count: total } = await supabase
              .from('course_lessons')
              .select('*', { count: 'exact', head: true })
              .in('module_id', moduleIds)
              .eq('is_active', true);
            
            totalLessons = total || 0;

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

          return {
            ...course,
            totalLessons,
            completedLessons,
          };
        })
      );

      setCourses(coursesWithProgress);
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex h-14 items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-foreground">Cursos</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {courses.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum curso disponível.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => {
              const progress = course.totalLessons > 0
                ? Math.round((course.completedLessons / course.totalLessons) * 100)
                : 0;

              return (
                <Card
                  key={course.id}
                  className="overflow-hidden cursor-pointer transition-colors hover:bg-accent/50"
                  onClick={() => navigate(`/curso/${course.slug}`)}
                >
                  <div className="flex flex-col sm:flex-row">
                    {/* Thumbnail */}
                    <div className="sm:w-48 aspect-video sm:aspect-auto bg-muted flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center min-h-[120px]">
                          <BookOpen className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-4">
                      <h2 className="font-semibold text-foreground mb-1">
                        {course.name}
                      </h2>
                      {course.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>{course.totalLessons} aulas</span>
                        <span>{progress}% concluído</span>
                      </div>
                      <Progress value={progress} className="h-1" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
