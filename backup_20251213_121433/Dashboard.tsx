import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  ChevronRight,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Course {
  id: string;
  name: string;
  slug: string;
  total_lessons: number;
  completed_lessons: number;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [continueLesson, setContinueLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    } else {
      navigate('/login');
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Carregar perfil
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Carregar cursos mockados (você vai conectar com banco real)
      setCourses([
        {
          id: '1',
          name: 'Código da Reconquista',
          slug: 'codigo-reconquista',
          total_lessons: 39,
          completed_lessons: 12,
        },
        {
          id: '2',
          name: 'A Deusa na Cama',
          slug: 'deusa-na-cama',
          total_lessons: 40,
          completed_lessons: 0,
        },
        {
          id: '3',
          name: 'O Santuário',
          slug: 'o-santuario',
          total_lessons: 24,
          completed_lessons: 0,
        },
      ]);

      // Última aula assistida (mocado)
      setContinueLesson({
        title: 'A Técnica do Silêncio',
        module: 'Módulo 2',
        progress: 65,
        courseSlug: 'codigo-reconquista',
      });

      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
      </div>
    );
  }

  const totalLessons = courses.reduce((sum, c) => sum + c.total_lessons, 0);
  const completedLessons = courses.reduce((sum, c) => sum + c.completed_lessons, 0);
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <h1 className="text-lg font-semibold text-foreground">
                Reconquista
              </h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden items-center gap-4 md:flex">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/perfil')}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <div className="space-y-1 px-4 py-3">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  navigate('/perfil');
                  setMobileMenuOpen(false);
                }}
              >
                <User className="h-4 w-4" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="space-y-8 lg:space-y-12">
          
          {/* Welcome Section */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Olá, {profile?.full_name || 'Guerreira'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Continue sua jornada de transformação
            </p>
          </section>

          {/* Continue Watching */}
          {continueLesson && (
            <section>
              <h3 className="mb-4 text-sm font-medium text-foreground">
                Continue de onde parou
              </h3>
              <Card className="border-border p-6 transition-colors hover:bg-accent/50">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-1 text-xs text-muted-foreground">
                      {continueLesson.module}
                    </div>
                    <h4 className="mb-2 text-lg font-medium text-foreground">
                      {continueLesson.title}
                    </h4>
                    <div className="flex items-center gap-3">
                      <Progress value={continueLesson.progress} className="h-1 w-32" />
                      <span className="text-xs text-muted-foreground">
                        {continueLesson.progress}%
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/cursos/${continueLesson.courseSlug}`)}
                    className="gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Continuar
                  </Button>
                </div>
              </Card>
            </section>
          )}

          {/* Overall Progress */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Progresso Geral
              </h3>
              <span className="text-sm text-muted-foreground">
                {completedLessons} de {totalLessons} aulas
              </span>
            </div>
            <Progress value={overallProgress} className="h-2" />
          </section>

          {/* Courses Grid */}
          <section>
            <h3 className="mb-6 text-sm font-medium text-foreground">
              Seus Cursos
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const progress = course.total_lessons > 0
                  ? (course.completed_lessons / course.total_lessons) * 100
                  : 0;

                return (
                  <Card
                    key={course.id}
                    className="group cursor-pointer border-border p-6 transition-colors hover:bg-accent/50"
                    onClick={() => navigate(`/cursos/${course.slug}`)}
                  >
                    <div className="space-y-4">
                      <div>
                        <h4 className="mb-1 font-medium text-foreground group-hover:text-foreground">
                          {course.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {course.total_lessons} aulas
                        </p>
                      </div>

                      {progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progresso</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-1" />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">
                          {course.completed_lessons > 0 ? 'Continuar' : 'Começar'}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Quick Links */}
          <section>
            <h3 className="mb-6 text-sm font-medium text-foreground">
              Recursos
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card
                className="cursor-pointer border-border p-4 text-center transition-colors hover:bg-accent/50"
                onClick={() => window.open('https://chat.whatsapp.com/xyz', '_blank')}
              >
                <div className="text-sm font-medium text-foreground">
                  Comunidade
                </div>
              </Card>
              <Card
                className="cursor-pointer border-border p-4 text-center transition-colors hover:bg-accent/50"
                onClick={() => navigate('/materiais')}
              >
                <div className="text-sm font-medium text-foreground">
                  Materiais
                </div>
              </Card>
              <Card
                className="cursor-pointer border-border p-4 text-center transition-colors hover:bg-accent/50"
                onClick={() => window.open('https://wa.me/258834569225', '_blank')}
              >
                <div className="text-sm font-medium text-foreground">
                  Suporte
                </div>
              </Card>
              <Card
                className="cursor-pointer border-border p-4 text-center transition-colors hover:bg-accent/50"
                onClick={() => navigate('/meu-plano')}
              >
                <div className="text-sm font-medium text-foreground">
                  Meu Plano
                </div>
              </Card>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}