// src/hooks/useVideoProgress.ts

import { useCallback } from 'react';

interface VideoProgress {
  lessonId: string;
  courseSlug: string;
  moduleId: string;
  currentTime: number;
  duration: number;
  percentage: number;
  timestamp: number;
}

const STORAGE_KEY = 'reconquista_video_progress';
const LAST_LESSON_KEY = 'reconquista_last_lesson';

export function useVideoProgress() {
  // Salvar progresso do vídeo
  const saveProgress = useCallback((data: Omit<VideoProgress, 'timestamp'>) => {
    const progress: VideoProgress = {
      ...data,
      timestamp: Date.now(),
    };
    
    // Salvar progresso individual
    const allProgress = getAllProgress();
    allProgress[data.lessonId] = progress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
    
    // Salvar como última aula assistida
    localStorage.setItem(LAST_LESSON_KEY, JSON.stringify(progress));
  }, []);

  // Buscar progresso de uma aula específica
  const getProgress = useCallback((lessonId: string): VideoProgress | null => {
    const allProgress = getAllProgress();
    return allProgress[lessonId] || null;
  }, []);

  // Buscar última aula assistida
  const getLastLesson = useCallback((): VideoProgress | null => {
    try {
      const data = localStorage.getItem(LAST_LESSON_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  // Buscar todo o progresso
  const getAllProgress = (): Record<string, VideoProgress> => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  };

  // Limpar progresso
  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_LESSON_KEY);
  }, []);

  return {
    saveProgress,
    getProgress,
    getLastLesson,
    clearProgress,
  };
}
