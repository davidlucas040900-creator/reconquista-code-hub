import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  benefits: string[];
  tier: 'semanal' | 'mensal' | 'vitalicio';
}

const plans: Plan[] = [
  {
    id: 'semanal',
    name: 'Plano Semanal',
    price: 197,
    duration: 'Renova a cada 7 dias',
    tier: 'semanal',
    benefits: [
      'Acesso a todos os 7 módulos',
      'Suporte via WhatsApp',
      'Materiais de apoio',
      'Comunidade exclusiva'
    ]
  },
  {
    id: 'mensal',
    name: 'Plano Mensal',
    price: 397,
    duration: 'Renova a cada 30 dias',
    tier: 'mensal',
    benefits: [
      'Acesso a todos os 7 módulos',
      'Suporte prioritário via WhatsApp',
      'Materiais de apoio',
      'Comunidade exclusiva',
      'Desconto em upsells'
    ]
  },
  {
    id: 'vitalicio',
    name: 'Plano Vitalício',
    price: 997,
    duration: 'Acesso para sempre',
    tier: 'vitalicio',
    benefits: [
      'Acesso vitalício a todos os módulos',
      'Suporte VIP via WhatsApp',
      'Todos os materiais de apoio',
      'Comunidade exclusiva',
      'Atualizações futuras gratuitas',
      'Bônus exclusivos',
      '50% de desconto em lives de mentoria'
    ]
  }
];

const MyPlan = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (user) {
        const { data } = await (supabase as any)
          .from('profiles')
          .select('subscription_tier, subscription_expires_at')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data) {
          setCurrentTier(data.subscription_tier || 'mensal');
          setExpiresAt(data.subscription_expires_at);
        }
      }
    };

    fetchSubscription();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">A carregar...</div>
      </div>
    );
  }

  if (!user) return null;

  const isExpired = expiresAt && new Date(expiresAt) < new Date();

  return (
    <div className="min-h-screen bg-background">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Meu Plano de Assinatura
          </h1>
          {isExpired && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-destructive font-semibold">
                ⚠️ Seu plano expirou. Renove para continuar acessando o conteúdo!
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = plan.tier === currentTier;
            const isVitalicio = plan.tier === 'vitalicio';

            return (
              <Card
                key={plan.id}
                className={`p-6 relative ${
                  isVitalicio
                    ? 'bg-gradient-to-br from-primary/20 to-background border-primary'
                    : isCurrentPlan
                    ? 'border-green-500'
                    : 'border-border'
                }`}
              >
                {isVitalicio && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary px-4 py-1 rounded-full flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm font-bold">RECOMENDADO</span>
                    </div>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-green-500 px-3 py-1 rounded-full text-sm font-bold">
                      SEU PLANO
                    </div>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {plan.duration}
                  </p>
                  <p className="text-4xl font-bold text-primary">
                    {plan.price} MZN
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                  disabled={isCurrentPlan && !isExpired}
                >
                  {isCurrentPlan && !isExpired
                    ? 'Plano Ativo'
                    : isCurrentPlan && isExpired
                    ? 'Renovar Plano'
                    : 'Fazer Upgrade'}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyPlan;
