import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Play,
  ChevronRight,
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  Users,
  FileText,
  Headphones,
  Crown
} from 'lucide-react';

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
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

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

      setContinueLesson({
        title: 'A Técnica do Silêncio',
        module: 'Módulo 2',
        lessonNumber: 8,
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-amber-500" />
      </div>
    );
  }

  const totalLessons = courses.reduce((sum, c) => sum + c.total_lessons, 0);
  const completedLessons = courses.reduce((sum, c) => sum + c.completed_lessons, 0);
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const quickLinks = [
    { icon: Users, label: 'Comunidade', onClick: () => window.open('https://chat.whatsapp.com/xyz', '_blank') },
    { icon: FileText, label: 'Materiais', onClick: () => navigate('/materiais') },
    { icon: Headphones, label: 'Suporte', onClick: () => window.open('https://wa.me/258834569225', '_blank') },
    { icon: Crown, label: 'Meu Plano', onClick: () => navigate('/meu-plano') },
  ];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between">
            <span className="text-base font-medium tracking-tight text-zinc-100">
              Reconquista
            </span>

            <nav className="hidden items-center gap-1 md:flex">
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                onClick={() => navigate('/perfil')}
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </nav>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100 md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-zinc-800/50 bg-zinc-900/95 md:hidden">
            <div className="space-y-1 px-4 py-3">
              <button
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50"
                onClick={() => { navigate('/perfil'); setMobileMenuOpen(false); }}
              >
                <User className="h-4 w-4 text-zinc-500" />
                Perfil
              </button>
              <button
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800/50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 text-zinc-500" />
                Sair
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========== MAIN ========== */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="space-y-10 lg:space-y-14">

          {/* ===== WELCOME ===== */}
          <section>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              Olá, {profile?.full_name?.split(' ')[0] || 'Guerreira'}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Continue sua jornada de transformação
            </p>
          </section>

          {/* ===== CONTINUE WATCHING ===== */}
          {continueLesson && (
            <section>
              <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Continue de onde parou
              </h2>
              <div className="rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-3">
                    <div>
                      <span className="text-xs text-zinc-500">
                        {continueLesson.module}  Aula {continueLesson.lessonNumber}
                      </span>
                      <h3 className="mt-1 text-lg font-medium text-zinc-100">
                        {continueLesson.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1 w-32 overflow-hidden rounded-full bg-zinc-800">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${continueLesson.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">
                        {continueLesson.progress}%
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/cursos/${continueLesson.courseSlug}`)}
                    className="bg-amber-500 text-zinc-900 hover:bg-amber-400 font-medium"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Continuar
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* ===== OVERALL PROGRESS ===== */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Progresso Geral
              </h2>
              <span className="text-sm tabular-nums text-zinc-400">
                {completedLessons}/{totalLessons} aulas
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
              <div 
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </section>

          {/* ===== COURSES ===== */}
          <section>
            <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Seus Cursos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => {
                const progress = course.total_lessons > 0
                  ? (course.completed_lessons / course.total_lessons) * 100
                  : 0;
                const isStarted = course.completed_lessons > 0;

                return (
                  <button
                    key={course.id}
                    onClick={() => navigate(`/cursos/${course.slug}`)}
                    className="group flex flex-col rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-5 text-left hover:border-zinc-700/50 hover:bg-zinc-900/50"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="rounded-lg bg-zinc-800/50 p-2">
                        <BookOpen className="h-4 w-4 text-zinc-400" />
                      </div>
                      {isStarted && (
                        <span className="text-xs font-medium text-amber-500">
                          {Math.round(progress)}%
                        </span>
                      )}
                    </div>

                    <h3 className="mb-1 font-medium text-zinc-100">
                      {course.name}
                    </h3>
                    <p className="mb-4 text-sm text-zinc-500">
                      {course.total_lessons} aulas
                    </p>

                    {isStarted && (
                      <div className="mb-4 h-1 overflow-hidden rounded-full bg-zinc-800">
                        <div 
                          className="h-full bg-amber-500/80 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-zinc-800/50">
                      <span className="text-sm text-zinc-400">
                        {isStarted ? 'Continuar' : 'Começar'}
                      </span>
                      <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ===== QUICK LINKS ===== */}
          <section>
            <h2 className="mb-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Recursos
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {quickLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="flex flex-col items-center gap-2 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:border-zinc-700/50 hover:bg-zinc-900/50"
                >
                  <link.icon className="h-5 w-5 text-zinc-500" />
                  <span className="text-sm font-medium text-zinc-300">
                    {link.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="mt-auto border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-center text-xs text-zinc-600">
             2024 Reconquista. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

