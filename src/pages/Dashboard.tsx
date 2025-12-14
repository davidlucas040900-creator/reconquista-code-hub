// src/pages/Dashboard.tsx

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { HeroCarousel } from '@/components/dashboard/HeroCarousel';
import { TopicFilter } from '@/components/dashboard/TopicFilter';
import { ProgressSection } from '@/components/dashboard/ProgressSection';
import { CourseSection } from '@/components/dashboard/CourseSection';
import { courses, topics, mockUser } from '@/data/mockData';

export default function Dashboard() {
  // Estado para o filtro de tópicos ACIMA do Hero (controla o carousel)
  const [topicAbove, setTopicAbove] = useState('all');
  
  // Estado para o filtro de tópicos ABAIXO do Hero (controla os cursos)
  const [topicBelow, setTopicBelow] = useState('all');

  // Filtrar cursos para o Hero Carousel (filtro de cima)
  const filteredCoursesHero = useMemo(() => {
    if (topicAbove === 'all') return courses;
    return courses.filter(course => course.topics.includes(topicAbove));
  }, [topicAbove]);

  // Filtrar cursos para as seções abaixo (filtro de baixo)
  const filteredCoursesSections = useMemo(() => {
    if (topicBelow === 'all') return courses;
    return courses.filter(course => course.topics.includes(topicBelow));
  }, [topicBelow]);

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header Fixo */}
      <Header />

      {/* Main Content */}
      <main className="pt-16 pb-24 md:pb-8">
        
        {/*  FILTRO DE TÓPICOS - ACIMA DO HERO  */}
        <TopicFilter
          topics={topics}
          activeTopic={topicAbove}
          onTopicChange={setTopicAbove}
          label="Explorar Módulos"
        />

        {/*  HERO CAROUSEL  */}
        <HeroCarousel courses={filteredCoursesHero} />

        {/*  FILTRO DE TÓPICOS - ABAIXO DO HERO  */}
        <TopicFilter
          topics={topics}
          activeTopic={topicBelow}
          onTopicChange={setTopicBelow}
          label="Filtrar Cursos"
        />

        {/*  PROGRESS SECTION  */}
        <ProgressSection user={mockUser} courses={courses} />

        {/*  COURSE SECTIONS (Filtradas pelo tópico de baixo)  */}
        {filteredCoursesSections.map((course) => (
          <CourseSection key={course.id} course={course} />
        ))}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav />
    </div>
  );
}
