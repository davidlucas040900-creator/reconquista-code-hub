import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Lock, Download } from 'lucide-react';
import { useRef } from 'react';

interface BonusItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  comingSoon: boolean;
  downloadUrl?: string;
}

const bonusItems: BonusItem[] = [
  {
    id: 'arsenal-130',
    title: 'O Arsenal Secreto: 130 Frases Proibidas',
    description: 'Scripts prontos para cada situação. Ative a memória emocional dele com palavras poderosas.',
    icon: '📝',
    comingSoon: true,
  },
  {
    id: 'beijos-17',
    title: '17 Beijos Que Viciam',
    description: 'Técnicas avançadas de sedução física que o deixam obcecado por ti.',
    icon: '💋',
    comingSoon: true,
  },
  {
    id: 'guia-rapido',
    title: 'Guia de Início Rápido',
    description: 'PDF com os principais conceitos do curso para consulta rápida.',
    icon: '📋',
    comingSoon: false,
    downloadUrl: '#',
  },
  {
    id: 'checklist',
    title: 'Checklist da Reconquista',
    description: 'Passo a passo completo para não esquecer nenhum detalhe importante.',
    icon: '✅',
    comingSoon: true,
  },
];

export const BonusCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">
            O Teu Arsenal Secreto (Bónus)
          </h2>
          <p className="text-muted-foreground">Ferramentas práticas para aplicar imediatamente</p>
        </div>

        {/* Botões de navegação */}
        <div className="hidden gap-2 md:flex">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Carrossel Horizontal */}
      <div className="relative">
        <div
          ref={scrollRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6"
        >
          {bonusItems.map((item) => (
            <Card
              key={item.id}
              className={`group relative w-[320px] flex-shrink-0 snap-start overflow-hidden p-6 transition-all hover:scale-105 ${
                item.comingSoon
                  ? 'border-primary/30 bg-gradient-to-br from-primary/10 to-background'
                  : 'border-green-500/30 bg-gradient-to-br from-green-500/10 to-background hover:border-green-500/50'
              }`}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-full bg-primary/20 p-4">
                  <span className="text-5xl">{item.icon}</span>
                </div>

                <h3 className="min-h-[3rem] text-lg font-bold text-foreground">
                  {item.title}
                </h3>

                <p className="min-h-[3rem] text-sm text-muted-foreground">
                  {item.description}
                </p>

                {item.comingSoon ? (
                  <Button variant="outline" size="sm" className="w-full gap-2" disabled>
                    <Lock className="h-4 w-4" />
                    Em Breve
                  </Button>
                ) : (
                  <Button className="w-full gap-2 bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4" />
                    Baixar Agora
                  </Button>
                )}
              </div>

              {/* Shimmer effect */}
              {!item.comingSoon && (
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                  <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
