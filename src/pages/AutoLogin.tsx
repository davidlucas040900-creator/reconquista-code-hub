import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AutoLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('A verificar o teu acesso...');

  useEffect(() => {
    const processAutoLogin = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Link invalido. Token nao encontrado.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // 1. Chamar Edge Function para validar token
        const { data, error } = await supabase.functions.invoke('verify-magic-link', {
          body: { token }
        });

        if (error) {
          console.error('Erro na funcao:', error);
          setStatus('error');
          setMessage('Link expirado ou ja utilizado.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        if (!data?.action_link) {
          setStatus('error');
          setMessage('Erro ao processar o link.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // 2. Extrair tokens do action_link
        const url = new URL(data.action_link);
        const hashParams = new URLSearchParams(url.hash.substring(1));
        
        const accessToken = hashParams.get('access_token') || url.searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || url.searchParams.get('refresh_token');

        if (!accessToken || !refreshToken) {
          // Se nao encontrar nos params, redirecionar para o action_link
          window.location.href = data.action_link;
          return;
        }

        // 3. Setar sessao no Supabase
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('Erro ao setar sessao:', sessionError);
          // Fallback: redirecionar para action_link
          window.location.href = data.action_link;
          return;
        }

        // 4. Sucesso!
        setStatus('success');
        setMessage('Acesso confirmado! A redirecionar...');
        toast.success(`Bem-vinda${data.user_name ? ', ' + data.user_name : ''}! `);

        setTimeout(() => navigate('/dashboard'), 1500);

      } catch (error: any) {
        console.error('Erro no auto-login:', error);
        setStatus('error');
        setMessage('Erro inesperado. Tenta novamente.');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    processAutoLogin();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-background/95">
      <div className="text-center space-y-6 p-8">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto" />
        )}

        {status === 'success' && (
          <div className="text-6xl animate-bounce"></div>
        )}

        {status === 'error' && (
          <div className="text-6xl"></div>
        )}

        <h1 className="text-2xl font-bold text-foreground">
          {status === 'loading' && 'A processar...'}
          {status === 'success' && 'Bem-vinda!'}
          {status === 'error' && 'Ops!'}
        </h1>

        <p className="text-muted-foreground">{message}</p>

        {status === 'error' && (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Ir para Login
          </button>
        )}
      </div>
    </div>
  );
};

export default AutoLogin;
