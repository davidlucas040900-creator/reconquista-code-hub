import { Card } from './ui/card';
import { Button } from './ui/button';
import { Crown, Lock, Sparkles } from 'lucide-react';

export const PremiumUpsell = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
          O Próximo Nível (Avançado)
        </h2>
        <p className="text-muted-foreground">Conteúdo exclusivo para elevar o teu jogo</p>
      </div>

      <Card className="relative overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/20 via-purple-600/10 to-background p-8 shadow-2xl">
        {/* Efeito de brilho */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-pulse" />

        <div className="relative flex flex-col items-center gap-6 lg:flex-row">
          {/* Ícone e Badge */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping rounded-full bg-purple-500/50 blur-xl" />
              <div className="relative rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 p-6 shadow-2xl">
                <span className="text-6xl">👸</span>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-purple-400/50 bg-purple-500/20 px-4 py-2 backdrop-blur-sm">
              <Crown className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-bold text-purple-400">PREMIUM EXCLUSIVE</span>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="flex-1 text-center lg:text-left">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-purple-500/30 px-4 py-1.5 text-sm font-semibold text-purple-300">
              <Sparkles className="h-4 w-4" />
              CONTEÚDO ADULTO
            </div>

            <h3 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
              A Deusa na Cama
            </h3>

            <p className="mb-4 text-lg text-muted-foreground">
              Módulo premium de sedução avançada. Técnicas secretas que transformam momentos íntimos em experiências inesquecíveis.
            </p>

            <div className="mb-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span>12 aulas exclusivas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span>3h de conteúdo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Acesso vitalício</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="mb-2 text-sm text-muted-foreground line-through">
                  De: 997 MZN
                </div>
                <div className="text-4xl font-bold text-purple-400">
                  597 MZN
                </div>
                <div className="text-sm font-semibold text-green-500">
                  Poupa 400 MZN (40%)
                </div>
              </div>

              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/50 hover:from-purple-600 hover:to-purple-800"
              >
                <Lock className="h-5 w-5" />
                Desbloquear Agora
              </Button>
            </div>
          </div>
        </div>

        {/* Testimonial pequeno */}
        <div className="mt-6 rounded-lg border border-purple-500/30 bg-purple-500/10 p-4 backdrop-blur-sm">
          <p className="text-sm italic text-purple-200">
            "Este módulo mudou completamente a minha vida íntima. Ele não consegue me esquecer!" - Ana M. ⭐⭐⭐⭐⭐
          </p>
        </div>
      </Card>
    </section>
  );
};
