// src/components/SearchDialog.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/hooks/useSearch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Layers, PlayCircle, FileText, Loader2 } from 'lucide-react';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  course: BookOpen,
  module: Layers,
  lesson: PlayCircle,
  material: FileText,
};

const typeLabels = {
  course: 'Curso',
  module: 'Módulo',
  lesson: 'Aula',
  material: 'Material',
};

const typeColors = {
  course: 'bg-purple-500/20 text-purple-400',
  module: 'bg-blue-500/20 text-blue-400',
  lesson: 'bg-green-500/20 text-green-400',
  material: 'bg-orange-500/20 text-orange-400',
};

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { results, isLoading } = useSearch(query);

  // Limpar busca ao fechar
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const handleSelect = (url: string) => {
    navigate(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-noir-900 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Pesquisar</DialogTitle>
        </DialogHeader>

        {/* Campo de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar aulas, módulos, cursos..."
            className="pl-10 bg-noir-800 border-white/10 text-white placeholder:text-gray-500"
            autoFocus
          />
        </div>

        {/* Resultados */}
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : query.length < 2 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Digite pelo menos 2 caracteres para buscar</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum resultado encontrado para "{query}"</p>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              {results.map((result) => {
                const Icon = typeIcons[result.type];
                const colorClass = typeColors[result.type];

                return (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result.url)}
                    className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${colorClass}`}>
                          {typeLabels[result.type]}
                        </span>
                        {result.parentName && (
                          <span className="text-xs text-gray-500 truncate">
                            {result.parentName}
                          </span>
                        )}
                      </div>
                      <p className="text-white font-medium truncate">{result.title}</p>
                      {result.description && (
                        <p className="text-gray-400 text-sm truncate">{result.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
