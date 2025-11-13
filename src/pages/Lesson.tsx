import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { modules } from '@/data/modules';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home, ChevronRight, CheckCircle2 } from 'lucide-react';
import { MarkAsCompletedButton } from '@/components/MarkAsCompletedButton';
import { MaterialsSection } from '@/components/MaterialsSection';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

const Lesson = () => {
  const { moduleSlug, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const module = modules.find(m => m.slug === moduleSlug);
  const lesson = module?.lessons.find(l => l.id === Number(lessonId));
  
  if (!module || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Aula não encontrada</h1>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const currentLessonIndex = module.lessons.findIndex(l => l.id === Number(lessonId));
  const nextLesson = module.lessons[currentLessonIndex + 1];
  const isLastLesson = currentLessonIndex === module.lessons.length - 1;

  const handleVideoEnd = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const plyrProps = {
    source: {
      type: 'video' as const,
      sources: [
        {
          src: lesson.youtubeId,
          provider: 'youtube' as const,
        },
      ],
    },
    options: {
      controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
      settings: ['quality', 'speed', 'loop'],
      autoplay: false,
      hideControls: true,
      keyboard: { focused: true, global: false },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
                CR
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span>{module.title}</span>
                <span>•</span>
                <span>Aula {lesson.id}</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breadcrumb */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Voltar aos Módulos</span>
            </button>

            {/* Video Player */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video shadow-2xl">
              <Plyr {...plyrProps} />
            </div>

            {/* Lesson Info */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {lesson.title}
              </h1>
              <p className="text-muted-foreground mb-4">
                {lesson.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Módulo {module.id}: {module.title}
                </span>
                <span>•</span>
                <span>{lesson.duration}</span>
              </div>
            </div>

            {/* Mark as Completed Button */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <MarkAsCompletedButton moduleId={module.id} lessonId={lesson.id} />
            </div>

            {/* Materials Section */}
            <MaterialsSection />

            {/* Next Steps Card */}
            <div className="bg-gradient-to-br from-primary/10 to-background rounded-xl p-6 border border-primary/30">
              <h3 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">
                <span>✨</span>
                Próximos Passos
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Revê os pontos principais desta aula nas tuas notas</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Aplica pelo menos 1 técnica aprendida hoje</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Partilha o teu progresso no grupo privado</span>
                </li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Ver Todos os Módulos
              </Button>

              {nextLesson ? (
                <Button
                  onClick={() => navigate(`/${moduleSlug}/${nextLesson.id}`)}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Próxima Aula
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="gap-2 bg-green-500 hover:bg-green-600 text-white"
                >
                  Módulo Concluído! Ver Próximo
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar - Module Lessons */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 border border-border sticky top-24">
              <h3 className="font-bold text-lg text-foreground mb-4">
                Aulas deste Módulo
              </h3>
              
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold text-foreground">{module.progress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${module.progress}%` }}
                  />
                </div>
              </div>

              {/* Lessons List */}
              <div className="space-y-2">
                {module.lessons.map((l, index) => (
                  <button
                    key={l.id}
                    onClick={() => navigate(`/modulo/${moduleSlug}/aula/${l.id}`)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      l.id === lesson.id
                        ? 'bg-primary/20 border border-primary/50'
                        : 'bg-background hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        l.id === lesson.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm line-clamp-2 ${
                          l.id === lesson.id ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {l.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{l.duration}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-card rounded-2xl p-8 max-w-md mx-4 border border-primary/50 shadow-2xl animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Parabéns!</h2>
              <p className="text-muted-foreground mb-6">
                Completaste mais uma aula da tua jornada de reconquista!
              </p>
              {!isLastLesson && nextLesson && (
                <Button
                  onClick={() => navigate(`/modulo/${moduleSlug}/aula/${nextLesson.id}`)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Continuar para Próxima Aula
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lesson;
