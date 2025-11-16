import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (!error) {
      toast.success('Bem-vinda de volta! 🎉');
      navigate('/dashboard');
    } else {
      toast.error('Credenciais inválidas. Verifica o teu e-mail e palavra-passe.');
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Palavra-passe padrão para todas as inscrições
    const fixedPassword = 'Reconquista@2026';

    const { error } = await signUp(email, fixedPassword, fullName, whatsapp);

    if (!error) {
      toast.success('Conta criada! Agora faz login com o teu e-mail e a senha Reconquista@2026');
      setIsLoading(false);
    } else {
      toast.error(error.message || 'Erro ao criar conta. Tenta novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-background/95">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-10 top-20 h-72 w-72 animate-pulse rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-96 w-96 animate-pulse rounded-full bg-secondary/20 blur-3xl delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in px-6">
        <div className="rounded-2xl border border-border/50 bg-card/80 p-8 shadow-2xl backdrop-blur-xl md:p-12">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <img
              src="https://pub-335435355c6548d7987945a540eca66b.r2.dev/LOGO%20DA%20PAGINA%20DE%20LOGIN.webp"
              alt="Código da Reconquista"
              className="h-auto w-full max-w-[280px] animate-scale-in"
              loading="lazy"
            />
          </div>

          {/* Title */}
          <h1 className="mb-2 text-center text-2xl font-bold text-foreground md:text-3xl">
            Acesso à Área de Membros
          </h1>
          <p className="mb-8 text-center text-muted-foreground">Inicia a tua jornada de reconquista</p>

          {/* Tabs for Login/Signup */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-signin" className="text-foreground">E-mail</Label>
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="teu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-signin" className="text-foreground">Palavra-passe</Label>
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'A entrar…' : 'Entrar na Jornada'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-foreground">Nome Completo</Label>
                  <Input
                    id="full-name"
                    type="text"
                    placeholder="O teu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-foreground">E-mail</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="teu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-foreground">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    type="text"
                    placeholder="(+351) 900 000 000"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                  />
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  A palavra‑passe inicial será <span className="font-semibold">Reconquista@2026</span>
                </p>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'A criar conta…' : 'Criar Conta'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            💡 Cria a tua conta para aceder a todos os módulos do curso
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
