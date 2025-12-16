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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const processedRef = useRef(false);

  const addLog = (msg: string) => {
    console.log(msg);
    setDebugLogs(prev => [...prev, msg]);
  };

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processAutoLogin = async () => {
      try {
        const token = searchParams.get('token');
        addLog('[AutoLogin] Iniciando...');

        if (!token) {
          addLog('[AutoLogin] Erro: Token nao encontrado');
          setStatus('error');
          setMessage('Link invalido. Token nao encontrado.');
          return;
        }

        addLog(`[AutoLogin] Token: ${token.substring(0, 20)}...`);

        // Limpar sessao local
        await supabase.auth.signOut();
        addLog('[AutoLogin] Sessao local limpa');

        // Validar token
        setMessage('Validando seu acesso...');

        const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-magic-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        addLog(`[AutoLogin] Resposta: ${JSON.stringify(data)}`);

        if (!data.success) {
          addLog(`[AutoLogin] Erro: ${data.error}`);
          setStatus('error');
          setMessage(data.error || 'Link expirado ou ja utilizado.');
          return;
        }

        // Verificar OTP
        setMessage('Entrando...');

        if (data.hashed_token && data.email) {
          addLog('[AutoLogin] Tentando verifyOtp...');
          
          const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
            email: data.email,
            token: data.hashed_token,
            type: 'email'
          });

          if (verifyError) {
            addLog(`[AutoLogin] Erro verifyOtp: ${verifyError.message}`);
            
            if (data.action_link) {
              addLog('[AutoLogin] Usando action_link como fallback');
              addLog(`[AutoLogin] Redirecionando para: ${data.action_link}`);
              
              // PAUSA DE 10 SEGUNDOS PARA COPIAR LOGS
              await new Promise(resolve => setTimeout(resolve, 10000));
              
              window.location.href = data.action_link;
              return;
            }
            
            setStatus('error');
            setMessage('Erro ao verificar acesso.');
            return;
          }

          if (verifyData?.session) {
            addLog('[AutoLogin] Sessao criada com sucesso!');
            setStatus('success');
            setMessage('Bem-vinda! Redirecionando...');
            toast.success('Login realizado com sucesso!');

            // PAUSA DE 10 SEGUNDOS PARA COPIAR LOGS
            await new Promise(resolve => setTimeout(resolve, 10000));

            window.location.href = '/dashboard';
            return;
          }
        }

        if (data.action_link) {
          addLog('[AutoLogin] Redirecionando via action_link');
          
          // PAUSA DE 10 SEGUNDOS PARA COPIAR LOGS
          await new Promise(resolve => setTimeout(resolve, 10000));
          
          window.location.href = data.action_link;
          return;
        }

        addLog('[AutoLogin] Nenhum metodo funcionou');
        setStatus('error');
        setMessage('Erro ao processar login.');

      } catch (error: any) {
        addLog(`[AutoLogin] Erro exception: ${error.message}`);
        setStatus('error');
        setMessage('Erro inesperado. Tente novamente.');
      }
    };

    processAutoLogin();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* UI Principal */}
        <div className="max-w-md mx-auto text-center space-y-8 mb-8">
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
                <span className="text-sm">Aguarde 10s para copiar logs...</span>
              </div>
            </div>
          )}
        </div>

        {/* Debug Logs */}
        <div className="bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto">
          <h3 className="text-white font-mono text-sm mb-2"> Debug Logs (copie tudo):</h3>
          <div className="space-y-1">
            {debugLogs.map((log, i) => (
              <div key={i} className="text-green-400 font-mono text-xs">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoLogin;
