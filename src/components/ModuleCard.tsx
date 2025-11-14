import { PlayCircle, ArrowRight, Play, Sparkles, TrendingUp, Flame, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  const hasStarted = (module.progress || 0) > 0;
  const isCompleted = (module.progress || 0) >= 100;

  // ═══════════════════════════════════════════════════════════
  // MAPEAMENTO DE BADGES (APENAS MÓDULOS ESPECÍFICOS)
  // ═══════════════════════════════════════════════════════════
  const getBadgeOverride = (moduleNumber: number, originalBadge: string | null | undefined): string | null | undefined => {
    const overrides: Record<number, string> = {
      1: 'MAIS VISTO',
      2: 'RECOMENDADO',
      5: 'MAIS VISTO',
      6: 'RECOMENDADO',
      7: 'NOVO',
    };
    
    return overrides[moduleNumber] !== undefined ? overrides[moduleNumber] : originalBadge;
  };

  const actualBadge = getBadgeOverride(module.number, module.badge);

  // ═══════════════════════════════════════════════════════════
  // CONFIGURAÇÃO DOS BADGES
  // ═══════════════════════════════════════════════════════════
  const getBadgeConfig = (badgeText: string | null | undefined) => {
    if (!badgeText) return null;

    const badgeUpper = badgeText.toUpperCase();

    switch (badgeUpper) {
      case 'NOVO':
        return {
          text: 'NOVO',
          className: 'bg-green-500/90 text-white border-green-400/50',
          icon: <Sparkles className="w-3 h-3" />
        };
      case 'RECOMENDADO':
        return {
          text: 'RECOMENDADO',
          className: 'bg-yellow-500/90 text-black border-yellow-400/50',
          icon: <TrendingUp className="w-3 h-3" />
        };
      case 'POPULAR':
        return {
          text: 'POPULAR',
          className: 'bg-red-500/90 text-white border-red-400/50',
          icon: <Flame className="w-3 h-3" />
        };
      case 'MAIS VISTO':
        return {
          text: 'MAIS VISTO',
          className: 'bg-purple-500/90 text-white border-purple-400/50',
          icon: <Eye className="w-3 h-3" />
        };
      default:
        return {
          text: badgeText,
          className: 'bg-primary/90 text-primary-foreground border-primary/50',
          icon: null
        };
    }
  };

  const badgeConfig = getBadgeConfig(actualBadge);

  // ═══════════════════════════════════════════════════════════
  // DETERMINAR TEXTO E ÍCONE DO BOTÃO
  // ═══════════════════════════════════════════════════════════
  const getButtonText = () => {
    if (isCompleted) return 'Rever Módulo';
    if (hasStarted) return 'Continuar Módulo';
    return 'Começar Módulo';
  };

  const getButtonIcon = () => {
    if (isCompleted) return <ArrowRight className="w-4 h-4" />;
    if (hasStarted) return <Play className="w-4 h-4" />;
    return <PlayCircle className="w-4 h-4" />;
  };

  return (
    <Card className="relative snap-start flex-shrink-0 w-[260px] sm:w-[280px] overflow-hidden group transition-all duration-300 hover:shadow-xl hover:border-primary/30">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={module.thumbnail}
          alt={module.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge Colorido */}
        {badgeConfig && (
          <div className="absolute top-2 right-2">
            <div 
              className={`
                ${badgeConfig.className}
                backdrop-blur-sm shadow-lg text-xs px-2.5 py-1 rounded-full 
                font-bold tracking-wide border flex items-center gap-1.5
                animate-in fade-in slide-in-from-top-2 duration-500
              `}
            >
              {badgeConfig.icon}
              <span>{badgeConfig.text}</span>
            </div>
          </div>
        )}

        {/* Module Number */}
        <div className="absolute top-2 left-2">
          <div className="bg-black/70 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs border border-white/20 shadow-lg">
            {module.number}
          </div>
        </div>

        {/* Progress Indicator Overlay */}
        {hasStarted && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <div className="flex items-center gap-2 text-white text-xs">
              <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${module.progress}%` }}
                />
              </div>
              <span className="font-semibold">{module.progress}%</span>
            </div>
          </div>
        )}

        {/* Completed Badge */}
        {isCompleted && (
          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center justify-center gap-1 border border-green-400/50 shadow-lg">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Concluído
            </div>
          </div>
        )}

        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content - Compacto */}
      <div className="p-4">
        <h3 className="text-base font-bold text-foreground line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {module.title}
        </h3>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {module.description}
        </p>

        {/* Meta Info - Compacto */}
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <PlayCircle className="w-3 h-3" />
            <span className="font-medium">{module.totalLessons} aulas</span>
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{module.duration}</span>
          </span>
        </div>

        {/* CTA Button - SEMPRE VISÍVEL */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="w-full gap-2 text-sm h-9 font-semibold"
          variant={isCompleted ? "outline" : "default"}
        >
          {getButtonIcon()}
          <span>{getButtonText()}</span>
        </Button>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      </div>
    </Card>
  );
}
