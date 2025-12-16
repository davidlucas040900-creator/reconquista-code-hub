// src/integrations/supabase/client.ts
// Corrigido: 2025-01-XX - Configuracao de auth otimizada
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Limpar sessoes corrompidas APENAS se nao estiver em callback
const cleanCorruptedSessions = () => {
  // NAO limpar se estiver em /auth/callback
  if (window.location.pathname.includes('/auth/callback')) {
    console.log('[Supabase] Callback detectado, pulando limpeza');
    return;
  }

  // NAO limpar se houver tokens no hash (Magic Link chegando)
  if (window.location.hash.includes('access_token')) {
    console.log('[Supabase] Tokens no hash, pulando limpeza');
    return;
  }

  try {
    console.log('[Supabase] Verificando sessoes...');

    const keys = Object.keys(localStorage);
    let cleaned = false;

    keys.forEach(key => {
      if (key.includes('supabase.auth.token') || key.includes('sb-')) {
        try {
          const value = localStorage.getItem(key);
          if (!value) return;

          const parsed = JSON.parse(value);

          // Se expirou ha mais de 1 dia, remover
          if (parsed.expires_at) {
            const expiresAt = new Date(parsed.expires_at * 1000);
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (expiresAt < oneDayAgo) {
              console.log('[Supabase] Removendo sessao muito antiga');
              localStorage.removeItem(key);
              cleaned = true;
            }
          }

          // Se esta corrompida (sem campos essenciais), remover
          if (parsed.access_token === undefined && parsed.refresh_token === undefined) {
            // Verificar se e realmente um token de auth
            if (key.includes('auth') || key.includes('token')) {
              console.log('[Supabase] Removendo sessao corrompida');
              localStorage.removeItem(key);
              cleaned = true;
            }
          }
        } catch (e) {
          // JSON invalido - pode nao ser um token, ignorar
        }
      }
    });

    if (cleaned) {
      console.log('[Supabase] Sessoes antigas/corrompidas removidas');
    }
  } catch (e) {
    console.error('[Supabase] Erro ao limpar sessoes:', e);
  }
};

// Executar limpeza
cleanCorruptedSessions();

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});
