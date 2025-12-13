import { Card } from './ui/card';
import { Button } from './ui/button';
import { Crown, ArrowRight } from 'lucide-react';

export const PremiumUpsell = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-2 text-xl font-medium text-foreground">
          Conteúdo Exclusivo
        </h2>
        <p className="text-sm text-muted-foreground">
          Eleva o teu jogo para o próximo nível
        </p>
      </div>

      <Card className="border-border p-6 transition-colors hover:bg-accent/50">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          
          {/* Ícone simples */}
          <div className="flex flex-shrink-0 items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border">
              <Crown className="h-8 w-8 text-foreground" />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="mb-2 inline-block rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                Conteúdo Avançado
              </div>
              
              <h3 className="text-2xl font-semibold text-foreground">
                A Deusa na Cama
              </h3>
              
              <p className="mt-2 text-sm text-muted-foreground">
                Módulo premium de sedução avançada. Técnicas secretas que transformam 
                momentos íntimos em experiências inesquecíveis.
              </p>
            </div>

            {/* Informações */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>12 aulas exclusivas</span>
              <span></span>
              <span>3h de conteúdo</span>
              <span></span>
              <span>Acesso vitalício</span>
            </div>

            {/* Preço e CTA */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-1 text-xs text-muted-foreground line-through">
                  997 MZN
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">597 MZN</span>
                  <span className="text-sm font-medium text-green-600">
                    Poupa 40%
                  </span>
                </div>
              </div>

              <Button 
                size="lg"
                onClick={() => window.open('https://pay.lojou.app/p/deusa-na-cama', '_blank')}
                className="gap-2"
              >
                Desbloquear Agora
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Garantia discreta */}
        <div className="mt-6 border-t border-border pt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Garantia de 14 dias  Pagamento único  Acesso imediato
          </p>
        </div>
      </Card>
    </section>
  );
};
