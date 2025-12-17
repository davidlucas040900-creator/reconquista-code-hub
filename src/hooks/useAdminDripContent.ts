// src/hooks/useAdminDripContent.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============================================
// TIPOS
// ============================================

interface ModuleRelease {
  id: string;
  user_id: string;
  module_id: string;
  release_date: string;
  is_released: boolean;
  released_at: string | null;
  created_at: string;
  user?: { email: string; full_name: string | null };
  module?: { name: string; course_id: string };
}

interface LessonRelease {
  id: string;
  user_id: string;
  lesson_id: string;
  release_date: string;
  is_released: boolean;
  released_at: string | null;
  created_at: string;
  created_by: string | null;
  notes: string | null;
  user?: { email: string; full_name: string | null };
  lesson?: { title: string; module_id: string };
}

interface ScheduleModuleParams {
  userId: string;
  moduleId: string;
  releaseDate: string;
}

interface ScheduleLessonParams {
  userId: string;
  lessonId: string;
  releaseDate: string;
  notes?: string;
}

// ============================================
// HOOK PRINCIPAL — ADMIN
// ============================================

export function useAdminDripContent() {
  const queryClient = useQueryClient();

  // ------------------------------------------
  // QUERIES
  // ------------------------------------------

  // Listar liberações de MÓDULOS
  const {
    data: moduleReleases,
    isLoading: loadingModules,
  } = useQuery({
    queryKey: ['admin-module-releases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('module_releases')
        .select(`
          *,
          user:profiles!user_id(email, full_name),
          module:course_modules!module_id(name, course_id)
        `)
        .order('release_date', { ascending: true });

      if (error) throw error;
      return data as ModuleRelease[];
    },
  });

  // Listar liberações de AULAS
  const {
    data: lessonReleases,
    isLoading: loadingLessons,
  } = useQuery({
    queryKey: ['admin-lesson-releases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_releases')
        .select(`
          *,
          user:profiles!user_id(email, full_name),
          lesson:course_lessons!lesson_id(title, module_id)
        `)
        .order('release_date', { ascending: true });

      if (error) throw error;
      return data as LessonRelease[];
    },
  });

  // ------------------------------------------
  // MUTATIONS — MÓDULOS
  // ------------------------------------------

  // Agendar liberação de módulo
  const scheduleModuleMutation = useMutation({
    mutationFn: async ({ userId, moduleId, releaseDate }: ScheduleModuleParams) => {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('module_releases')
        .select('id')
        .eq('user_id', userId)
        .eq('module_id', moduleId)
        .single();

      if (existing) {
        throw new Error('Já existe uma liberação agendada para este módulo/usuário');
      }

      const { error } = await supabase.from('module_releases').insert({
        user_id: userId,
        module_id: moduleId,
        release_date: releaseDate,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module-releases'] });
      toast.success('Liberação de módulo agendada!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao agendar liberação');
    },
  });

  // Liberar módulo manualmente (agora)
  const releaseModuleNowMutation = useMutation({
    mutationFn: async ({ userId, moduleId }: { userId: string; moduleId: string }) => {
      const { error } = await supabase
        .from('module_releases')
        .update({
          is_released: true,
          released_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('module_id', moduleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module-releases'] });
      toast.success('Módulo liberado!');
    },
    onError: () => {
      toast.error('Erro ao liberar módulo');
    },
  });

  // Deletar agendamento de módulo
  const deleteModuleReleaseMutation = useMutation({
    mutationFn: async (releaseId: string) => {
      const { error } = await supabase
        .from('module_releases')
        .delete()
        .eq('id', releaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-module-releases'] });
      toast.success('Agendamento removido!');
    },
    onError: () => {
      toast.error('Erro ao remover agendamento');
    },
  });

  // ------------------------------------------
  // MUTATIONS — AULAS
  // ------------------------------------------

  // Agendar liberação de aula
  const scheduleLessonMutation = useMutation({
    mutationFn: async ({ userId, lessonId, releaseDate, notes }: ScheduleLessonParams) => {
      // Verificar se já existe
      const { data: existing } = await supabase
        .from('lesson_releases')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (existing) {
        throw new Error('Já existe uma liberação agendada para esta aula/usuário');
      }

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('lesson_releases').insert({
        user_id: userId,
        lesson_id: lessonId,
        release_date: releaseDate,
        notes: notes || null,
        created_by: user?.id || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-releases'] });
      toast.success('Liberação de aula agendada!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao agendar liberação');
    },
  });

  // Liberar aula manualmente (agora)
  const releaseLessonNowMutation = useMutation({
    mutationFn: async ({ userId, lessonId }: { userId: string; lessonId: string }) => {
      const { error } = await supabase
        .from('lesson_releases')
        .update({
          is_released: true,
          released_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-releases'] });
      toast.success('Aula liberada!');
    },
    onError: () => {
      toast.error('Erro ao liberar aula');
    },
  });

  // Deletar agendamento de aula
  const deleteLessonReleaseMutation = useMutation({
    mutationFn: async (releaseId: string) => {
      const { error } = await supabase
        .from('lesson_releases')
        .delete()
        .eq('id', releaseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-lesson-releases'] });
      toast.success('Agendamento removido!');
    },
    onError: () => {
      toast.error('Erro ao remover agendamento');
    },
  });

  // ------------------------------------------
  // RETORNO
  // ------------------------------------------

  return {
    // Dados
    moduleReleases: moduleReleases || [],
    lessonReleases: lessonReleases || [],
    isLoading: loadingModules || loadingLessons,

    // Ações - Módulos
    scheduleModule: scheduleModuleMutation.mutate,
    releaseModuleNow: releaseModuleNowMutation.mutate,
    deleteModuleRelease: deleteModuleReleaseMutation.mutate,

    // Ações - Aulas
    scheduleLesson: scheduleLessonMutation.mutate,
    releaseLessonNow: releaseLessonNowMutation.mutate,
    deleteLessonRelease: deleteLessonReleaseMutation.mutate,

    // Estados de loading
    isSchedulingModule: scheduleModuleMutation.isPending,
    isSchedulingLesson: scheduleLessonMutation.isPending,
  };
}

// ============================================
// HOOK PARA ALUNO — Verificar acesso
// ============================================

export function useUserDripAccess(userId: string | undefined) {
  // Buscar liberações do usuário
  const { data: userModuleReleases } = useQuery({
    queryKey: ['user-module-releases', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('module_releases')
        .select('module_id, release_date, is_released')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const { data: userLessonReleases } = useQuery({
    queryKey: ['user-lesson-releases', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('lesson_releases')
        .select('lesson_id, release_date, is_released')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Verificar se módulo está liberado
  const isModuleAccessible = (moduleId: string): { accessible: boolean; releaseDate?: string } => {
    if (!userModuleReleases || userModuleReleases.length === 0) {
      // Sem drip configurado = acesso livre
      return { accessible: true };
    }

    const release = userModuleReleases.find(r => r.module_id === moduleId);
    
    if (!release) {
      // Módulo não tem drip = acesso livre
      return { accessible: true };
    }

    if (release.is_released) {
      return { accessible: true };
    }

    const today = new Date().toISOString().split('T')[0];
    const releaseDate = release.release_date;

    if (releaseDate <= today) {
      return { accessible: true };
    }

    return { accessible: false, releaseDate };
  };

  // Verificar se aula está liberada
  const isLessonAccessible = (lessonId: string, moduleId: string): { accessible: boolean; releaseDate?: string } => {
    // Primeiro verificar se o módulo está acessível
    const moduleAccess = isModuleAccessible(moduleId);
    if (!moduleAccess.accessible) {
      return moduleAccess;
    }

    if (!userLessonReleases || userLessonReleases.length === 0) {
      return { accessible: true };
    }

    const release = userLessonReleases.find(r => r.lesson_id === lessonId);
    
    if (!release) {
      return { accessible: true };
    }

    if (release.is_released) {
      return { accessible: true };
    }

    const today = new Date().toISOString().split('T')[0];
    const releaseDate = release.release_date;

    if (releaseDate <= today) {
      return { accessible: true };
    }

    return { accessible: false, releaseDate };
  };

  return {
    isModuleAccessible,
    isLessonAccessible,
    moduleReleases: userModuleReleases || [],
    lessonReleases: userLessonReleases || [],
  };
}