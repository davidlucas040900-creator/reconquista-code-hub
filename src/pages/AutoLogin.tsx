import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Crown, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AutoLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando seu acesso...');

  useEffect(() => {
    const processAutoLogin = async () => {
      const token = searchParams.get('token');

      console.log('[AutoLogin] Iniciando com token:', token?.substring(0, 20) + '...');

      if (!token) {
        setStatus('error');
        setMessage('Link invalido. Token nao encontrado.');
        return;
      }

      try {
        setMessage('Validando seu acesso...');
        
        // Timeout de 15 segundos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        console.log('[AutoLogin] Chamando verify-magic-link...');
        
        const { data, error } = await supabase.functions.invoke('verify-magic-link', {
          body: { token }
        });

        clearTimeout(timeoutId);

        console.log('[AutoLogin] Resposta:', { data, error });

        if (error) {
          console.error('[AutoLogin] Erro na funcao:', error);
          setStatus('error');
          setMessage(error.message || 'Erro ao verificar o link.');
          return;
        }

        if (!data?.success) {
          console.log('[AutoLogin] Verificacao falhou:', data?.error);
          setStatus('error');
          setMessage(data?.error || 'Link expirado ou ja utilizado.');
          return;
        }

        // Sucesso! Redirecionar para o action_link
        if (data.action_link) {
          console.log('[AutoLogin] Redirecionando para action_link...');
          setStatus('success');
          setMessage('Acesso confirmado! Redirecionando...');
          
          // Pequeno delay para mostrar mensagem de sucesso
          setTimeout(() => {
            window.location.href = data.action_link;
          }, 500);
          return;
        }

        // Fallback - verificar sessao existente
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          console.log('[AutoLogin] Sessao existente encontrada');
          setStatus('success');
          setMessage('Acesso confirmado! Redirecionando...');
          toast.success('Bem-vinda de volta!');
          setTimeout(() => navigate('/dashboard'), 500);
          return;
        }

        // Nada funcionou
        setStatus('error');
        setMessage('Erro ao processar o acesso. Tente novamente.');

      } catch (error: any) {
        console.error('[AutoLogin] Erro geral:', error);
        
        if (error.name === 'AbortError') {
          setStatus('error');
          setMessage('A verificacao demorou muito. Tente novamente.');
        } else {
          setStatus('error');
          setMessage('Erro inesperado. Tente fazer login manual.');
        }
      }
    };

    processAutoLogin();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-semibold text-white">Reconquista</span>
        </div>

        {/* Status Icon */}
        <div className="relative inline-flex">
          {status === 'loading' && (
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            </div>
          )}

          {status === 'success' && (
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          )}

          {status === 'error' && (
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            {status === 'loading' && 'Processando...'}
            {status === 'success' && 'Bem-vinda!'}
            {status === 'error' && 'Ops!'}
          </h1>
          <p className="text-gray-400">{message}</p>
        </div>

        {/* Actions */}
        {status === 'error' && (
          <div className="space-y-4 pt-4">
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl"
            >
              Solicitar Novo Link
            </Button>

            <p className="text-gray-500 text-sm">
              Precisa de ajuda?{' '}
              <a
                href="https://wa.me/258849999999"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:underline"
              >
                Fale conosco
              </a>
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="pt-4">
            <div className="flex items-center justify-center gap-2 text-emerald-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Redirecionando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoLogin;
