// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, Crown, ChevronLeft, CheckCircle2, Sparkles } from 'lucide-react';

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
      toast.success('Link de acesso enviado!');
    } catch (error) {
      toast.error('Erro ao solicitar acesso');
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <Crown className="w-5 h-5 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] relative flex">
      
      {/* Lado Esquerdo - Branding (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image com Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0B] via-[#0A0A0B]/80 to-amber-900/20" />
        
        {/* Elementos Decorativos */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        
        {/* Conteudo */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-semibold text-white">Reconquista</span>
          </div>
          
          {/* Texto Principal */}
          <div className="space-y-6 max-w-md">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Sua jornada de
              <span className="block bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                transformacao
              </span>
              comeca aqui.
            </h1>
            <p className="text-gray-400 text-lg">
              Acesse sua area exclusiva e descubra o poder que existe dentro de voce.
            </p>
            
            {/* Features */}
            <div className="space-y-3 pt-4">
              {['Conteudo exclusivo', 'Suporte dedicado', 'Resultados comprovados'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Rodape */}
          <p className="text-gray-600 text-sm">
            2025 Reconquista. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          
          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-semibold text-white">Reconquista</span>
          </div>

          {/* Card do Formulario */}
          <div className="space-y-8">
            
            {/* Header */}
            <div className="space-y-2">
              {mode !== 'choose' && (
                <button
                  onClick={() => setMode('choose')}
                  className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors mb-4 group"
                >
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm">Voltar</span>
                </button>
              )}
              
              <h2 className="text-2xl lg:text-3xl font-bold text-white">
                {mode === 'choose' && 'Bem-vinda de volta'}
                {mode === 'email-login' && 'Entrar na conta'}
                {mode === 'request-access' && 'Acesso rapido'}
                {mode === 'access-sent' && 'Email enviado!'}
              </h2>
              <p className="text-gray-500">
                {mode === 'choose' && 'Escolha como deseja acessar sua conta'}
                {mode === 'email-login' && 'Digite suas credenciais para continuar'}
                {mode === 'request-access' && 'Enviaremos um link magico para voce'}
                {mode === 'access-sent' && 'Verifique sua caixa de entrada'}
              </p>
            </div>

            {/* MODO: ESCOLHER */}
            {mode === 'choose' && (
              <div className="space-y-4">
                <button
                  onClick={() => setMode('email-login')}
                  className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-[1px] transition-all hover:shadow-lg hover:shadow-amber-500/25"
                >
                  <div className="relative bg-[#0A0A0B] rounded-2xl p-5 transition-all group-hover:bg-[#0A0A0B]/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-white">Entrar com senha</h3>
                          <p className="text-sm text-gray-500">Usar email e senha</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setMode('request-access')}
                  className="w-full group relative overflow-hidden rounded-2xl border border-white/10 p-5 transition-all hover:border-white/20 hover:bg-white/[0.02]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-white">Link magico</h3>
                        <p className="text-sm text-gray-500">Receber link por email</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-sm text-gray-600 bg-[#0A0A0B]">ou</span>
                  </div>
                </div>

                <p className="text-center text-gray-600 text-sm">
                  Ainda nao tem acesso?{' '}
                  <a
                    href="https://wa.me/258849999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Fale conosco
                  </a>
                </p>
              </div>
            )}

            {/* MODO: LOGIN COM SENHA */}
            {mode === 'email-login' && (
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Senha</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      required
                      className="pl-12 pr-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Entrar'
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => setMode('request-access')}
                  className="w-full text-center text-gray-500 hover:text-amber-500 text-sm transition-colors"
                >
                  Esqueceu a senha? Receba um link magico
                </button>
              </form>
            )}

            {/* MODO: SOLICITAR ACESSO */}
            {mode === 'request-access' && (
              <form onSubmit={handleRequestAccess} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Voce recebera um link de acesso direto no seu email
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Enviar link magico
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* MODO: LINK ENVIADO */}
            {mode === 'access-sent' && (
              <div className="text-center space-y-6 py-8">
                <div className="relative inline-flex">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-black" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">
                    Verifique seu email
                  </h3>
                  <p className="text-gray-500">
                    Enviamos um link de acesso para
                  </p>
                  <p className="text-amber-500 font-medium">{email}</p>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={() => setMode('choose')}
                    variant="outline"
                    className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-xl"
                  >
                    Voltar ao inicio
                  </Button>
                  <p className="text-xs text-gray-600">
                    Nao recebeu? Verifique a pasta de spam ou{' '}
                    <button
                      onClick={() => setMode('request-access')}
                      className="text-amber-500 hover:underline"
                    >
                      tente novamente
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Mobile */}
          <p className="lg:hidden text-center text-gray-600 text-xs mt-12">
            2025 Reconquista. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
