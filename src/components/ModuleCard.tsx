import { Module } from '@/data/modules';
import { Play, Clock, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ModuleCardProps {
  module: Module;
}

export const ModuleCard = ({ module }: ModuleCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (module.lessons.length > 0) {
      navigate(`/modulo/${module.slug}/aula/${module.lessons[0].id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex-shrink-0 w-64 md:w-80 cursor-pointer transition-all duration-300 hover:scale-105"
    >
      {/* Thumbnail container */}
      <div className="relative overflow-hidden rounded-xl aspect-video bg-muted">
        <img
          src={module.thumbnail}
          alt={module.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Badge */}
        {module.badge && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${
              module.badge === 'NOVO' 
                ? 'bg-primary text-primary-foreground animate-glow' 
                : 'bg-secondary text-secondary-foreground'
            }`}>
              {module.badge}
            </span>
          </div>
        )}

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-primary/90 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-8 h-8 text-primary-foreground fill-current" />
          </div>
        </div>

        {/* Progress bar */}
        {module.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${module.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-3 space-y-2">
        <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {module.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2">
          {module.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {module.duration}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {module.lessons.length} {module.lessons.length === 1 ? 'aula' : 'aulas'}
          </span>
        </div>
      </div>
    </div>
  );
};
