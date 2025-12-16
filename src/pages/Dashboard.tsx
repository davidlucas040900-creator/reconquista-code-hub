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

const topics = [
  { id: 'all', name: 'Todos', icon: '' },
  { id: 'reconquista', name: 'Reconquista', icon: '' },
  { id: 'seducao', name: 'Sedução', icon: '' },
  { id: 'sexo', name: 'Sexo', icon: '' },
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
        <div className="text-center px-4">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm md:text-base">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="text-center text-red-400 px-4">
          <p className="text-sm md:text-base">Erro ao carregar cursos</p>
          <p className="text-xs md:text-sm mt-2">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950">
      <Header />

      <main className="pt-16 pb-20 md:pb-8">
        <HeroCarousel courses={courses || []} />
        <ProgressSection courses={courses || []} />
        
        <TopicFilter
          topics={topics}
          activeTopic={activeTopic}
          onTopicChange={setActiveTopic}
        />

        <div className="space-y-2 md:space-y-4">
          {(courses || []).map((course) => (
            <CourseSection
              key={course.id}
              course={course}
              activeTopicFilter={activeTopic}
            />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
