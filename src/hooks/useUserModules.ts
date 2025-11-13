import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserModule {
  id: string;
  user_id: string;
  module_number: number;
  module_name: string;
  release_date: string;
  is_released: boolean;
  is_completed: boolean;
  created_at: string;
}

export const useUserModules = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<UserModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setModules([]);
      setLoading(false);
      return;
    }

    const fetchModules = async () => {
      const { data, error } = await (supabase as any)
        .from('user_modules')
        .select('*')
        .eq('user_id', user.id)
        .order('module_number', { ascending: true });
      
      if (!error && data) {
        setModules(data as UserModule[]);
      }
      
      setLoading(false);
    };

    fetchModules();

    // Set up realtime subscription for module updates
    const channel = supabase
      .channel('user_modules_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_modules',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchModules();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markModuleComplete = async (moduleNumber: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_modules' as any)
      .update({ is_completed: true })
      .eq('user_id', user.id)
      .eq('module_number', moduleNumber);

    if (!error) {
      setModules(prev =>
        prev.map(m =>
          m.module_number === moduleNumber ? { ...m, is_completed: true } : m
        )
      );
    }
  };

  return {
    modules,
    loading,
    markModuleComplete,
  };
};
