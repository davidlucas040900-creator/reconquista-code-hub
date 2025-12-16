// src/data/mockData.ts

import { Course, Topic, User, UserProgress } from '@/types';

// 
// USUÁRIO MOCKADO
// 
export const mockUser: User = {
  id: '1',
  name: 'Maria',
  email: 'maria@email.com',
  purchasedCourses: ['codigo-reconquista'], // Apenas este comprado
  lastLesson: {
    courseSlug: 'codigo-reconquista',
    moduleId: 'm2',
    lessonId: 'l5',
    title: 'A Técnica do Silêncio Estratégico'
  }
};

// 
// TÓPICOS DE FILTRO
// 
export const topics: Topic[] = [
  { id: 'all', name: 'Todos', icon: '', gradient: 'from-gold/20 to-gold/5' },
  { id: 'reconquista', name: 'Reconquista', icon: '', gradient: 'from-purple-500/20 to-purple-500/5' },
  { id: 'psicologia', name: 'Psicologia Masculina', icon: '', gradient: 'from-blue-500/20 to-blue-500/5' },
  { id: 'confianca', name: 'Confiança', icon: '', gradient: 'from-amber-500/20 to-amber-500/5' },
  { id: 'seducao', name: 'Sedução', icon: '', gradient: 'from-red-500/20 to-red-500/5' },
  { id: 'comunicacao', name: 'Comunicação', icon: '', gradient: 'from-green-500/20 to-green-500/5' },
  { id: 'sexo', name: 'Sexo', icon: '', gradient: 'from-pink-500/20 to-pink-500/5' },
];

// 
// CURSOS COMPLETOS
// 
export const courses: Course[] = [
  {
    id: 'c1',
    slug: 'codigo-reconquista',
    name: 'Código da Reconquista',
    tagline: 'O método definitivo para reconquistar quem você ama',
    description: 'Aprende a parar de agir pela emoção e assume o controle.',
    heroImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    isPurchased: true,
    topics: ['reconquista', 'psicologia', 'comunicacao'],
    modules: [
      {
        id: 'm1',
        title: 'RESET EMOCIONAL',
        description: 'Aprende a parar de agir pela emoção e assume o controle.',
        image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
        lessonsCount: 8,
        completedLessons: 8,
        isLocked: false,
        order: 1
      },
      {
        id: 'm2',
        title: 'A ARTE DO SILÊNCIO',
        description: 'O poder do distanciamento estratégico na reconquista.',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        lessonsCount: 6,
        completedLessons: 4,
        isLocked: false,
        order: 2
      },
      {
        id: 'm3',
        title: 'RECONEXÃO MAGNÉTICA',
        description: 'Técnicas para reacender a atração de forma natural.',
        image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&q=80',
        lessonsCount: 7,
        completedLessons: 0,
        isLocked: false,
        order: 3
      },
      {
        id: 'm4',
        title: 'GATILHOS EMOCIONAIS',
        description: 'Como despertar emoções profundas e memoráveis.',
        image: 'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=80',
        lessonsCount: 5,
        completedLessons: 0,
        isLocked: false,
        order: 4
      },
      {
        id: 'm5',
        title: 'O REENCONTRO',
        description: 'Preparação para o momento decisivo do retorno.',
        image: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800&q=80',
        lessonsCount: 6,
        completedLessons: 0,
        isLocked: false,
        order: 5
      },
      {
        id: 'm6',
        title: 'BLINDAGEM DEFINITIVA',
        description: 'Como manter a relação forte para sempre.',
        image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80',
        lessonsCount: 7,
        completedLessons: 0,
        isLocked: false,
        order: 6
      },
    ]
  },
  {
    id: 'c2',
    slug: 'deusa-na-cama',
    name: 'A Deusa na Cama',
    tagline: 'Domine a arte da sedução e do prazer',
    description: 'Prepara-te para dominar o desejo e se tornar inesquecível.',
    heroImage: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1920&q=80',
    isPurchased: false,
    topics: ['seducao', 'sexo', 'confianca'],
    modules: [
      {
        id: 'dm1',
        title: 'MENTALIDADE DE DEUSA',
        description: 'Construa a autoconfiança inabalável.',
        image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&q=80',
        lessonsCount: 6,
        completedLessons: 0,
        isLocked: true,
        order: 1
      },
      {
        id: 'dm2',
        title: 'A ARTE DA SEDUÇÃO',
        description: 'Técnicas para despertar o desejo.',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
        lessonsCount: 8,
        completedLessons: 0,
        isLocked: true,
        order: 2
      },
      {
        id: 'dm3',
        title: 'PRAZER SEM LIMITES',
        description: 'Descubra o poder do prazer consciente.',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
        lessonsCount: 10,
        completedLessons: 0,
        isLocked: true,
        order: 3
      },
    ]
  },
  {
    id: 'c3',
    slug: 'santuario',
    name: 'O Santuário',
    tagline: 'O círculo exclusivo dos 1%',
    description: 'Bem-vinda ao Círculo do 1%. O teu poder é ilimitado.',
    heroImage: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1920&q=80',
    isPurchased: false,
    topics: ['confianca', 'psicologia', 'seducao'],
    modules: [
      {
        id: 'sm1',
        title: 'CÍRCULO INTERNO',
        description: 'Acesso ao grupo exclusivo de elite.',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
        lessonsCount: 4,
        completedLessons: 0,
        isLocked: true,
        order: 1
      },
      {
        id: 'sm2',
        title: 'MENTORIAS AO VIVO',
        description: 'Sessões semanais de transformação.',
        image: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&q=80',
        lessonsCount: 12,
        completedLessons: 0,
        isLocked: true,
        order: 2
      },
    ]
  }
];

// 
// PROGRESSO DO USUÁRIO
// 
export const userProgress: UserProgress[] = [
  {
    odId: 'c1',
    odSlug: 'codigo-reconquista',
    moduleId: 'm1',
    lessonId: 'l8',
    lessonTitle: 'Reset Completo',
    percentage: 100
  },
  {
    odId: 'c1',
    odSlug: 'codigo-reconquista',
    moduleId: 'm2',
    lessonId: 'l4',
    lessonTitle: 'A Técnica do Silêncio',
    percentage: 67
  }
];

// 
// HELPER FUNCTIONS
// 
export const getCourseProgress = (courseSlug: string): number => {
  const course = courses.find(c => c.slug === courseSlug);
  if (!course) return 0;
  
  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessonsCount, 0);
  const completedLessons = course.modules.reduce((sum, m) => sum + m.completedLessons, 0);
  
  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
};

export const getWelcomeMessage = (courseSlug: string): string => {
  const messages: Record<string, string> = {
    'codigo-reconquista': 'Bem-vinda à tua virada de jogo. O caminho da reconquista começa agora.',
    'deusa-na-cama': 'Bem-vinda, Deusa. Prepara-te para dominar o desejo.',
    'santuario': 'Bem-vinda ao Círculo do 1%. O teu poder é ilimitado.',
  };
  return messages[courseSlug] || 'Bem-vinda à sua jornada de transformação.';
};

