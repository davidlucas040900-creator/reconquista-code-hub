// src/pages/Dashboard.tsx - VERSÃO MINIMALISTA

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  LogOut, 
  PlayCircle, 
  BookOpen, 
  ChevronRight,
  User,
  Loader2
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Course {
  id: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  totalLessons: number;
  completedLessons: number;
}

interface ContinueWatching {
  lessonId: string;
  lessonTitle: string;
  moduleName: string;
  courseSlug: string;
  progress: number;
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatching | null>(null);
  const [totalProgress, setTotalProgress] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Buscar perfil
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    
    setProfile(profileData);

    // Buscar cursos com acesso
    const { data: coursesData } = await supabase
      .from('courses')
      .select('id, name, slug, thumbnail')
      .eq('is_active', true)
      .order('order_index');

    if (coursesData) {
      // Para cada curso, buscar progresso
      const coursesWithProgress = await Promise.all(
        coursesData.map(async (course) => {
          // Total de aulas do curso
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

            // Aulas completadas pelo usuário
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

      // Calcular progresso total
      const totalAll = coursesWithProgress.reduce((acc, c) => acc + c.totalLessons, 0);
      const completedAll = coursesWithProgress.reduce((acc, c) => acc + c.completedLessons, 0);
      setTotalProgress({ completed: completedAll, total: totalAll });
    }

    // Buscar última aula assistida (continue watching)
    const { data: lastProgress } = await supabase
      .from('user_lesson_progress')
      .select(`
        lesson_id,
        watch_percentage,
        course_lessons:lesson_id (
          id,
          title,
          course_modules:module_id (
            name,
            courses:course_id (slug)
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('last_watched_at', { ascending: false })
      .limit(1)
      .single();

    if (lastProgress?.course_lessons) {
      const lesson = lastProgress.course_lessons as any;
      setContinueWatching({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        moduleName: lesson.course_modules?.name || '',
        courseSlug: lesson.course_modules?.courses?.slug || '',
        progress: lastProgress.watch_percentage || 0,
      });
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const firstName = profile?.full_name?.split(' ')[0] || 'Aluna';
  const progressPercent = totalProgress.total > 0 
    ? Math.round((totalProgress.completed / totalProgress.total) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4">
          <div className="flex h-14 items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background text-sm font-bold">
                CR
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="space-y-8">
          {/* Welcome */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Olá, {firstName}
            </h1>
            <p className="text-muted-foreground">
              Vamos continuar sua jornada?
            </p>
          </div>

          {/* Continue Watching */}
          {continueWatching && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-1">
                    Continuar assistindo
                  </p>
                  <h3 className="font-medium text-foreground truncate">
                    {continueWatching.lessonTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {continueWatching.moduleName}
                  </p>
                </div>
                <Button 
                  onClick={() => navigate(`/aula/${continueWatching.lessonId}`)}
                >
                  Retomar
                </Button>
              </div>
              {continueWatching.progress > 0 && (
                <Progress value={continueWatching.progress} className="h-1 mt-4" />
              )}
            </Card>
          )}

          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Seu progresso</span>
              <span className="text-sm font-medium text-foreground">
                {totalProgress.completed} de {totalProgress.total}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Courses */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Seus cursos
            </h2>

            {courses.length === 0 ? (
              <Card className="p-8 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum curso disponível ainda.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => {
                  const courseProgress = course.totalLessons > 0
                    ? Math.round((course.completedLessons / course.totalLessons) * 100)
                    : 0;

                  return (
                    <Card
                      key={course.id}
                      className="overflow-hidden cursor-pointer transition-colors hover:bg-accent/50"
                      onClick={() => navigate(`/curso/${course.slug}`)}
                    >
                      {/* Thumbnail */}
                      <div className="aspect-video bg-muted">
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-medium text-foreground mb-1">
                          {course.name}
                        </h3>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                          <span>{course.totalLessons} aulas</span>
                          <span>{courseProgress}%</span>
                        </div>
                        <Progress value={courseProgress} className="h-1" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card 
              className="p-4 cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => navigate('/cursos')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-accent p-2">
                    <PlayCircle className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Todos os cursos</p>
                    <p className="text-sm text-muted-foreground">Ver catálogo completo</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card 
              className="p-4 cursor-pointer transition-colors hover:bg-accent/50"
              onClick={() => navigate('/admin')}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-md bg-accent p-2">
                    <User className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Minha conta</p>
                    <p className="text-sm text-muted-foreground">Perfil e configurações</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
