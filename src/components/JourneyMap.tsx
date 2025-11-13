import { Lock, CheckCircle2, BookOpen } from 'lucide-react';
import { UserModule } from '@/hooks/useUserModules';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface JourneyMapProps {
  modules: UserModule[];
}

export const JourneyMap = ({ modules }: JourneyMapProps) => {
  const currentModule = modules.find(m => m.is_released && !m.is_completed);
  const currentModuleNumber = currentModule?.module_number || 1;

  return (
    <div className="bg-card rounded-2xl p-6 mb-8 border border-border">
      <h2 className="text-xl font-semibold text-foreground mb-6 text-center">
        Você está no Módulo {currentModuleNumber} de {modules.length}
      </h2>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 right-0 h-1 bg-border" />
        <div
          className="absolute top-6 left-0 h-1 bg-primary transition-all duration-500"
          style={{
            width: `${((modules.filter(m => m.is_completed).length) / modules.length) * 100}%`,
          }}
        />

        {/* Modules */}
        <div className="relative flex justify-between">
          {modules.map((module) => {
            const isCompleted = module.is_completed;
            const isReleased = module.is_released;
            const isCurrent = module.module_number === currentModuleNumber;

            return (
              <div key={module.id} className="flex flex-col items-center">
                {/* Icon */}
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500'
                      : isReleased
                      ? 'bg-primary border-primary animate-pulse'
                      : 'bg-muted border-border'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : isReleased ? (
                    <BookOpen className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <div className="text-xs font-semibold text-foreground">M{module.module_number}</div>
                  
                  {!isReleased && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {format(new Date(module.release_date), 'dd/MM/yyyy', { locale: pt })}
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="mt-1 text-xs text-primary font-semibold">
                      ↑ você está aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-muted-foreground">Concluído</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">Em Andamento</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Bloqueado</span>
        </div>
      </div>
    </div>
  );
};
