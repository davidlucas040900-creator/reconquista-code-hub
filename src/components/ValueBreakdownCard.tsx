import { Card } from '@/components/ui/card';
import { TrendingDown, Sparkles } from 'lucide-react';

export const ValueBreakdownCard = () => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-background p-6 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold">O Que Recebeste</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">7 Módulos Completos</span>
            <span className="font-semibold">1.200 MZN</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Aulas Bónus Exclusivas</span>
            <span className="font-semibold">800 MZN</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Suporte Direto</span>
            <span className="font-semibold">500 MZN</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Materiais Complementares</span>
            <span className="font-semibold">300 MZN</span>
          </div>

          <div className="border-t border-border pt-3 mt-3">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>Valor Total:</span>
              <span>2.800 MZN</span>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tu Pagaste:</span>
              <span className="text-2xl font-bold text-primary">197 MZN</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-semibold">Poupança:</span>
              </div>
              <span className="text-green-500 font-bold">2.603 MZN (93%)</span>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground italic mt-4">
            Investimento que transforma vidas. Aproveita! ✨
          </p>
        </div>
      </div>
    </Card>
  );
};
