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

      console.log('=== AUTO LOGIN INICIADO ===');
      console.log('Token recebido:', token);

      if (!token) {
        setStatus('error');
        setMessage('Link invalido. Token nao encontrado.');
        return;
      }

      try {
        // 1. Buscar token na tabela magic_links (SEM RLS - usando select direto)
        console.log('Buscando token na tabela magic_links...');
        
        const { data: magicLink, error: linkError } = await supabase
          .from('magic_links')
          .select('*')
          .eq('token', token)
          .maybeSingle();

        console.log('Resultado da busca:', { magicLink, linkError });

        if (linkError) {
          console.error('Erro ao buscar token:', linkError);
          setStatus('error');
          setMessage('Erro ao verificar o link. Tente novamente.');
          return;
        }

        if (!magicLink) {
          console.log('Token nao encontrado na tabela');
          setStatus('error');
          setMessage('Link nao encontrado. Solicite um novo acesso.');
          return;
        }

        // 2. Verificar se ja foi usado
        if (magicLink.used_at) {
          console.log('Token ja foi usado em:', magicLink.used_at);
          setStatus('error');
          setMessage('Este link ja foi utilizado. Solicite um novo.');
          return;
        }

        // 3. Verificar se expirou
        const expiresAt = new Date(magicLink.expires_at);
        const now = new Date();
        console.log('Expira em:', expiresAt, 'Agora:', now);
        
        if (expiresAt < now) {
          console.log('Token expirado');
          setStatus('error');
          setMessage('Este link expirou. Solicite um novo.');
          return;
        }

        // 4. Buscar email do usuario
        console.log('Buscando perfil do usuario:', magicLink.user_id);
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', magicLink.user_id)
          .maybeSingle();

        console.log('Perfil encontrado:', { profile, profileError });

        if (profileError || !profile?.email) {
          console.error('Usuario nao encontrado');
          setStatus('error');
          setMessage('Usuario nao encontrado. Entre em contato com o suporte.');
          return;
        }

        // 5. Fazer login com senha padrao
        console.log('Tentando login com:', profile.email);
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: 'Reconquista@2026',
        });

        console.log('Resultado do login:', { signInData, signInError });

        if (signInError) {
          console.error('Erro no login com senha:', signInError);
          setStatus('error');
          setMessage('Erro ao fazer login. Use o login manual com sua senha.');
          return;
        }

        // 6. Marcar token como usado
        console.log('Marcando token como usado...');
        
        const { error: updateError } = await supabase
          .from('magic_links')
          .update({ used_at: new Date().toISOString() })
          .eq('token', token);

        if (updateError) {
          console.warn('Aviso: Nao foi possivel marcar token como usado:', updateError);
        }

        // 7. Sucesso!
        console.log('=== LOGIN REALIZADO COM SUCESSO ===');
        setStatus('success');
        setMessage('Acesso confirmado! Redirecionando...');
        
        const firstName = profile.full_name?.split(' ')[0] || '';
        toast.success(`Bem-vinda${firstName ? ', ' + firstName : ''}!`);

        setTimeout(() => navigate('/dashboard'), 1500);

      } catch (error: any) {
        console.error('Erro geral no auto-login:', error);
        setStatus('error');
        setMessage('Erro inesperado. Tente fazer login manual.');
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
              Ir para Login
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
