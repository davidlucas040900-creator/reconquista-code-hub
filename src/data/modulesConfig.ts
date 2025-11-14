// Este arquivo faz a ponte entre modules.ts (UI) e lessons.ts (dados)

import { modules as modulesUI } from './modules';
import { getModuleLessons } from './lessons';

export interface ModuleConfig {
  id: number;
  number: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  duration: string;
  totalLessons: number;
  progress: number;
  badge: 'NOVO' | 'POPULAR' | 'MAIS VISTO' | 'RECOMENDADO' | null;
}

export const getModulesConfig = (): ModuleConfig[] => {
  return modulesUI.map(module => {
    const lessonsFromDB = getModuleLessons(module.id);
    
    return {
      id: module.id,
      number: module.id,
      title: module.title,
      slug: module.slug,
      description: module.description,
      thumbnail: module.thumbnail,
      duration: module.duration,
      totalLessons: lessonsFromDB.length || module.lessons.length,
      progress: module.progress,
      badge: module.badge as 'NOVO' | 'POPULAR' | null,
    };
  });
};

export const getModuleBySlug = (slug: string) => {
  return modulesUI.find(m => m.slug === slug);
};

export const getModuleById = (id: number) => {
  return modulesUI.find(m => m.id === id);
};
