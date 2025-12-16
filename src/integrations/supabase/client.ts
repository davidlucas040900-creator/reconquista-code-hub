// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Limpar sessões corrompidas/antigas ANTES de criar o cliente
const cleanCorruptedSessions = () => {
  try {
    console.log('[Supabase] Verificando sessões...');
    
    const keys = Object.keys(localStorage);
    let cleaned = false;

    keys.forEach(key => {
      if (key.includes('supabase.auth.token')) {
        try {
          const value = localStorage.getItem(key);
          if (!value) return;

          const parsed = JSON.parse(value);
          
          // Se expirou, remover
          if (parsed.expires_at) {
            const expiresAt = new Date(parsed.expires_at * 1000);
            if (expiresAt < new Date()) {
              console.log('[Supabase] Removendo sessão expirada');
              localStorage.removeItem(key);
              cleaned = true;
            }
          }

          // Se está corrompida (sem campos essenciais), remover
          if (!parsed.access_token || !parsed.refresh_token) {
            console.log('[Supabase] Removendo sessão corrompida');
            localStorage.removeItem(key);
            cleaned = true;
          }
        } catch (e) {
          // JSON inválido = sessão corrompida
          console.log('[Supabase] Removendo sessão com JSON inválido');
          localStorage.removeItem(key);
          cleaned = true;
        }
      }
    });

    if (cleaned) {
      console.log('[Supabase] Sessões antigas removidas. Recarregando...');
      // Recarregar página uma vez para aplicar limpeza
      if (!sessionStorage.getItem('session_cleaned')) {
        sessionStorage.setItem('session_cleaned', 'true');
        window.location.reload();
      }
    }
  } catch (e) {
    console.error('[Supabase] Erro ao limpar sessões:', e);
  }
};

// Executar limpeza
cleanCorruptedSessions();

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: false
  }
});
