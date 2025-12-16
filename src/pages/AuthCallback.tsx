// src/pages/AuthCallback.tsx
// Corrigido: 2025-01-XX - Aguarda setSession e persistência
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Crown } from 'lucide-react';

const AuthCallback = () => {
  const processedRef = useRef(false);

  useEffect(() => {
    // Evitar processamento duplo
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      try {
        console.log('[Callback] Iniciando processamento...');
        console.log('[Callback] URL:', window.location.href);

        // Extrair tokens do hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('[Callback] Tokens encontrados:', { 
          hasAccess: !!accessToken, 
          hasRefresh: !!refreshToken 
        });

        if (!accessToken || !refreshToken) {
          console.error('[Callback] Tokens nao encontrados na URL');
          window.location.replace('/login?error=no_tokens');
          return;
        }

        // CORRECAO: Aguardar setSession COMPLETAR
        console.log('[Callback] Definindo sessao...');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('[Callback] Erro ao definir sessao:', error.message);
          window.location.replace('/login?error=session_error');
          return;
        }

        if (!data.session) {
          console.error('[Callback] Sessao nao foi criada');
          window.location.replace('/login?error=no_session');
          return;
        }

        console.log('[Callback] Sessao criada com sucesso!');
        console.log('[Callback] User ID:', data.session.user.id);
        console.log('[Callback] Email:', data.session.user.email);

        // CORRECAO: Verificar se a sessao foi persistida
        const { data: checkSession } = await supabase.auth.getSession();
        
        if (!checkSession.session) {
          console.error('[Callback] Sessao nao foi persistida');
          // Tentar uma vez mais
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: retrySession } = await supabase.auth.getSession();
          if (!retrySession.session) {
            window.location.replace('/login?error=persist_failed');
            return;
          }
        }

        console.log('[Callback] Sessao verificada e persistida!');

        // CORRECAO: Aguardar um pouco para garantir persistencia no storage
        await new Promise(resolve => setTimeout(resolve, 300));

        // Limpar o hash da URL antes de redirecionar
        window.history.replaceState(null, '', window.location.pathname);

        // Redirecionar para o dashboard
        console.log('[Callback] Redirecionando para /dashboard...');
        window.location.replace('/dashboard');

      } catch (error) {
        console.error('[Callback] Erro inesperado:', error);
        window.location.replace('/login?error=exception');
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-semibold text-white">Reconquista</span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-gray-400">Autenticando...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
