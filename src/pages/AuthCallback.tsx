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
        
        // Aguardar o Supabase processar os tokens da URL (hash)
        // O detectSessionInUrl precisa de tempo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Tentar obter a sessão
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('[Callback] Sessão:', session ? 'encontrada' : 'não encontrada');
        console.log('[Callback] Erro:', error);
        
        if (error) {
          console.error('[Callback] Erro ao obter sessão:', error);
          navigate('/login?error=callback_failed');
          return;
        }
        
        if (session) {
          console.log('[Callback] Sessão confirmada! Email:', session.user.email);
          console.log('[Callback] Redirecionando para dashboard...');
          
          // Redirecionar com window.location para garantir reload completo
          window.location.href = '/dashboard';
        } else {
          console.log('[Callback] Nenhuma sessão encontrada após 2s');
          
          // Tentar mais uma vez após 3 segundos
          console.log('[Callback] Aguardando mais 3s...');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (retrySession) {
            console.log('[Callback] Sessão encontrada na retry!');
            window.location.href = '/dashboard';
          } else {
            console.log('[Callback] Sessão não criada. Redirecionando para login.');
            navigate('/login?error=no_session');
          }
        }
      } catch (error) {
        console.error('[Callback] Erro exception:', error);
        navigate('/login?error=exception');
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
          <p className="text-gray-400">Finalizando autenticação...</p>
          <p className="text-gray-600 text-xs">Aguarde alguns segundos</p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
