import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Crown } from 'lucide-react';

const AuthCallback = () => {
  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[Callback] Iniciando...');
        
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('[Callback] Tokens:', { hasAccess: !!accessToken, hasRefresh: !!refreshToken });

        if (!accessToken || !refreshToken) {
          console.error('[Callback] Sem tokens');
          window.location.href = '/login?error=no_tokens';
          return;
        }

        console.log('[Callback] Definindo sessão...');
        
        // NÃO AGUARDAR - Setar e redirecionar imediatamente
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        }).then(({ data, error }) => {
          console.log('[Callback] setSession concluído:', { temSession: !!data?.session, erro: error?.message });
        });

        // REDIRECIONAR IMEDIATAMENTE (não esperar perfil)
        console.log('[Callback] Redirecionando...');
        
        setTimeout(() => {
          console.log('[Callback] REDIRECT AGORA!');
          window.location.href = '/dashboard';
        }, 100);

      } catch (error) {
        console.error('[Callback] Erro:', error);
        window.location.href = '/login?error=exception';
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
          <p className="text-gray-400">Finalizando...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
