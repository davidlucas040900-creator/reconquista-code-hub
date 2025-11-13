import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

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
    checkoutUrl: '#'
  },
  {
    id: 'guia-obediencia',
    title: 'Guia da Obediência',
    description: 'Como fazer ele te dar atenção total',
    price: 97,
    image: '👑',
    checkoutUrl: '#'
  },
  {
    id: 'respostas-130',
    title: '130 Respostas Infalíveis',
    description: 'Nunca mais fique sem saber o que responder',
    price: 67,
    image: '💬',
    checkoutUrl: '#'
  },
  {
    id: 'deusa-cama',
    title: 'A Deusa na Cama',
    description: 'Módulo premium de sedução avançada',
    price: 597,
    image: '💋',
    badge: 'PREMIUM',
    checkoutUrl: '#'
  }
];

export const UpsellCarousel = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Recomendado Para Você
        </h2>
        <p className="text-muted-foreground">
          Ferramentas extras para acelerar sua reconquista
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card
            key={product.id}
            className={`p-6 hover:scale-105 transition-all cursor-pointer ${
              product.badge === 'PREMIUM'
                ? 'bg-gradient-to-br from-purple-500/20 to-background border-purple-500/30'
                : 'hover:border-primary/50'
            }`}
          >
            {product.badge && (
              <Badge
                variant={product.badge === 'PREMIUM' ? 'default' : 'secondary'}
                className="mb-3"
              >
                {product.badge}
              </Badge>
            )}
            
            <div className="text-5xl mb-4 text-center">{product.image}</div>
            
            <h3 className="font-bold text-foreground mb-2 text-center min-h-[3rem]">
              {product.title}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {product.description}
            </p>
            
            <p className="text-2xl font-bold text-primary text-center mb-4">
              {product.price} MZN
            </p>
            
            <Button className="w-full" variant="outline">
              Quero Este Bônus
            </Button>
          </Card>
        ))}
      </div>
    </section>
  );
};
