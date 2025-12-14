// src/pages/Dashboard.tsx

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { HeroCarousel } from '@/components/dashboard/HeroCarousel';
import { TopicFilter } from '@/components/dashboard/TopicFilter';
import { ProgressSection } from '@/components/dashboard/ProgressSection';
import { CourseSection } from '@/components/dashboard/CourseSection';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/contexts/AuthContext';

// Tópicos para filtro (estático por enquanto)
const topics = [
  { id: 'all', name: 'Todos', icon: '' },
  { id: 'reconquista', name: 'Reconquista', icon: '' },
  { id: 'seducao', name: 'Sedução', icon: '' },
  { id: 'psicologia', name: 'Psicologia', icon: '' },
  { id: 'comunicacao', name: 'Comunicação', icon: '' },
  { id: 'confianca', name: 'Confiança', icon: '' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { data: courses, isLoading, error } = useCourses();
  const [activeTopic, setActiveTopic] = useState('all');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>Erro ao carregar cursos</p>
          <p className="text-sm mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header Fixo */}
      <Header />

      {/* Main Content */}
      <main className="pt-16 pb-24 md:pb-8">

        {/* HERO CAROUSEL */}
        <HeroCarousel courses={courses || []} />

        {/* PROGRESS SECTION */}
        <ProgressSection courses={courses || []} />

        {/* FILTRO DE TÓPICOS */}
        <TopicFilter
          topics={topics}
          activeTopic={activeTopic}
          onTopicChange={setActiveTopic}
        />

        {/* COURSE SECTIONS */}
        {(courses || []).map((course) => (
          <CourseSection
            key={course.id}
            course={course}
            activeTopicFilter={activeTopic}
          />
        ))}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav />
    </div>
  );
}
