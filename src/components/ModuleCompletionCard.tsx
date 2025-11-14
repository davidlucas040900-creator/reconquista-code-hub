import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ModuleCompletionCardProps {
  currentModule: number;
  completedPercentage: number;
}

export function ModuleCompletionCard({ currentModule, completedPercentage }: ModuleCompletionCardProps) {
  const navigate = useNavigate();
  const isCompleted = completedPercentage >= 100;
  const nextModule = currentModule + 1;
  const hasNextModule = nextModule <= 7;

  const moduleNames = {
    2: 'Mapa da Mente Masculina',
    3: 'Gatilhos da Memória Emocional',
    4: 'A Frase de 5 Palavras',
    5: 'Primeiro Contato Estratégico',
    6: 'Domínio da Conversa',
    7: 'Conquista Duradoura',
  };

  if (!isCompleted) return null;

  return (
    <Card className="bg-gradient-to-br from-green-500/10 via-primary/10 to-background border-green-500/30 p-8 mb-8">
      <div className="text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border-4 border-green-500/50">
            <Award className="w-10 h-10 text-green-500" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-foreground mb-3">
          🎉 Módulo {currentModule} Concluído!
        </h2>

        <p className="text-muted-foreground text-lg mb-6">
          Parabéns! Completaste todas as aulas deste módulo.
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="text-center">
            <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-sm text-muted-foreground">100% Completo</p>
          </div>
          <div className="w-px h-12 bg-border"></div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">✓</p>
            <p className="text-sm text-muted-foreground">Certificado Desbloqueado</p>
          </div>
        </div>

        {/* Next Module CTA */}
        {hasNextModule ? (
          <div className="bg-background/50 rounded-xl p-6 border border-border">
            <p className="text-sm text-muted-foreground mb-4">
              Próximo Módulo:
            </p>
            <h3 className="text-xl font-bold text-foreground mb-4">
              Módulo {nextModule}: {moduleNames[nextModule as keyof typeof moduleNames]}
            </h3>
            <Button
              size="lg"
              onClick={() => navigate(`/modulo/${nextModule}/aula/1`)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2"
            >
              Começar Próximo Módulo
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="bg-background/50 rounded-xl p-6 border border-border">
            <h3 className="text-xl font-bold text-foreground mb-4">
              🏆 Curso Completo!
            </h3>
            <p className="text-muted-foreground mb-4">
              Parabéns por completar toda a jornada do Código da Reconquista!
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
