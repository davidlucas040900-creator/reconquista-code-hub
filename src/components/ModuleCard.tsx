import { Lock, PlayCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  releaseDate?: string;
  onClick?: () => void;
}

export function ModuleCard({ module, isReleased = true, releaseDate, onClick }: ModuleCardProps) {
  const isLocked = !isReleased;

  const handleClick = () => {
    if (!isLocked && onClick) {
      onClick();
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={`relative snap-start flex-shrink-0 w-[300px] sm:w-[350px] overflow-hidden group transition-all duration-300 ${
        isLocked
          ? 'opacity-60 cursor-not-allowed'
          : 'cursor-pointer hover:scale-105 hover:shadow-2xl hover:border-primary/50'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={module.thumbnail}
          alt={module.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isLocked ? 'grayscale' : 'group-hover:scale-110'
          }`}
        />
        
        {/* Lock Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center px-4">
              <Lock className="w-12 h-12 text-white/80 mx-auto mb-3 animate-pulse" />
              <p className="text-white font-semibold text-sm">Módulo Bloqueado</p>
              {releaseDate && (
                <p className="text-white/80 text-xs mt-1">
                  Liberado em: {new Date(releaseDate).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Badge */}
        {module.badge && !isLocked && (
          <div className="absolute top-3 right-3">
            <Badge 
              variant="secondary"
              className="bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg"
            >
              {module.badge}
            </Badge>
          </div>
        )}

        {/* Module Number */}
        <div className="absolute top-3 left-3">
          <div className="bg-black/60 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm border-2 border-white/20">
            {module.number}
          </div>
        </div>

        {/* Play Icon Overlay */}
        {!isLocked && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <PlayCircle className="w-20 h-20 text-white drop-shadow-2xl" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-foreground line-clamp-2 flex-1 group-hover:text-primary transition-colors">
            {module.title}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
          {module.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1.5">
            <PlayCircle className="w-4 h-4" />
            <span className="font-medium">{module.totalLessons} aulas</span>
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {module.duration}
          </span>
        </div>

        {/* Progress Bar */}
        {!isLocked && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Progresso</span>
              <span className="font-bold text-foreground">{module.progress || 0}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                style={{ width: `${module.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA for unlocked modules */}
        {!isLocked && (
          <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center justify-center gap-2 text-primary text-sm font-semibold">
              <span>Começar Módulo</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Shimmer effect on hover */}
      {!isLocked && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        </div>
      )}
    </Card>
  );
}
