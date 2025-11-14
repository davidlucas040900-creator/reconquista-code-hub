import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getLessonData, getModuleLessons, getNextLesson, getPreviousLesson } from '@/data/lessons';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home, ChevronRight, CheckCircle2, Play } from 'lucide-react';
import { MarkAsCompletedButton } from '@/components/MarkAsCompletedButton';
import { MaterialsSection } from '@/components/MaterialsSection';
import { CelebrationModal } from '@/components/CelebrationModal';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

const Lesson = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [moduleNumber, setModuleNumber] = useState<number>(0);
  const [lessonNumber, setLessonNumber] = useState<number>(0);

  // ═══════════════════════════════════════════════════════════
  // EXTRAIR NÚMEROS DOS PARAMS (SUPORTA MÚLTIPLOS FORMATOS)
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    console.log('🔍 [Lesson] Params recebidos:', params);

    let moduleNum = 0;
    let lessonNum = 0;

    // FORMATO 1: /modulo/1/aula/2
    if (params.moduleId && params.lessonId) {
      moduleNum = parseInt(params.moduleId, 10);
      lessonNum = parseInt(params.lessonId, 10);
      console.log('✅ [Lesson] Formato detectado: /modulo/X/aula/Y');
    }
    // FORMATO 2: /reset-emocional/2 (slug/lessonId)
    else if (params.moduleSlug && params.lessonId) {
      // Mapear slug para número de módulo
      const slugToModuleMap: Record<string, number> = {
        'reset-emocional': 1,
        'mapa-mente-masculina': 2,
        'gatilhos-memoria-emocional': 3,
        'frase-5-palavras': 4,
        'primeiro-contato-estrategico': 5,
        'dominio-conversa': 6,
        'conquista-duradoura': 7,
      };
      
      moduleNum = slugToModuleMap[params.moduleSlug] || 0;
      lessonNum = parseInt(params.lessonId, 10);
      console.log('✅ [Lesson] Formato detectado: /slug/Y');
    }
    // FORMATO 3: /slug-modulo/slug-aula (extrair números)
    else if (params.moduleSlug && params.lessonSlug) {
      const moduleMatch = params.moduleSlug.match(/\d+/);
      const lessonMatch = params.lessonSlug?.match(/\d+/);
      
      moduleNum = moduleMatch ? parseInt(moduleMatch[0], 10) : 0;
      lessonNum = lessonMatch ? parseInt(lessonMatch[0], 10) : 0;
      console.log('✅ [Lesson] Formato detectado: /slug-X/slug-Y');
    }

    if (!moduleNum || !lessonNum) {
      console.error('❌ [Lesson] Não foi possível determinar módulo/aula');
      console.error('Params:', params);
      navigate('/dashboard');
      return;
    }

    console.log(`🔢 [Lesson] Buscando: Módulo ${moduleNum}, Aula ${lessonNum}`);

    const lessonData = getLessonData(moduleNum, lessonNum);

    if (!lessonData) {
      console.error('❌ [Lesson] Aula não encontrada na base de dados');
      navigate('/dashboard');
      return;
    }

    console.log('✅ [Lesson] Aula carregada:', lessonData);
    setCurrentLesson(lessonData);
    setModuleNumber(moduleNum);
    setLessonNumber(lessonNum);
  }, [params, navigate]);

  // ═══════════════════════════════════════════════════════════
  // PROTEÇÃO DE AUTENTICAÇÃO
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!loading && !user) {
      console.warn('⚠️ [Lesson] Usuário não autenticado, redirecionando...');
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // ═══════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════
  if (loading || !currentLesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando aula...</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // NAVEGAÇÃO ENTRE AULAS
  // ═══════════════════════════════════════════════════════════
  const nextLessonData = getNextLesson(moduleNumber, lessonNumber);
  const previousLessonData = getPreviousLesson(moduleNumber, lessonNumber);
  const moduleLessons = getModuleLessons(moduleNumber);

  // ═══════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════
  const handleVideoEnd = () => {
    console.log('🎬 [Lesson] Vídeo finalizado');
    if (!videoWatched) {
      setVideoWatched(true);
      setShowCelebration(true);
    }
  };

  const handleCloseWelcome = () => {
    setShowCelebration(false);
  };

  const handleNextLessonFromModal = () => {
    setShowCelebration(false);
    if (nextLessonData) {
      navigate(`/modulo/${nextLessonData.module}/aula/${nextLessonData.lesson}`);
    } else {
      navigate('/dashboard');
    }
  };

  // ═══════════════════════════════════════════════════════════
  // CONFIGURAÇÃO DO PLYR
  // ═══════════════════════════════════════════════════════════
  const plyrProps = {
    source: {
      type: 'video' as const,
      sources: [
        {
          src: currentLesson.videoId,
          provider: 'youtube' as const,
        },
      ],
    },
    options: {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings',
        'pip',
        'fullscreen'
      ],
      settings: ['quality', 'speed'],
      autoplay: false,
      hideControls: true,
      keyboard: { focused: true, global: false },
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
      },
    },
  };

  // ═══════════════════════════════════════════════════════════
  // DADOS DO MÓDULO (ESTÁTICOS)
  // ═══════════════════════════════════════════════════════════
  const moduleData = {
    1: { title: 'Reset Emocional', slug: 'reset-emocional' },
    2: { title: 'Mapa da Mente Masculina', slug: 'mapa-mente-masculina' },
    3: { title: 'Gatilhos da Memória Emocional', slug: 'gatilhos-memoria-emocional' },
    4: { title: 'A Frase de 5 Palavras', slug: 'frase-5-palavras' },
    5: { title: 'Primeiro Contato Estratégico', slug: 'primeiro-contato-estrategico' },
    6: { title: 'Domínio da Conversa', slug: 'dominio-conversa' },
    7: { title: 'Conquista Duradoura', slug: 'conquista-duradoura' },
  };

  const currentModule = moduleData[moduleNumber as keyof typeof moduleData];
  const moduleProgress = Math.round((lessonNumber / moduleLessons.length) * 100);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background">
      {/* Celebration Modal */}
      <CelebrationModal 
        isOpen={showCelebration}
        onClose={handleCloseWelcome}
        lessonTitle={currentLesson.title}
        onNextLesson={nextLessonData ? handleNextLessonFromModal : undefined}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-primary-foreground text-sm">
                CR
              </div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span>{currentModule?.title || `Módulo ${moduleNumber}`}</span>
                <span>•</span>
                <span>Aula {lessonNumber}</span>
                {currentLesson.isBonus && (
                  <>
                    <span>•</span>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded text-xs font-semibold">
                      BÓNUS
                    </span>
                  </>
                )}
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
                {currentLesson.title}
              </h1>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {currentLesson.description}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Módulo {moduleNumber}: {currentModule?.title}
                </span>
                <span>•</span>
                <span>Aula {lessonNumber} de {moduleLessons.length}</span>
              </div>
            </div>

            {/* Mark as Completed Button */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <MarkAsCompletedButton 
                moduleId={moduleNumber} 
                lessonId={lessonNumber} 
              />
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
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {previousLessonData ? (
                <Button
                  onClick={() => navigate(`/modulo/${previousLessonData.module}/aula/${previousLessonData.lesson}`)}
                  variant="outline"
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Aula Anterior
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Ver Todos os Módulos
                </Button>
              )}

              {nextLessonData ? (
                <Button
                  onClick={() => navigate(`/modulo/${nextLessonData.module}/aula/${nextLessonData.lesson}`)}
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
                  <span className="font-semibold text-foreground">{moduleProgress}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${moduleProgress}%` }}
                  />
                </div>
              </div>

              {/* Lessons List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {moduleLessons.map((lesson, index) => {
                  const isCurrentLesson = lesson.lesson === lessonNumber;
                  return (
                    <button
                      key={`${lesson.module}-${lesson.lesson}`}
                      onClick={() => navigate(`/modulo/${lesson.module}/aula/${lesson.lesson}`)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        isCurrentLesson
                          ? 'bg-primary/20 border border-primary/50 shadow-sm'
                          : 'bg-background hover:bg-muted border border-transparent hover:border-border'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrentLesson
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isCurrentLesson ? (
                            <Play className="w-3 h-3" fill="currentColor" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm line-clamp-2 ${
                            isCurrentLesson ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {lesson.title}
                          </p>
                          {lesson.isBonus && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded text-xs font-semibold">
                              BÓNUS
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info (Remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm">
          <p className="font-bold mb-2">🔍 Debug Info</p>
          <p>Params: {JSON.stringify(params)}</p>
          <p>Módulo: {moduleNumber} | Aula: {lessonNumber}</p>
          <p>VideoID: {currentLesson.videoId}</p>
          <p>Has Next: {nextLessonData ? '✅' : '❌'}</p>
          <p>Has Prev: {previousLessonData ? '✅' : '❌'}</p>
        </div>
      )}
    </div>
  );
};

export default Lesson;
