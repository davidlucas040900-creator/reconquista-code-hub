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
        
        // O Supabase processa automaticamente os tokens do hash
        // Aguardar um pouco para a sessão ser processada
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Callback] Erro ao obter sessão:', error);
          navigate('/login');
          return;
        }
        
        if (session) {
          console.log('[Callback] Sessão encontrada! Redirecionando...');
          window.location.href = '/dashboard';
        } else {
          console.log('[Callback] Nenhuma sessão encontrada');
          navigate('/login');
        }
      } catch (error) {
        console.error('[Callback] Erro:', error);
        navigate('/login');
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
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
        <p className="text-gray-400">Finalizando autenticação...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
