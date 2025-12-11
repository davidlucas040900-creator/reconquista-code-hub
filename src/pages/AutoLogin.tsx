// src/pages/AutoLogin.tsx

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
        setMessage('Link inválido. Token não encontrado.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        // 1. Verificar se o token existe e é válido
        const { data: magicLink, error: linkError } = await supabase
          .from('magic_links')
          .select('*')
          .eq('token', token)
          .is('used_at', null)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (linkError || !magicLink) {
          setStatus('error');
          setMessage('Link expirado ou já utilizado. Faz login normalmente.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // 2. Buscar dados do usuário
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', magicLink.user_id)
          .single();

        if (profileError || !profile) {
          setStatus('error');
          setMessage('Usuário não encontrado.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // 3. Fazer login com a senha padrão
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: 'Reconquista@2026',
        });

        if (signInError) {
          console.error('Erro no auto-login:', signInError);
          setStatus('error');
          setMessage('Erro ao fazer login. Tenta manualmente.');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // 4. Marcar token como usado
        await supabase
          .from('magic_links')
          .update({ used_at: new Date().toISOString() })
          .eq('token', token);

        // 5. Sucesso!
        setStatus('success');
        setMessage('Acesso confirmado! A redirecionar...');
        toast.success('Bem-vinda à área de membros! 🎉');
        
        setTimeout(() => navigate('/dashboard'), 1500);

      } catch (error) {
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
        {/* Loading spinner */}
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto" />
        )}

        {/* Success icon */}
        {status === 'success' && (
          <div className="text-6xl animate-bounce">🎉</div>
        )}

        {/* Error icon */}
        {status === 'error' && (
          <div className="text-6xl">😕</div>
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
