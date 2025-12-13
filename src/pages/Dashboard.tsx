// src/pages/Dashboard.tsx

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { HeroCarousel } from '@/components/dashboard/HeroCarousel';
import { TopicFilter } from '@/components/dashboard/TopicFilter';
import { ProgressSection } from '@/components/dashboard/ProgressSection';
import { CourseSection } from '@/components/dashboard/CourseSection';
import { courses, topics, mockUser } from '@/data/mockData';

export default function Dashboard() {
  // Estado para filtrar MÓDULOS (não cursos)
  const [activeTopic, setActiveTopic] = useState('all');

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header Fixo */}
      <Header />

      {/* Main Content */}
      <main className="pt-16 pb-24 md:pb-8">
        
        {/*  HERO CAROUSEL  */}
        <HeroCarousel courses={courses} />

        {/*  PROGRESS SECTION  */}
        <ProgressSection user={mockUser} courses={courses} />

        {/*  FILTRO DE TÓPICOS - FILTRA MÓDULOS  */}
        <TopicFilter
          topics={topics}
          activeTopic={activeTopic}
          onTopicChange={setActiveTopic}
        />

        {/*  COURSE SECTIONS (Todos os cursos, módulos filtrados)  */}
        {courses.map((course) => (
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
