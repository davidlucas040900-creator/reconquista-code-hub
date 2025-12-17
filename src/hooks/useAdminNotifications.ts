// src/hooks/useAdminNotifications.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useAdminNotifications() {
  const queryClient = useQueryClient();

  // Enviar notificação
  const sendNotificationMutation = useMutation({
    mutationFn: async ({
      recipientType,
      recipientId,
      title,
      body,
    }: {
      recipientType: 'single' | 'all' | 'course';
      recipientId?: string;
      title: string;
      body: string;
    }) => {
      // 1. Criar notificação no banco
      const { data: notification, error: notifError } = await supabase
        .from('notifications')
        .insert({
          title,
          message: body,
          type: recipientType === 'all' ? 'broadcast' : 'targeted',
          target_type: recipientType,
          target_id: recipientId || null,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (notifError) throw notifError;

      // 2. Determinar destinatários
      let targetUsers: string[] = [];

      if (recipientType === 'single' && recipientId) {
        targetUsers = [recipientId];
      } else if (recipientType === 'course' && recipientId) {
        const { data: courseUsers } = await supabase
          .from('user_courses')
          .select('user_id')
          .eq('course_id', recipientId);
        targetUsers = courseUsers?.map((u) => u.user_id) || [];
      } else if (recipientType === 'all') {
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id')
          .eq('has_full_access', true);
        targetUsers = allUsers?.map((u) => u.id) || [];
      }

      // 3. Criar user_notifications para cada destinatário
      if (targetUsers.length > 0 && notification) {
        const userNotifications = targetUsers.map((userId) => ({
          user_id: userId,
          notification_id: notification.id,
        }));

        const { error: userNotifError } = await supabase
          .from('user_notifications')
          .insert(userNotifications);

        if (userNotifError) {
          console.error('Erro ao criar user_notifications:', userNotifError);
        }
      }

      // 4. Registrar na tabela sent_notifications
      await supabase.from('sent_notifications').insert({
        recipient_type: recipientType,
        recipient_id: recipientId || null,
        title,
        body,
      });

      // 5. Logar ação do admin (opcional, ignorar erro)
      try {
        await supabase.from('admin_actions_log').insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'send_notification',
          target_type: 'notification',
          target_id: notification?.id,
          details: { title, recipientType, recipientCount: targetUsers.length },
        });
      } catch (e) {
        console.log('Log de ação falhou (não crítico):', e);
      }

      return { success: true, recipientCount: targetUsers.length };
    },
    onSuccess: (data) => {
      toast.success(`Notificação enviada para ${data.recipientCount} usuários!`);
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
    onError: (error) => {
      console.error('Erro ao enviar notificação:', error);
      toast.error('Erro ao enviar notificação');
    },
  });

  return {
    sendNotification: sendNotificationMutation.mutate,
    isSending: sendNotificationMutation.isPending,
  };
}