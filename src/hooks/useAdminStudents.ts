// src/hooks/useAdminStudents.ts
// VERSÃO ACTUALIZADA - Usa funções RPC do Supabase

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Student {
  id: string;
  email: string;
  full_name: string | null;
  whatsapp: string | null;
  role: string;
  has_full_access: boolean;
  purchase_date: string | null;
  created_at: string;
  total_purchases: number;
  courses_count: number;
}

interface UserDetails {
  profile: any;
  purchases: any[];
  course_access: any[];
  magic_links: any[];
  access_logs: any[];
}

interface MagicLinkResult {
  success: boolean;
  token?: string;
  magic_link?: string;
  expires_at?: string;
  email?: string;
  message: string;
}

export function useAdminStudents() {
  const queryClient = useQueryClient();

  // ========================================
  // LISTAR UTILIZADORES (usa RPC)
  // ========================================
  const { data: students, isLoading, refetch } = useQuery({
    queryKey: ['admin-students'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_list_users', {
        p_limit: 500,
        p_offset: 0
      });

      if (error) {
        console.error('Erro admin_list_users:', error);
        throw error;
      }
      
      return data as Student[];
    },
  });

  // ========================================
  // PESQUISAR UTILIZADORES
  // ========================================
  const searchUsers = async (search: string): Promise<Student[]> => {
    const { data, error } = await supabase.rpc('admin_list_users', {
      p_search: search,
      p_limit: 50,
      p_offset: 0
    });

    if (error) throw error;
    return data as Student[];
  };

  // ========================================
  // DETALHES DO UTILIZADOR
  // ========================================
  const getUserDetails = async (userId: string): Promise<UserDetails | null> => {
    const { data, error } = await supabase.rpc('admin_get_user_details', {
      p_user_id: userId
    });

    if (error) {
      console.error('Erro admin_get_user_details:', error);
      return null;
    }
    
    return data as UserDetails;
  };

  // ========================================
  // BLOQUEAR/DESBLOQUEAR ACESSO
  // ========================================
  const toggleAccessMutation = useMutation({
    mutationFn: async ({ userId, hasAccess }: { userId: string; hasAccess: boolean }) => {
      const { data, error } = await supabase.rpc('admin_update_user', {
        p_user_id: userId,
        p_has_full_access: !hasAccess
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success('Acesso atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar acesso:', error);
      toast.error('Erro ao atualizar acesso');
    },
  });

  // ========================================
  // GERAR MAGIC LINK (NOVO!)
  // ========================================
  const generateMagicLinkMutation = useMutation({
    mutationFn: async ({ userId, expiryDays = 7 }: { userId: string; expiryDays?: number }): Promise<MagicLinkResult> => {
      const { data, error } = await supabase.rpc('admin_generate_magic_link', {
        p_user_id: userId,
        p_expiry_days: expiryDays
      });

      if (error) throw error;
      return data as MagicLinkResult;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Magic link gerado com sucesso!');
      } else {
        toast.error(data.message || 'Erro ao gerar link');
      }
    },
    onError: (error) => {
      console.error('Erro ao gerar magic link:', error);
      toast.error('Erro ao gerar magic link');
    },
  });

  // ========================================
  // DAR ACESSO A CURSO
  // ========================================
  const grantCourseAccessMutation = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { data, error } = await supabase.rpc('admin_grant_course_access', {
        p_user_id: userId,
        p_course_id: courseId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success(data?.message || 'Acesso ao curso concedido!');
    },
    onError: (error) => {
      console.error('Erro ao conceder acesso:', error);
      toast.error('Erro ao conceder acesso');
    },
  });

  // ========================================
  // REVOGAR ACESSO A CURSO
  // ========================================
  const revokeCourseAccessMutation = useMutation({
    mutationFn: async ({ userId, courseId }: { userId: string; courseId: string }) => {
      const { data, error } = await supabase.rpc('admin_revoke_course_access', {
        p_user_id: userId,
        p_course_id: courseId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success(data?.message || 'Acesso ao curso removido!');
    },
    onError: (error) => {
      console.error('Erro ao remover acesso:', error);
      toast.error('Erro ao remover acesso');
    },
  });

  // ========================================
  // CRIAR COMPRA MANUAL
  // ========================================
  const createPurchaseMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      productId, 
      amount = 0, 
      notes 
    }: { 
      userId: string; 
      productId: string; 
      amount?: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase.rpc('admin_create_purchase', {
        p_user_id: userId,
        p_product_id: productId,
        p_amount: amount,
        p_notes: notes
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success(data?.message || 'Compra criada com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar compra:', error);
      toast.error('Erro ao criar compra');
    },
  });

  // ========================================
  // ATUALIZAR UTILIZADOR
  // ========================================
  const updateUserMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      fullName, 
      whatsapp, 
      role 
    }: { 
      userId: string; 
      fullName?: string;
      whatsapp?: string;
      role?: string;
    }) => {
      const { data, error } = await supabase.rpc('admin_update_user', {
        p_user_id: userId,
        p_full_name: fullName,
        p_whatsapp: whatsapp,
        p_role: role
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      toast.success('Utilizador atualizado!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar utilizador:', error);
      toast.error('Erro ao atualizar utilizador');
    },
  });

  return {
    // Dados
    students,
    isLoading,
    
    // Funções de busca
    refetch,
    searchUsers,
    getUserDetails,
    
    // Mutations
    toggleAccess: toggleAccessMutation.mutate,
    toggleAccessAsync: toggleAccessMutation.mutateAsync,
    
    generateMagicLink: generateMagicLinkMutation.mutate,
    generateMagicLinkAsync: generateMagicLinkMutation.mutateAsync,
    isGeneratingMagicLink: generateMagicLinkMutation.isPending,
    
    grantCourseAccess: grantCourseAccessMutation.mutate,
    revokeCourseAccess: revokeCourseAccessMutation.mutate,
    
    createPurchase: createPurchaseMutation.mutate,
    
    updateUser: updateUserMutation.mutate,
  };
}
