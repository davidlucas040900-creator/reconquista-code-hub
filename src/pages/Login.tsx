// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Lock, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

type LoginMode = 'choose' | 'email-login' | 'request-access' | 'access-sent';

const Login = () => {
  const [mode, setMode] = useState<LoginMode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

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

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('request-access', {
        body: { email },
      });
      if (error) throw error;
      setMode('access-sent');
      toast.success('Link de acesso enviado para seu email!');
    } catch (error) {
      toast.error('Erro ao solicitar acesso');
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir-950 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTItMTZ2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yem0wIDR2Mmgydi0yaC0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />

      {/* Gradient Overlays */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-gold/20 to-gold/5 rounded-2xl border border-gold/20 backdrop-blur-xl">
              <Sparkles className="w-10 h-10 text-gold" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Reconquista
            </h1>
            <p className="text-gray-400">
              {mode === 'choose' && 'Como deseja acessar?'}
              {mode === 'email-login' && 'Entre com suas credenciais'}
              {mode === 'request-access' && 'Solicite seu link de acesso'}
              {mode === 'access-sent' && 'Verifique seu email'}
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

            {/* MODO: ESCOLHER */}
            {mode === 'choose' && (
              <div className="space-y-4">
                <button
                  onClick={() => setMode('email-login')}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 p-6 transition-all hover:from-gold/30 hover:to-gold/20 hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gold/20 rounded-lg">
                      <Lock className="w-6 h-6 text-gold" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Login com Senha
                      </h3>
                      <p className="text-sm text-gray-400">
                        Ja tenho cadastro
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gold group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => setMode('request-access')}
                  className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/[0.07] to-white/[0.02] border border-white/10 p-6 transition-all hover:from-white/[0.1] hover:to-white/[0.05] hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/10 rounded-lg">
                      <Mail className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="text-lg font-semibold text-white mb-1">
                        Link por Email
                      </h3>
                      <p className="text-sm text-gray-400">
                        Receba um link de acesso
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            )}

            {/* MODO: LOGIN COM SENHA */}
            {mode === 'email-login' && (
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-gold" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/20"
                      style={{ color: 'white', WebkitTextFillColor: 'white' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Senha</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-gold" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      required
                      className="pl-12 pr-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/20"
                      style={{ color: 'white', WebkitTextFillColor: 'white' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-gold to-yellow-600 text-noir-950 font-semibold hover:from-yellow-600 hover:to-gold transition-all shadow-lg shadow-gold/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMode('choose')}
                    className="w-full text-gray-400 hover:text-white"
                  >
                    Voltar
                  </Button>
                </div>
              </form>
            )}

            {/* MODO: SOLICITAR ACESSO */}
            {mode === 'request-access' && (
              <form onSubmit={handleRequestAccess} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-gold" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-gold focus:ring-2 focus:ring-gold/20"
                      style={{ color: 'white', WebkitTextFillColor: 'white' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Enviaremos um link magico para seu email
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-gold to-yellow-600 text-noir-950 font-semibold hover:from-yellow-600 hover:to-gold transition-all shadow-lg shadow-gold/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Solicitar Acesso
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setMode('choose')}
                    className="w-full text-gray-400 hover:text-white"
                  >
                    Voltar
                  </Button>
                </div>
              </form>
            )}

            {/* MODO: LINK ENVIADO */}
            {mode === 'access-sent' && (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full">
                  <Mail className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Email Enviado!
                  </h3>
                  <p className="text-gray-400">
                    Verifique sua caixa de entrada em<br />
                    <span className="text-gold font-medium">{email}</span>
                  </p>
                </div>
                <Button
                  onClick={() => setMode('choose')}
                  variant="outline"
                  className="w-full border-white/10 text-white hover:bg-white/5"
                >
                  Voltar ao inicio
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Precisa de ajuda?{' '}
            <a
              href="https://wa.me/258849999999"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Fale conosco
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
