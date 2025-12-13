// src/pages/Dashboard.tsx

import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
import { BottomNav } from '@/components/layout/BottomNav';
import { HeroCarousel } from '@/components/dashboard/HeroCarousel';
import { TopicFilter } from '@/components/dashboard/TopicFilter';
import { ProgressSection } from '@/components/dashboard/ProgressSection';
import { CourseSection } from '@/components/dashboard/CourseSection';
import { courses, topics, mockUser } from '@/data/mockData';

export default function Dashboard() {
  const [activeTopic, setActiveTopic] = useState('all');

  // Filtrar cursos por tópico
  const filteredCourses = useMemo(() => {
    if (activeTopic === 'all') return courses;
    return courses.filter(course => course.topics.includes(activeTopic));
  }, [activeTopic]);

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header Fixo */}
      <Header />

      {/* WhatsApp FAB */}
      <WhatsAppFab />

      {/* Main Content */}
      <main className="pt-16 pb-24 md:pb-8">
        {/* Hero Carousel */}
        <HeroCarousel courses={filteredCourses} />

        {/* Topic Filter */}
        <TopicFilter
          topics={topics}
          activeTopic={activeTopic}
          onTopicChange={setActiveTopic}
        />

        {/* Progress Section */}
        <ProgressSection user={mockUser} courses={courses} />

        {/* Course Sections */}
        {filteredCourses.map((course) => (
          <CourseSection key={course.id} course={course} />
        ))}
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <BottomNav />
    </div>
  );
}
