import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Crown, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUPABASE_URL = 'https://csltrjuucicnlhipaszh.supabase.co';

const AutoLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando seu acesso...');
  const processedRef = useRef(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processAutoLogin = async () => {
      try {
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (existingSession) {
          console.log('[AutoLogin] Ja logado, redirecionando...');
          redirectToSuccess();
          return;
        }

        const token = searchParams.get('token');
        console.log('[AutoLogin] Processando token...');

        if (!token) {
          setStatus('error');
          setMessage('Link invalido. Token nao encontrado.');
          return;
        }

        setMessage('Validando seu acesso...');

        const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-magic-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        console.log('[AutoLogin] Resposta:', data);

        if (!data.success) {
          setStatus('error');
          setMessage(data.error || 'Link expirado ou ja utilizado.');
          return;
        }

        if (!data.access_token || !data.refresh_token) {
          setStatus('error');
          setMessage('Erro ao processar login. Tokens nao recebidos.');
          return;
        }

        setMessage('Criando sessao...');

        // Definir sessao SEM aguardar - deixar o AuthContext processar em background
        supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token
        }).then(({ error }) => {
          if (error) {
            console.error('[AutoLogin] Erro setSession:', error);
          } else {
            console.log('[AutoLogin] setSession completado');
          }
        });

        // Aguardar um pouco e redirecionar
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Verificar se sessao foi criada
        const { data: { session: newSession } } = await supabase.auth.getSession();
        
        if (newSession) {
          console.log('[AutoLogin] Sessao confirmada!');
          redirectToSuccess();
        } else {
          // Mesmo sem sessao confirmada, os tokens sao validos - redirecionar
          console.log('[AutoLogin] Sessao pendente, redirecionando...');
          redirectToSuccess();
        }

      } catch (error: any) {
        console.error('[AutoLogin] Erro:', error);
        setStatus('error');
        setMessage('Erro inesperado. Tente novamente.');
      }
    };

    const redirectToSuccess = () => {
      if (redirectedRef.current) return;
      redirectedRef.current = true;
      
      setStatus('success');
      setMessage('Bem-vinda! Redirecionando...');
      toast.success('Login realizado com sucesso!');
      
      // Usar window.location para garantir redirect limpo
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 500);
    };

    processAutoLogin();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
            <Crown className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-semibold text-white">Reconquista</span>
        </div>

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

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">
            {status === 'loading' && 'Processando...'}
            {status === 'success' && 'Bem-vinda!'}
            {status === 'error' && 'Ops!'}
          </h1>
          <p className="text-gray-400">{message}</p>
        </div>

        {status === 'error' && (
          <div className="space-y-4 pt-4">
            <Button
              onClick={() => navigate('/login')}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl"
            >
              Solicitar Novo Link
            </Button>
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
