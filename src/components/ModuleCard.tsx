import { PlayCircle, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ModuleCardProps {
  module: {
    id: number;
    number: number;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    duration: string;
    totalLessons: number;
    progress?: number;
    badge?: string | null;
  };
  isReleased?: boolean;
  onClick?: () => void;
}

export function ModuleCard({ module, onClick }: ModuleCardProps) {
  const progress = module.progress || 0;
  const isCompleted = progress >= 100;
  const hasStarted = progress > 0;

  return (
    <Card 
      className="w-[280px] flex-shrink-0 cursor-pointer overflow-hidden border-border transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted">
        <img
          src={module.thumbnail}
          alt={module.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        
        {/* Número do módulo */}
        <div className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-sm font-medium text-foreground">
          {module.number}
        </div>

        {/* Badge simples (apenas se tiver) */}
        {module.badge && (
          <div className="absolute right-3 top-3 rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-foreground">
            {module.badge}
          </div>
        )}

        {/* Indicador de concluído */}
        {isCompleted && (
          <div className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
            <Check className="h-4 w-4 text-background" />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-medium text-foreground line-clamp-2">
            {module.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {module.description}
          </p>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{module.totalLessons} aulas</span>
          <span>{module.duration}</span>
        </div>

        {/* Progresso */}
        {hasStarted && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}

        {/* Botão */}
        <Button 
          variant={isCompleted ? "outline" : "default"} 
          className="w-full gap-2"
          size="sm"
        >
          <PlayCircle className="h-4 w-4" />
          {isCompleted ? 'Rever' : hasStarted ? 'Continuar' : 'Começar'}
        </Button>
      </div>
    </Card>
  );
}
