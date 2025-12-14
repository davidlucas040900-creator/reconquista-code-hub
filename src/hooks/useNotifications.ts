// src/hooks/useNotifications.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  created_at: string;
  read_at?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Buscar notificações do usuário
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user?.id) return [];

      // Buscar notificações gerais e específicas para o usuário
      const { data: allNotifications } = await supabase
        .from('notifications')
        .select('*')
        .or(`target_type.eq.all,and(target_type.eq.user,target_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(20);

      // Buscar status de leitura
      const { data: readStatus } = await supabase
        .from('user_notifications')
        .select('notification_id, read_at')
        .eq('user_id', user.id);

      const readMap = new Map(readStatus?.map(r => [r.notification_id, r.read_at]));

      return (allNotifications || []).map(n => ({
        ...n,
        read_at: readMap.get(n.id) || undefined
      }));
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Atualiza a cada 1 minuto
  });

  // Marcar como lida
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!user?.id) return;

      await supabase
        .from('user_notifications')
        .upsert({
          user_id: user.id,
          notification_id: notificationId,
          read_at: new Date().toISOString()
        }, { onConflict: 'user_id,notification_id' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  // Marcar todas como lidas
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user?.id || !notifications) return;

      const unread = notifications.filter(n => !n.read_at);
      
      for (const n of unread) {
        await supabase
          .from('user_notifications')
          .upsert({
            user_id: user.id,
            notification_id: n.id,
            read_at: new Date().toISOString()
          }, { onConflict: 'user_id,notification_id' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = notifications?.filter(n => !n.read_at).length || 0;

  return {
    notifications: notifications || [],
    unreadCount,
    isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}
