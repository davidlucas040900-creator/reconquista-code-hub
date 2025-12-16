import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Crown } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[Callback] Iniciando...');
        
        // Extrair tokens do hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('[Callback] Tokens:', { 
          hasAccess: !!accessToken, 
          hasRefresh: !!refreshToken 
        });

        if (!accessToken || !refreshToken) {
          console.error('[Callback] Tokens não encontrados na URL');
          navigate('/login?error=no_tokens');
          return;
        }

        console.log('[Callback] Definindo sessão...');
        
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        console.log('[Callback] setSession resultado:', { 
          temData: !!data, 
          temSession: !!data?.session,
          temUser: !!data?.user,
          erro: error?.message 
        });

        if (error) {
          console.error('[Callback] Erro setSession:', error);
          navigate('/login?error=set_session_failed');
          return;
        }

        // FORÇAR REDIRECT IMEDIATAMENTE
        console.log('[Callback] Redirecionando AGORA...');
        
        // Método 1: window.location (mais confiável)
        setTimeout(() => {
          console.log('[Callback] Executando redirect...');
          window.location.href = '/dashboard';
        }, 500);

      } catch (error) {
        console.error('[Callback] Exception:', error);
        navigate('/login?error=callback_exception');
      }
    };

    handleCallback();
  }, [navigate]);

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
          <p className="text-gray-400">Processando autenticação...</p>
          <p className="text-gray-600 text-xs">Redirecionando em instantes...</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
