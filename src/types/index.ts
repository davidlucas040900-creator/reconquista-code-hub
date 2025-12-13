// src/types/index.ts

export interface Module {
  id: string;
  title: string;
  description: string;
  image: string;
  lessonsCount: number;
  completedLessons: number;
  isLocked: boolean;
  order: number;
}

export interface Course {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  isPurchased: boolean;
  modules: Module[];
  topics: string[];
}

export interface UserProgress {
  odId: string;
  odSlug: string;
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  percentage: number;
}

export interface Topic {
  id: string;
  name: string;
  icon: string;
  gradient: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  purchasedCourses: string[];
  lastLesson?: {
    courseSlug: string;
    moduleId: string;
    lessonId: string;
    title: string;
  };
}
