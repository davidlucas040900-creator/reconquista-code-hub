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

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processAutoLogin = async () => {
      try {
        const token = searchParams.get('token');
        console.log('[AutoLogin] Iniciando...');

        if (!token) {
          setStatus('error');
          setMessage('Link invalido. Token nao encontrado.');
          return;
        }

        // 1. Limpar sessao local existente
        await supabase.auth.signOut();
        console.log('[AutoLogin] Sessao local limpa');

        // 2. Validar token no backend
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

        // 3. Processar resposta baseado no metodo
        setMessage('Entrando na sua conta...');

        if (data.method === 'session' && data.access_token) {
          // Metodo direto com tokens
          const { error } = await supabase.auth.setSession({
            access_token: data.access_token,
            refresh_token: data.refresh_token
          });

          if (error) {
            console.error('[AutoLogin] Erro setSession:', error);
            setStatus('error');
            setMessage('Erro ao entrar. Tente novamente.');
            return;
          }

          console.log('[AutoLogin] Sessao definida com sucesso!');
          
        } else if (data.method === 'otp' && data.otp_token) {
          // Metodo OTP
          const { error } = await supabase.auth.verifyOtp({
            email: data.email,
            token: data.otp_token,
            type: 'magiclink'
          });

          if (error) {
            console.error('[AutoLogin] Erro verifyOtp:', error);
            setStatus('error');
            setMessage('Erro ao verificar acesso. Tente novamente.');
            return;
          }

          console.log('[AutoLogin] OTP verificado com sucesso!');
        } else {
          setStatus('error');
          setMessage('Resposta invalida do servidor.');
          return;
        }

        // 4. Sucesso
        setStatus('success');
        setMessage('Bem-vinda! Redirecionando...');
        toast.success('Login realizado com sucesso!');

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 800);

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
