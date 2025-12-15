import { useEffect, useState } from 'react';
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

  useEffect(() => {
    const processAutoLogin = async () => {
      const token = searchParams.get('token');

      // Se ja tem hash na URL (retorno do Supabase), processar sessao
      const hash = window.location.hash;
      if (hash && hash.includes('access_token')) {
        console.log('[AutoLogin] Processando hash do Supabase...');
        setMessage('Finalizando login...');
        
        // O Supabase vai processar automaticamente
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session) {
          console.log('[AutoLogin] Sessao ativa!');
          setStatus('success');
          setMessage('Bem-vinda! Redirecionando...');
          toast.success('Login realizado com sucesso!');
          
          // Limpar hash e redirecionar
          window.history.replaceState(null, '', '/dashboard');
          setTimeout(() => navigate('/dashboard'), 500);
          return;
        }
        
        if (error) {
          console.log('[AutoLogin] Erro na sessao:', error.message);
        }
      }

      console.log('[AutoLogin] Token:', token?.substring(0, 20) + '...');

      if (!token) {
        setStatus('error');
        setMessage('Link invalido. Token nao encontrado.');
        return;
      }

      try {
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

        // Se temos action_link, redirecionar IMEDIATAMENTE
        if (data.action_link) {
          console.log('[AutoLogin] Redirecionando para action_link...');
          setStatus('success');
          setMessage('Acesso confirmado! Redirecionando...');
          
          // Redirecionar imediatamente sem delay
          window.location.href = data.action_link;
          return;
        }

        // Fallback: verificar sessao existente
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          setStatus('success');
          setMessage('Acesso confirmado! Redirecionando...');
          toast.success('Bem-vinda de volta!');
          setTimeout(() => navigate('/dashboard'), 500);
          return;
        }

        setStatus('error');
        setMessage('Erro ao processar o acesso. Solicite um novo link.');

      } catch (error: any) {
        console.error('[AutoLogin] Erro:', error);
        setStatus('error');
        setMessage('Erro inesperado. Tente novamente.');
      }
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
            <p className="text-gray-500 text-sm">
              Precisa de ajuda?{' '}
              <a href="https://wa.me/258849999999" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">
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
