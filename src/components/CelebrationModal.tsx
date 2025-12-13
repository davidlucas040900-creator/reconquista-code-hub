import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  onNextLesson?: () => void;
}

export const CelebrationModal = ({
  isOpen,
  onClose,
  lessonTitle,
  onNextLesson,
}: CelebrationModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-background sm:max-w-md">
        <div className="space-y-6 py-6 text-center">
          
          {/* Ícone simples */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-foreground">
            <Check className="h-8 w-8 text-foreground" />
          </div>

          {/* Conteúdo */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              Aula Concluída
            </h2>
            <p className="text-sm text-muted-foreground">
              {lessonTitle}
            </p>
          </div>

          {/* Mensagem de incentivo */}
          <div className="rounded-lg border border-border bg-accent/50 p-4">
            <p className="text-sm text-foreground">
              Mais uma etapa vencida. Continue assim!
            </p>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Fechar
            </Button>
            {onNextLesson && (
              <Button
                onClick={onNextLesson}
                className="flex-1 gap-2"
              >
                Próxima Aula
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
