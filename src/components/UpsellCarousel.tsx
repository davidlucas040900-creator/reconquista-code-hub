import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  badge?: string;
  checkoutUrl: string;
}

const products: Product[] = [
  {
    id: 'frases-130',
    title: '130 Frases Para Deixar O Gajo Caidinho Por Ti',
    description: 'Scripts prontos para cada situação',
    price: 87,
    image: '📝',
    badge: 'POPULAR',
    checkoutUrl: 'https://pay.lojou.app/p/4L5Zt',
  },
  {
    id: 'guia-obediencia',
    title: 'Guia da Obediência',
    description: 'Como fazer ele te dar atenção total',
    price: 87,
    image: '👑',
    checkoutUrl: 'https://pay.lojou.app/p/4V8pY',
  },
  {
    id: 'respostas-130',
    title: '130 Respostas Infalíveis',
    description: 'Nunca mais fique sem saber o que responder',
    price: 67,
    image: '💬',
    checkoutUrl: 'https://pay.lojou.app/p/mx0qC',
  },
  {
    id: 'beijos-17',
    title: '17 Beijos Que Viciam',
    description: 'Técnicas avançadas de sedução física',
    price: 77,
    image: '💋',
    badge: 'NOVO',
    checkoutUrl: '#',
  },
];

export const UpsellCarousel = () => {
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
            Recomendado Para Você
          </h2>
          <p className="text-muted-foreground">Ferramentas extras para acelerar sua reconquista</p>
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
          {products.map((product) => (
            <Card
              key={product.id}
              className="group w-[280px] flex-shrink-0 snap-start cursor-pointer overflow-hidden p-6 transition-all hover:scale-105 hover:border-primary/50"
            >
              {product.badge && (
                <Badge
                  variant={product.badge === 'POPULAR' ? 'default' : 'secondary'}
                  className="mb-3"
                >
                  {product.badge}
                </Badge>
              )}

              <div className="mb-4 text-center text-5xl">{product.image}</div>

              <h3 className="mb-2 min-h-[3rem] text-center font-bold text-foreground">
                {product.title}
              </h3>

              <p className="mb-4 line-clamp-2 text-center text-sm text-muted-foreground">
                {product.description}
              </p>

              <p className="mb-4 text-center text-2xl font-bold text-primary">
                {product.price} MZN
              </p>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => window.open(product.checkoutUrl, '_blank')}
              >
                Quero Este Bónus
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
