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

    const { error } = await signUp(email, password, fullName);
    
    if (!error) {
      toast.success('Conta criada com sucesso! Bem-vinda! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(error.message || 'Erro ao criar conta. Tenta novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://pub-335435355c6548d7987945a540eca66b.r2.dev/LOGO%20DA%20PAGINA%20DE%20LOGIN.webp"
              alt="Código da Reconquista"
              className="max-w-[280px] w-full h-auto animate-scale-in"
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-foreground">
            Acesso à Área de Membros
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Inicia a tua jornada de reconquista
          </p>

          {/* Tabs for Login/Signup */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar Conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email-signin" className="text-foreground">
                    E-mail
                  </Label>
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="teu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-signin" className="text-foreground">
                    Palavra-passe
                  </Label>
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-red transition-all hover:scale-[1.02]"
                >
                  {isLoading ? 'A entrar...' : 'ENTRAR NA JORNADA'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullname" className="text-foreground">
                    Nome Completo
                  </Label>
                  <Input
                    id="fullname"
                    type="text"
                    placeholder="O teu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-signup" className="text-foreground">
                    E-mail
                  </Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="teu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password-signup" className="text-foreground">
                    Palavra-passe
                  </Label>
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold text-lg py-6 rounded-xl shadow-lg hover:shadow-red transition-all hover:scale-[1.02]"
                >
                  {isLoading ? 'A criar conta...' : 'COMEÇAR A JORNADA'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Footer hint */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Cria a tua conta para aceder a todos os módulos do curso
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
