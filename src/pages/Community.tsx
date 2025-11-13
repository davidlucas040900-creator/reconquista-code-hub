import { MessageCircle, Video, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

const testimonials = [
  {
    name: "Maria Silva",
    story: "Em 2 semanas ele voltou! Segui tudo à risca e funcionou. Obrigada! ❤️",
    avatar: "👩🏽"
  },
  {
    name: "Ana Costa",
    story: "Não acreditava que ia funcionar, mas ele me procurou pedindo uma segunda chance!",
    avatar: "👩🏾"
  },
  {
    name: "Joana Santos",
    story: "Aprendi a me valorizar e agora ele não me larga mais. Valeu cada minuto!",
    avatar: "👩🏻"
  }
];

const Community = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">A carregar...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2"
            >
              ← Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Comunidade Código da Reconquista
          </h1>
          <p className="text-xl text-muted-foreground">
            Junte-se a centenas de mulheres transformando suas vidas amorosas
          </p>
        </div>

        {/* WhatsApp Community Card */}
        <Card className="bg-gradient-to-br from-green-500/20 to-background border-green-500/30 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-green-500/20 p-6 rounded-full">
              <MessageCircle className="w-16 h-16 text-green-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-foreground mb-3">
                💬 Comunidade Exclusiva no WhatsApp
              </h2>
              <p className="text-muted-foreground mb-6">
                Entre no nosso grupo secreto com centenas de alunas transformando suas vidas amorosas! 
                Compartilhe experiências, tire dúvidas e receba suporte diário.
              </p>
              <Button
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white gap-2"
                onClick={() => window.open('https://wa.me/258834569225', '_blank')}
              >
                <MessageCircle className="w-5 h-5" />
                Entrar Agora no WhatsApp
              </Button>
            </div>
          </div>
        </Card>

        {/* Lives Mentoria Card (Upsell) */}
        <Card className="bg-gradient-to-br from-purple-500/20 to-background border-purple-500/30 p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="bg-purple-500/20 p-6 rounded-full">
              <Video className="w-16 h-16 text-purple-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="inline-block bg-purple-500/20 px-3 py-1 rounded-full text-sm font-semibold text-purple-400 mb-3">
                PREMIUM
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">
                Lives Semanais de Mentoria
              </h2>
              <p className="text-muted-foreground mb-4">
                Aulas ao vivo comigo, sessões de Perguntas & Respostas e análise de casos reais. 
                Acesso direto para tirar suas dúvidas e acelerar sua reconquista.
              </p>
              <p className="text-3xl font-bold text-purple-400 mb-6">
                647 MZN/mês
              </p>
              <Button
                size="lg"
                className="bg-purple-500 hover:bg-purple-600 text-white gap-2"
              >
                <Video className="w-5 h-5" />
                Garantir Meu Acesso
              </Button>
            </div>
          </div>
        </Card>

        {/* Success Stories */}
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            <Award className="w-8 h-8 inline-block mr-2 text-primary" />
            Destaques de Sucesso
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 border-primary/20">
                <div className="text-5xl mb-4 text-center">{testimonial.avatar}</div>
                <h3 className="font-bold text-foreground mb-2 text-center">
                  {testimonial.name}
                </h3>
                <p className="text-muted-foreground text-center italic">
                  "{testimonial.story}"
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
