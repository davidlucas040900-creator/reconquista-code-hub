import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = login(username, password);
    
    if (success) {
      toast.success('Bem-vinda de volta! 🎉');
      navigate('/dashboard');
    } else {
      toast.error('Credenciais inválidas. Tenta novamente.');
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Nome de Usuário
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="aluna_codigo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">
                Palavra-passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Reconquista@2024"
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

          {/* Footer hint */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Dica: As tuas credenciais foram enviadas por e-mail
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
