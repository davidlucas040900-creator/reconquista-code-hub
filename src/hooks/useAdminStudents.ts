// src/hooks/useAdminStudents.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminActions } from './useAdminActions';

export function useAdminStudents() {
  const queryClient = useQueryClient();
  const { logAction } = useAdminActions();

  // Listar todos os alunos
  const { data: students, isLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Bloquear/Desbloquear aluno
  const toggleAccessMutation = useMutation({
    mutationFn: async ({ userId, hasAccess }: { userId: string; hasAccess: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ has_full_access: !hasAccess })
        .eq('id', userId);

      if (error) throw error;

      await logAction(
        hasAccess ? 'block_student' : 'unblock_student',
        'user',
        userId
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success('Acesso atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar acesso');
    },
  });

  // Trocar senha do aluno
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) throw error;

      await logAction('reset_password', 'user', userId);
    },
    onSuccess: () => {
      toast.success('Senha alterada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao alterar senha');
    },
  });

  // Dar acesso a curso específico
  const grantCourseAccessMutation = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { error } = await supabase
        .from('user_course_access')
        .insert({ user_id: userId, course_id: courseId });

      if (error) throw error;

      await logAction('grant_course_access', 'user', userId, { courseId });
    },
    onSuccess: () => {
      toast.success('Acesso ao curso concedido!');
    },
    onError: () => {
      toast.error('Erro ao conceder acesso');
    },
  });

  // Remover acesso a curso
  const revokeCourseAccessMutation = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { error } = await supabase
        .from('user_course_access')
        .delete()
        .eq('user_id', userId)
        .eq('course_id', courseId);

      if (error) throw error;

      await logAction('revoke_course_access', 'user', userId, { courseId });
    },
    onSuccess: () => {
      toast.success('Acesso ao curso removido!');
    },
    onError: () => {
      toast.error('Erro ao remover acesso');
    },
  });

  // Bloquear módulo específico para um aluno
  const blockModuleMutation = useMutation({
    mutationFn: async ({
      userId,
      moduleId,
      reason,
    }: {
      userId: string;
      moduleId: string;
      reason?: string;
    }) => {
      const { error } = await supabase
        .from('user_module_blocks')
        .insert({ user_id: userId, module_id: moduleId, reason });

      if (error) throw error;

      await logAction('block_module', 'user', userId, { moduleId, reason });
    },
    onSuccess: () => {
      toast.success('Módulo bloqueado!');
    },
    onError: () => {
      toast.error('Erro ao bloquear módulo');
    },
  });

  // Desbloquear módulo
  const unblockModuleMutation = useMutation({
    mutationFn: async ({ userId, moduleId }: { userId: string; moduleId: string }) => {
      const { error } = await supabase
        .from('user_module_blocks')
        .delete()
        .eq('user_id', userId)
        .eq('module_id', moduleId);

      if (error) throw error;

      await logAction('unblock_module', 'user', userId, { moduleId });
    },
    onSuccess: () => {
      toast.success('Módulo desbloqueado!');
    },
    onError: () => {
      toast.error('Erro ao desbloquear módulo');
    },
  });

  return {
    students,
    isLoading,
    toggleAccess: toggleAccessMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    grantCourseAccess: grantCourseAccessMutation.mutate,
    revokeCourseAccess: revokeCourseAccessMutation.mutate,
    blockModule: blockModuleMutation.mutate,
    unblockModule: unblockModuleMutation.mutate,
  };
}
