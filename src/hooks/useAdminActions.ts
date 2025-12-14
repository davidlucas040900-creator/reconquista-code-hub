// src/hooks/useAdminActions.ts

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useAdminActions() {
  const { user } = useAuth();

  const logAction = async (
    actionType: string,
    targetType: string,
    targetId: string,
    details?: Record<string, any>
  ) => {
    if (!user) return;

    await supabase.from('admin_actions_log').insert({
      admin_id: user.id,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      details: details || {},
    });
  };

  return { logAction };
}
