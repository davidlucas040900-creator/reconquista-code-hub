// src/pages/Materiais.tsx

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  BookOpen, 
  Headphones, 
  Video,
  Lock,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface Material {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'audio' | 'video' | 'ebook';
  downloadUrl?: string;
  isLocked: boolean;
  course: string;
}

// Materiais de exemplo (depois pode vir do Supabase)
const materiaisExemplo: Material[] = [
  {
    id: '1',
    title: 'Guia Completo do Reset Emocional',
    description: 'PDF com exercícios práticos para aplicar o reset emocional no seu dia a dia.',
    type: 'pdf',
    downloadUrl: '#',
    isLocked: false,
    course: 'Código da Reconquista'
  },
  {
    id: '2',
    title: 'Checklist da Primeira Mensagem',
    description: 'Lista de verificação para garantir que sua mensagem terá o impacto desejado.',
    type: 'pdf',
    downloadUrl: '#',
    isLocked: false,
    course: 'Código da Reconquista'
  },
  {
    id: '3',
    title: 'Meditação do Autocontrole',
    description: 'Áudio guiado de 15 minutos para fortalecer seu controle emocional.',
    type: 'audio',
    downloadUrl: '#',
    isLocked: false,
    course: 'Código da Reconquista'
  },
  {
    id: '4',
    title: 'E-book: Os 7 Gatilhos Secretos',
    description: 'Livro digital com os gatilhos emocionais que fazem ele voltar.',
    type: 'ebook',
    downloadUrl: '#',
    isLocked: true,
    course: 'A Deusa na Cama'
  },
  {
    id: '5',
    title: 'Áudio: Técnicas de Sedução Vocal',
    description: 'Como usar sua voz para criar atração irresistível.',
    type: 'audio',
    downloadUrl: '#',
    isLocked: true,
    course: 'A Deusa na Cama'
  },
  {
    id: '6',
    title: 'Masterclass: Comunicação Magnética',
    description: 'Vídeo exclusivo sobre como se comunicar de forma irresistível.',
    type: 'video',
    downloadUrl: '#',
    isLocked: true,
    course: 'O Santuário'
  },
];

const typeIcons = {
  pdf: FileText,
  audio: Headphones,
  video: Video,
  ebook: BookOpen,
};

const typeColors = {
  pdf: 'text-red-400 bg-red-500/20',
  audio: 'text-purple-400 bg-purple-500/20',
  video: 'text-blue-400 bg-blue-500/20',
  ebook: 'text-green-400 bg-green-500/20',
};

const typeLabels = {
  pdf: 'PDF',
  audio: 'Áudio',
  video: 'Vídeo',
  ebook: 'E-book',
};

export default function Materiais() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pdf' | 'audio' | 'video' | 'ebook'>('all');

  const filteredMateriais = activeFilter === 'all' 
    ? materiaisExemplo 
    : materiaisExemplo.filter(m => m.type === activeFilter);

  const filters = [
    { id: 'all', label: 'Todos', icon: Sparkles },
    { id: 'pdf', label: 'PDFs', icon: FileText },
    { id: 'audio', label: 'Áudios', icon: Headphones },
    { id: 'video', label: 'Vídeos', icon: Video },
    { id: 'ebook', label: 'E-books', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-noir-950">
      <Header />
      
      <main className="pt-20 pb-24 md:pb-8 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-playfair font-bold text-silk-100 mb-2">
            Materiais de Apoio
          </h1>
          <p className="text-silk-400">
            Downloads exclusivos para complementar seu aprendizado
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scroll-container">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? 'bg-gold/20 border border-gold/50 text-gold' 
                    : 'bg-white/5 border border-white/10 text-silk-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Lista de Materiais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMateriais.map((material) => {
            const Icon = typeIcons[material.type];
            const colorClass = typeColors[material.type];
            
            return (
              <Card 
                key={material.id}
                className={`bg-noir-900/50 border-white/5 p-5 transition-all duration-300 ${
                  material.isLocked 
                    ? 'opacity-70' 
                    : 'hover:border-gold/20 hover:bg-noir-800/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone do tipo */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Badge do tipo */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
                        {typeLabels[material.type]}
                      </span>
                      <span className="text-xs text-silk-400">
                        {material.course}
                      </span>
                    </div>
                    
                    {/* Título */}
                    <h3 className="text-silk-100 font-semibold mb-1 truncate">
                      {material.title}
                    </h3>
                    
                    {/* Descrição */}
                    <p className="text-silk-400 text-sm line-clamp-2 mb-4">
                      {material.description}
                    </p>
                    
                    {/* Botão */}
                    {material.isLocked ? (
                      <Button 
                        disabled
                        variant="ghost"
                        className="w-full text-silk-400 border border-white/10"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Conteúdo Bloqueado
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gold/10 text-gold hover:bg-gold/20 border border-gold/30"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Mensagem se não houver materiais */}
        {filteredMateriais.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-silk-400 mx-auto mb-4" />
            <h3 className="text-xl text-silk-100 font-semibold mb-2">
              Nenhum material encontrado
            </h3>
            <p className="text-silk-400">
              Não há materiais disponíveis para este filtro.
            </p>
          </div>
        )}

        {/* Card de Destaque */}
        <Card className="mt-8 bg-gradient-to-r from-gold/10 to-royal/10 border-gold/20 p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-silk-100 mb-2">
                Materiais Exclusivos
              </h3>
              <p className="text-silk-300">
                Novos materiais são adicionados regularmente. Continue acompanhando suas aulas 
                para desbloquear conteúdos exclusivos!
              </p>
            </div>
            <Button className="btn-gold flex-shrink-0">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Cursos
            </Button>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
