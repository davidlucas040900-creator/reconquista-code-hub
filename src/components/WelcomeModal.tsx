import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const WelcomeModal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [checklist, setChecklist] = useState({
    watchVideo: false,
    downloadGuide: false,
    joinGroup: false,
    startModule: false,
  });

  useEffect(() => {
    const checkFirstLogin = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_login_completed')
        .eq('id', user.id)
        .single();

      if (profile && !profile.first_login_completed) {
        setIsOpen(true);
      }
    };

    checkFirstLogin();
  }, [user]);

  const handleComplete = async () => {
    if (!user) return;

    await supabase.from('profiles').update({ first_login_completed: true }).eq('id', user.id);
    setIsOpen(false);

    if (checklist.startModule) {
      navigate('/dashboard');
    }
  };

  const allChecked = Object.values(checklist).every(Boolean);

  const steps = [
    { id: 'watchVideo', label: 'Assistir vídeo de boas-vindas', description: 'Entenda como aproveitar o curso' },
    { id: 'downloadGuide', label: 'Baixar guia de início', description: 'Material complementar' },
    { id: 'joinGroup', label: 'Entrar no grupo de suporte', description: 'Comunidade exclusiva' },
    { id: 'startModule', label: 'Começar o Módulo 1', description: 'Inicie sua jornada' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="border-border bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Bem-vinda ao Código da Reconquista
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            Complete os passos abaixo para começar sua jornada.
          </p>

          <div className="space-y-2">
            {steps.map((step) => (
              <div 
                key={step.id}
                className="flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
              >
                <Checkbox
                  id={step.id}
                  checked={checklist[step.id as keyof typeof checklist]}
                  onCheckedChange={(checked) => 
                    setChecklist({ ...checklist, [step.id]: !!checked })
                  }
                />
                <label htmlFor={step.id} className="flex-1 cursor-pointer">
                  <p className="font-medium text-foreground">{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </label>
              </div>
            ))}
          </div>

          <Button
            onClick={handleComplete}
            disabled={!allChecked}
            className="w-full"
          >
            {allChecked ? 'Começar Agora' : 'Complete os passos acima'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
