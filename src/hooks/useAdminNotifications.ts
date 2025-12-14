// src/hooks/useAdminNotifications.ts

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAdminActions } from './useAdminActions';

export function useAdminNotifications() {
  const { logAction } = useAdminActions();

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
      // 1. Salvar no banco
      const { error: dbError } = await supabase.from('sent_notifications').insert({
        recipient_type: recipientType,
        recipient_id: recipientId,
        title,
        body,
      });

      if (dbError) throw dbError;

      // 2. Chamar edge function para enviar push notification
      const { error: fnError } = await supabase.functions.invoke('send-notification', {
        body: { recipientType, recipientId, title, body },
      });

      if (fnError) throw fnError;

      await logAction('send_notification', 'notification', recipientId || 'all', {
        title,
        recipientType,
      });
    },
    onSuccess: () => {
      toast.success('Notificação enviada!');
    },
    onError: () => {
      toast.error('Erro ao enviar notificação');
    },
  });

  return {
    sendNotification: sendNotificationMutation.mutate,
  };
}
