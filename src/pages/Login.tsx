// src/pages/Login.tsx
// APENAS MAGIC LINK - SEM SENHA
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, 
  Mail, 
  Crown, 
  ChevronLeft, 
  CheckCircle2, 
  Sparkles,
  ArrowRight 
} from 'lucide-react';

type LoginMode = 'request-access' | 'access-sent';

const Login = () => {
  const [mode, setMode] = useState<LoginMode>('request-access');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  // Enviar Magic Link
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Por favor, insira um email válido');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('request-access', {
        body: { email: email.toLowerCase().trim() },
      });
      
      if (error) throw error;
      
      setMode('access-sent');
      toast.success('Link de acesso enviado!');
    } catch (error: any) {
      console.error('Erro ao solicitar acesso:', error);
      toast.error('Erro ao enviar link. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
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
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0B] via-[#0A0A0B]/80 to-amber-900/20" />

        <div className="absolute top-20 left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />

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
                transformação
              </span>
              começa aqui.
            </h1>
            <p className="text-gray-400 text-lg">
              Acesse sua área exclusiva e descubra o poder que existe dentro de você.
            </p>

            <div className="space-y-3 pt-4">
              {['Acesso seguro por email', 'Sem necessidade de senha', 'Link enviado instantaneamente'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-amber-500" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            © 2025 Reconquista. Todos os direitos reservados.
          </p>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Logo Mobile */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <Crown className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-semibold text-white">Reconquista</span>
          </div>

          <div className="space-y-8">

            {/* MODO: SOLICITAR ACESSO */}
            {mode === 'request-access' && (
              <>
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-bold text-white">
                    Acessar área de membros
                  </h2>
                  <p className="text-gray-500">
                    Digite seu email para receber o link de acesso
                  </p>
                </div>

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
                        autoComplete="email"
                        className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-600 rounded-xl focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Você receberá um link de acesso direto no seu email
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
                        Enviar link de acesso
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative py-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-400 text-sm text-center">
                    <strong className="text-amber-500">Ainda não é aluna?</strong>
                    <br />
                    
                      href="https://codigodareconquista.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-500 hover:text-amber-400 inline-flex items-center gap-1 mt-1"
                    >
                      Conheça o programa
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </p>
                </div>
              </>
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

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <p className="text-amber-200 text-sm">
                    💡 Não encontrou? Verifique a pasta de <strong>spam</strong> ou <strong>promoções</strong>
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={() => {
                      setMode('request-access');
                      setEmail('');
                    }}
                    variant="outline"
                    className="w-full h-12 border-white/10 text-white hover:bg-white/5 rounded-xl"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Usar outro email
                  </Button>
                  
                  <button
                    onClick={() => {
                      setMode('request-access');
                    }}
                    className="text-amber-500 hover:text-amber-400 text-sm transition-colors"
                  >
                    Reenviar link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Mobile */}
          <p className="lg:hidden text-center text-gray-600 text-xs mt-12">
            © 2025 Reconquista. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
