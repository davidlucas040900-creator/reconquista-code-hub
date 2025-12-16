// src/pages/Dashboard.tsx

import { useState, lazy, Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopicFilter } from '@/components/dashboard/TopicFilter';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

// Lazy load componentes pesados
const HeroCarousel = lazy(() => import('@/components/dashboard/HeroCarousel').then(m => ({ default: m.HeroCarousel })));
const ProgressSection = lazy(() => import('@/components/dashboard/ProgressSection').then(m => ({ default: m.ProgressSection })));
const CourseSection = lazy(() => import('@/components/dashboard/CourseSection').then(m => ({ default: m.CourseSection })));

const topics = [
  { id: 'all', name: 'Todos', icon: '' },
  { id: 'reconquista', name: 'Reconquista', icon: '' },
  { id: 'seducao', name: 'Sedução', icon: '' },
  { id: 'sexo', name: 'Sexo', icon: '' },
  { id: 'psicologia', name: 'Psicologia', icon: '' },
  { id: 'comunicacao', name: 'Comunicação', icon: '' },
  { id: 'confianca', name: 'Confiança', icon: '' },
];

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { data: courses, isLoading, error } = useCourses();
  const [activeTopic, setActiveTopic] = useState('all');

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
        {isLoading ? (
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
              <p className="text-gray-400 text-sm">Carregando cursos...</p>
            </div>
          </div>
        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            <HeroCarousel courses={courses || []} />
          </Suspense>
        )}

        {!isLoading && (
          <>
            <Suspense fallback={<LoadingSpinner />}>
              <ProgressSection courses={courses || []} />
            </Suspense>

            <TopicFilter
              topics={topics}
              activeTopic={activeTopic}
              onTopicChange={setActiveTopic}
            />

            <div className="space-y-2 md:space-y-4">
              {(courses || []).map((course, index) => (
                <Suspense key={course.id} fallback={<LoadingSpinner />}>
                  <CourseSection
                    course={course}
                    activeTopicFilter={activeTopic}
                  />
                </Suspense>
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
