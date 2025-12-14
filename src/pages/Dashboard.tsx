import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
import { BottomNav } from '@/components/layout/BottomNav';
import { HeroCarousel } from '@/components/dashboard/HeroCarousel';
import { TopicFilter } from '@/components/dashboard/TopicFilter';
import { ProgressSection } from '@/components/dashboard/ProgressSection';
import { CourseSection } from '@/components/dashboard/CourseSection';
import { useCourses } from '@/hooks/useCourses';
import { useUserProgress } from '@/hooks/useUserProgress';
import { useAuth } from '@/contexts/AuthContext';

// Topics estáticos (não mudam)
const topics = [
  { id: 'all', name: 'Todos', icon: '', gradient: 'from-gold/20 to-gold/5' },
  { id: 'reconquista', name: 'Reconquista', icon: '', gradient: 'from-purple-500/20 to-purple-500/5' },
  { id: 'psicologia', name: 'Psicologia Masculina', icon: '', gradient: 'from-blue-500/20 to-blue-500/5' },
  { id: 'confianca', name: 'Confiança', icon: '', gradient: 'from-amber-500/20 to-amber-500/5' },
  { id: 'seducao', name: 'Sedução', icon: '', gradient: 'from-red-500/20 to-red-500/5' },
  { id: 'comunicacao', name: 'Comunicação', icon: '', gradient: 'from-green-500/20 to-green-500/5' },
  { id: 'sexo', name: 'Sexo', icon: '', gradient: 'from-pink-500/20 to-pink-500/5' },
];

export default function Dashboard() {
  const [activeTopic, setActiveTopic] = useState('all');
  const { user } = useAuth();
  
  //  Buscar cursos do Supabase
  const { data: courses, isLoading } = useCourses();
  
  //  Buscar progresso do usuário
  const { data: userProgress } = useUserProgress();

  // Filtrar cursos por tópico
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    if (activeTopic === 'all') return courses;
    
    // TODO: Adicionar campo 'topics' na tabela courses
    // Por enquanto retorna todos
    return courses;
  }, [activeTopic, courses]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header Fixo */}
      <Header />

      {/* WhatsApp FAB */}
      <WhatsAppFab />

      {/* Main Content */}
      <main className="pt-16 pb-24 md:pb-8">
        {/* Hero Carousel */}
        <HeroCarousel courses={filteredCourses || []} />

        {/* Topic Filter */}
        <TopicFilter
          topics={topics}
          activeTopic={activeTopic}
          onTopicChange={setActiveTopic}
        />

        {/* Progress Section */}
        <ProgressSection 
          user={user} 
          courses={courses || []} 
          userProgress={userProgress || []}
        />

        {/* Course Sections */}
        {filteredCourses?.map((course) => (
          <CourseSection 
            key={course.id} 
            course={course}
            userProgress={userProgress || []}
          />
        ))}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav />
    </div>
  );
}
