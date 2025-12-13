// src/pages/Dashboard.tsx - DARK NOIR PREMIUM

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  ChevronRight, 
  ChevronLeft,
  Lock, 
  CheckCircle2, 
  Crown,
  Sparkles,
  Users,
  FileText,
  Clock,
  Zap
} from 'lucide-react';

// 
// TIPOS E INTERFACES
// 

interface Course {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  totalLessons: number;
  completedLessons: number;
  isPurchased: boolean;
  price?: number;
}

interface ContinueLesson {
  title: string;
  module: string;
  moduleNumber: number;
  lessonNumber: number;
  courseSlug: string;
  thumbnail: string;
}

// 
// COMPONENTES AUXILIARES
// 

const ProgressBar = ({ value, className = "" }: { value: number; className?: string }) => (
  <div className={`progress-gold ${className}`}>
    <div 
      className="progress-gold-fill" 
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

const ModuleCard = ({ 
  course, 
  onClick 
}: { 
  course: Course; 
  onClick: () => void;
}) => {
  const progress = course.totalLessons > 0 
    ? (course.completedLessons / course.totalLessons) * 100 
    : 0;

  return (
    <button
      onClick={onClick}
      className="carousel-item w-[280px] md:w-[320px] group"
    >
      <div className="card-interactive h-full">
        {/* Thumbnail */}
        <div className="aspect-video rounded-lg overflow-hidden mb-4 relative">
          <img 
            src={course.thumbnail || '/placeholder-course.jpg'} 
            alt={course.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {progress === 100 && (
            <div className="absolute top-2 right-2">
              <div className="badge-gold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Completo
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="heading-card mb-2 group-hover:text-gold transition-colors">
          {course.name}
        </h3>
        
        <p className="text-small mb-4">
          {course.completedLessons} de {course.totalLessons} aulas
        </p>

        {/* Progress */}
        <ProgressBar value={progress} />
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-silk-400">{Math.round(progress)}%</span>
          <ChevronRight className="h-4 w-4 text-silk-400 group-hover:text-gold group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </button>
  );
};

const UpsellCard = ({ 
  course, 
  onUnlock 
}: { 
  course: Course; 
  onUnlock: () => void;
}) => {
  const isPurchased = course.isPurchased;

  return (
    <div className="carousel-item w-[280px] md:w-[320px]">
      <div className={`card-noir h-full relative overflow-hidden ${!isPurchased ? 'grayscale' : ''}`}>
        {/* Thumbnail */}
        <div className="aspect-video rounded-lg overflow-hidden mb-4 relative">
          <img 
            src={course.thumbnail || '/placeholder-course.jpg'} 
            alt={course.name}
            className="w-full h-full object-cover"
          />
          
          {/* Locked Overlay */}
          {!isPurchased && (
            <div className="locked-overlay group cursor-pointer" onClick={onUnlock}>
              <div className="text-center">
                <Lock className="h-10 w-10 text-gold mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm text-silk-300">Clique para desbloquear</span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <h3 className="heading-card mb-2">{course.name}</h3>
        
        {!isPurchased ? (
          <button 
            onClick={onUnlock}
            className="w-full btn-royal flex items-center justify-center gap-2 mt-4"
          >
            <Zap className="h-4 w-4" />
            DESBLOQUEAR POR {course.price} MZN
          </button>
        ) : (
          <p className="text-small">{course.totalLessons} aulas disponíveis</p>
        )}
      </div>
    </div>
  );
};

const Carousel = ({ 
  title, 
  children,
  icon: Icon
}: { 
  title: string; 
  children: React.ReactNode;
  icon?: React.ElementType;
}) => {
  const scrollRef = useState<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef[0]) {
      const scrollAmount = 340;
      scrollRef[0].scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-5 w-5 text-gold" />}
          <h2 className="heading-section">{title}</h2>
        </div>
        
        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-noir-800 hover:bg-noir-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-noir-800 hover:bg-noir-700 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="carousel-container">
        <div 
          ref={(el) => { scrollRef[0] = el; }}
          className="carousel-track"
        >
          {children}
        </div>
      </div>
    </section>
  );
};

// 
// COMPONENTE PRINCIPAL
// 

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<{ full_name?: string } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [upsells, setUpsells] = useState<Course[]>([]);
  const [continueLesson, setContinueLesson] = useState<ContinueLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [selectedUpsell, setSelectedUpsell] = useState<Course | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadDashboardData();
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

      // Dados simulados - substituir por dados reais do Supabase
      setCourses([
        {
          id: '1',
          name: 'Módulo 1: O Despertar',
          slug: 'codigo-reconquista',
          thumbnail: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400',
          totalLessons: 8,
          completedLessons: 8,
          isPurchased: true,
        },
        {
          id: '2',
          name: 'Módulo 2: A Arte do Silêncio',
          slug: 'codigo-reconquista',
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          totalLessons: 6,
          completedLessons: 4,
          isPurchased: true,
        },
        {
          id: '3',
          name: 'Módulo 3: Reconexão',
          slug: 'codigo-reconquista',
          thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400',
          totalLessons: 7,
          completedLessons: 0,
          isPurchased: true,
        },
      ]);

      setUpsells([
        {
          id: 'up1',
          name: 'A Deusa na Cama',
          slug: 'deusa-na-cama',
          thumbnail: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=400',
          totalLessons: 40,
          completedLessons: 0,
          isPurchased: false,
          price: 297,
        },
        {
          id: 'up2',
          name: 'O Santuário',
          slug: 'santuario',
          thumbnail: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400',
          totalLessons: 24,
          completedLessons: 0,
          isPurchased: false,
          price: 197,
        },
      ]);

      setContinueLesson({
        title: 'A Técnica do Silêncio Estratégico',
        module: 'A Arte do Silêncio',
        moduleNumber: 2,
        lessonNumber: 5,
        courseSlug: 'codigo-reconquista',
        thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      });

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpsell = (course: Course) => {
    setSelectedUpsell(course);
    setShowUpsellModal(true);
  };

  // Calcular progresso geral
  const totalLessons = courses.reduce((sum, c) => sum + c.totalLessons, 0);
  const completedLessons = courses.reduce((sum, c) => sum + c.completedLessons, 0);
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-silk-300">Preparando sua experiência...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950">
      {/*  HEADER  */}
      <header className="sticky top-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="font-playfair text-xl font-bold text-gold">
              RECONQUISTA
            </h1>
            
            <nav className="hidden md:flex items-center gap-6">
              <button className="btn-ghost flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Dashboard
              </button>
              <button 
                onClick={() => navigate('/cursos')}
                className="btn-ghost flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Cursos
              </button>
              <button className="btn-ghost flex items-center gap-2 relative">
                <Users className="h-4 w-4" />
                Comunidade
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-royal rounded-full" />
              </button>
            </nav>

            <button 
              onClick={() => signOut()}
              className="text-silk-400 hover:text-silk-100 text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/*  MAIN CONTENT  */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/*  HERO SECTION  */}
        <section className="mb-12">
          <div className="glass-card p-8 md:p-12 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-br from-gold via-transparent to-royal" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
              {/* Text Content */}
              <div className="flex-1">
                <p className="text-gold text-sm font-medium tracking-wider uppercase mb-2">
                   Bem-vinda de volta
                </p>
                <h2 className="heading-display mb-4">
                  Olá, <span className="text-gold-gradient">{profile?.full_name || 'Deusa'}</span>
                </h2>
                <p className="text-body mb-6 max-w-lg">
                  Continue sua jornada de transformação. Cada aula te aproxima 
                  mais da versão mais poderosa de si mesma.
                </p>

                {continueLesson && (
                  <button
                    onClick={() => navigate(`/curso/${continueLesson.courseSlug}`)}
                    className="btn-gold flex items-center gap-3 group"
                  >
                    <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span>CONTINUAR: Módulo {continueLesson.moduleNumber}, Aula {continueLesson.lessonNumber}</span>
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 md:gap-8">
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-playfair font-bold text-gold">
                    {completedLessons}
                  </p>
                  <p className="text-small">Aulas Completas</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl md:text-4xl font-playfair font-bold text-silk-100">
                    {totalLessons - completedLessons}
                  </p>
                  <p className="text-small">Restantes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  PROGRESS BAR GLOBAL  */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-3">
            <p className="text-body flex items-center gap-2">
              <Crown className="h-4 w-4 text-gold" />
              Jornada da Deusa
            </p>
            <p className="text-gold font-semibold">{Math.round(overallProgress)}% Completa</p>
          </div>
          <ProgressBar value={overallProgress} className="h-2" />
        </section>

        {/*  CARROSSEL: MÓDULOS PRINCIPAIS  */}
        <Carousel title="O Código da Reconquista" icon={Sparkles}>
          {courses.map((course) => (
            <ModuleCard
              key={course.id}
              course={course}
              onClick={() => navigate(`/curso/${course.slug}`)}
            />
          ))}
        </Carousel>

        {/*  CARROSSEL: UPSELLS  */}
        <Carousel title="Expanda Seu Poder" icon={Zap}>
          {upsells.map((course) => (
            <UpsellCard
              key={course.id}
              course={course}
              onUnlock={() => handleOpenUpsell(course)}
            />
          ))}
        </Carousel>

        {/*  QUICK ACTIONS  */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {[
            { icon: FileText, label: 'Materiais', onClick: () => navigate('/materiais') },
            { icon: Users, label: 'Comunidade', onClick: () => window.open('https://chat.whatsapp.com/xyz') },
            { icon: Crown, label: 'Meu Plano', onClick: () => navigate('/meu-plano') },
            { icon: Clock, label: 'Suporte', onClick: () => window.open('https://wa.me/258834569225') },
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="card-interactive flex flex-col items-center justify-center py-6 gap-3"
            >
              <item.icon className="h-6 w-6 text-gold" />
              <span className="text-small">{item.label}</span>
            </button>
          ))}
        </section>
      </main>

      {/*  BOTTOM NAVIGATION (MOBILE)  */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/5 md:hidden z-50">
        <div className="flex items-center justify-around py-3">
          {[
            { icon: Crown, label: 'Início', path: '/dashboard', active: true },
            { icon: Sparkles, label: 'Cursos', path: '/cursos' },
            { icon: Users, label: 'Comunidade', path: '/comunidade' },
            { icon: FileText, label: 'Perfil', path: '/perfil' },
          ].map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                item.active ? 'text-gold' : 'text-silk-400 hover:text-silk-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/*  MODAL DE UPSELL  */}
      {showUpsellModal && selectedUpsell && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowUpsellModal(false)}
          />
          
          {/* Modal Content */}
          <div className="glass-card max-w-lg w-full p-8 relative z-10 animate-in">
            <button
              onClick={() => setShowUpsellModal(false)}
              className="absolute top-4 right-4 text-silk-400 hover:text-silk-100"
            >
              
            </button>

            <div className="text-center mb-6">
              <span className="badge-royal mb-4 inline-block">OFERTA EXCLUSIVA</span>
              <h3 className="heading-section mb-2">{selectedUpsell.name}</h3>
              <p className="text-body">
                Desbloqueie agora e leve sua transformação ao próximo nível.
              </p>
            </div>

            {/* Video placeholder */}
            <div className="aspect-video bg-noir-800 rounded-lg mb-6 flex items-center justify-center">
              <Play className="h-12 w-12 text-gold" />
            </div>

            <button className="w-full btn-royal text-lg py-4">
              DESBLOQUEAR POR {selectedUpsell.price} MZN
            </button>

            <p className="text-center text-small mt-4">
               Compra 100% Segura
            </p>
          </div>
        </div>
      )}

      {/* Spacer para mobile bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
