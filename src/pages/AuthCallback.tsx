import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Crown } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('[Callback] Iniciando...');
        console.log('[Callback] URL:', window.location.href);
        console.log('[Callback] Hash:', window.location.hash);
        console.log('[Callback] Search:', window.location.search);
        
        // MÉTODO 1: Tentar obter tokens do hash (#access_token=...)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        console.log('[Callback] Tokens no hash:', { 
          hasAccess: !!accessToken, 
          hasRefresh: !!refreshToken 
        });

        if (accessToken && refreshToken) {
          console.log('[Callback] Definindo sessão com tokens do hash...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('[Callback] Erro setSession:', error);
            navigate('/login?error=set_session_failed');
            return;
          }

          if (data.session) {
            console.log('[Callback] Sessão criada! Redirecionando...');
            window.location.href = '/dashboard';
            return;
          }
        }

        // MÉTODO 2: Tentar obter token OTP da query (?token=...)
        const queryParams = new URLSearchParams(window.location.search);
        const otpToken = queryParams.get('token');
        const type = queryParams.get('type');

        console.log('[Callback] Params na query:', { token: !!otpToken, type });

        if (otpToken && type === 'magiclink') {
          console.log('[Callback] Verificando OTP...');
          
          // Precisamos do email - buscar da Edge Function ou storage
          const email = sessionStorage.getItem('magic_link_email');
          
          if (email) {
            const { data, error } = await supabase.auth.verifyOtp({
              email,
              token: otpToken,
              type: 'magiclink'
            });

            if (error) {
              console.error('[Callback] Erro verifyOtp:', error);
            } else if (data.session) {
              console.log('[Callback] OTP verificado! Redirecionando...');
              window.location.href = '/dashboard';
              return;
            }
          }
        }

        // MÉTODO 3: Aguardar o Supabase processar automaticamente
        console.log('[Callback] Aguardando Supabase processar automaticamente...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('[Callback] Sessão encontrada após aguardar!');
          window.location.href = '/dashboard';
          return;
        }

        // MÉTODO 4: Retry após mais tempo
        console.log('[Callback] Retry após 3s...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        
        if (retrySession) {
          console.log('[Callback] Sessão encontrada no retry!');
          window.location.href = '/dashboard';
          return;
        }

        // Falhou em todos os métodos
        console.error('[Callback] Nenhum método funcionou. URL pode estar incorreta.');
        navigate('/login?error=no_session_created');

      } catch (error) {
        console.error('[Callback] Exception:', error);
        navigate('/login?error=callback_exception');
      }
    };

    handleCallback();
  }, [navigate, location]);

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
          <p className="text-gray-600 text-xs">Aguarde, pode levar até 10 segundos</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
