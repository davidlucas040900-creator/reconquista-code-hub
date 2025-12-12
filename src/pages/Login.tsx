// src/pages/Login.tsx - VERSÃO MINIMALISTA COM RELOGIN

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, ArrowRight } from 'lucide-react';

type LoginMode = 'choose' | 'email-login' | 'request-access' | 'access-sent';

const Login = () => {
  const [mode, setMode] = useState<LoginMode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Login com email e senha
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (!error) {
      toast.success('Bem-vinda de volta!');
      navigate('/dashboard');
    } else {
      toast.error('Email ou senha incorretos');
    }
    
    setIsLoading(false);
  };

  // Solicitar link de acesso (sem senha)
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-access`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMode('access-sent');
      } else {
        toast.error(data.error || 'Erro ao solicitar acesso');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background font-bold text-lg">
            CR
          </div>
          <h1 className="text-xl font-semibold text-foreground">
            Código da Reconquista
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Área de Membros
          </p>
        </div>

        {/* Escolha Inicial */}
        {mode === 'choose' && (
          <div className="space-y-4">
            <Button
              onClick={() => setMode('request-access')}
              className="w-full h-12 text-base font-medium"
            >
              <Mail className="mr-2 h-4 w-4" />
              Receber link de acesso
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setMode('email-login')}
              className="w-full h-12 text-base font-medium"
            >
              Entrar com senha
            </Button>
          </div>
        )}

        {/* Solicitar Link de Acesso */}
        {mode === 'request-access' && (
          <form onSubmit={handleRequestAccess} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Qual é o seu email?
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Enviar link de acesso
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => setMode('choose')}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar
            </button>
          </form>
        )}

        {/* Link Enviado */}
        {mode === 'access-sent' && (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Verifique seu email
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enviamos um link de acesso para<br />
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              O link expira em 24 horas
            </p>

            <button
              onClick={() => {
                setEmail('');
                setMode('choose');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Usar outro email
            </button>
          </div>
        )}

        {/* Login com Senha */}
        {mode === 'email-login' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Senha
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Entrar'
              )}
            </Button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('choose')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar
              </button>
              
              <button
                type="button"
                onClick={() => setMode('request-access')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Esqueci a senha
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Footer */}
      <p className="mt-12 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Código da Reconquista
      </p>
    </div>
  );
};

export default Login;
