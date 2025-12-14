// src/pages/Materiais.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Sparkles,
  ArrowLeft
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
  const navigate = useNavigate();
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
      
      <main className="pt-16 pb-24 md:pb-8 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Título */}
        <div className="py-4 md:py-6">
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors md:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl md:text-3xl font-playfair font-bold text-silk-100">
              Materiais de Apoio
            </h1>
          </div>
          <p className="text-silk-400 text-sm md:text-base">
            Downloads exclusivos para complementar seu aprendizado
          </p>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 md:mb-6 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {filters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 text-sm ${
                  isActive 
                    ? 'bg-gold/20 border border-gold/50 text-gold' 
                    : 'bg-white/5 border border-white/10 text-silk-300 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Lista de Materiais */}
        <div className="grid gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMateriais.map((material) => {
            const Icon = typeIcons[material.type];
            const colorClass = typeColors[material.type];
            
            return (
              <Card 
                key={material.id}
                className={`bg-noir-900/50 border-white/5 p-4 md:p-5 transition-all duration-300 ${
                  material.isLocked 
                    ? 'opacity-70' 
                    : 'hover:border-gold/20 hover:bg-noir-800/50'
                }`}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  {/* Ícone do tipo */}
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {/* Badge do tipo */}
                    <div className="flex items-center gap-2 mb-1.5 md:mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${colorClass}`}>
                        {typeLabels[material.type]}
                      </span>
                      <span className="text-xs text-silk-400 truncate">
                        {material.course}
                      </span>
                    </div>
                    
                    {/* Título */}
                    <h3 className="text-silk-100 font-semibold mb-1 text-sm md:text-base line-clamp-2">
                      {material.title}
                    </h3>
                    
                    {/* Descrição */}
                    <p className="text-silk-400 text-xs md:text-sm line-clamp-2 mb-3 md:mb-4">
                      {material.description}
                    </p>
                    
                    {/* Botão */}
                    {material.isLocked ? (
                      <Button 
                        disabled
                        variant="ghost"
                        size="sm"
                        className="w-full text-silk-400 border border-white/10 text-xs md:text-sm"
                      >
                        <Lock className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                        Bloqueado
                      </Button>
                    ) : (
                      <Button 
                        size="sm"
                        className="w-full bg-gold/10 text-gold hover:bg-gold/20 border border-gold/30 text-xs md:text-sm"
                      >
                        <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" />
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
            <FileText className="w-12 h-12 md:w-16 md:h-16 text-silk-400 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl text-silk-100 font-semibold mb-2">
              Nenhum material encontrado
            </h3>
            <p className="text-silk-400 text-sm md:text-base">
              Não há materiais disponíveis para este filtro.
            </p>
          </div>
        )}

        {/* Card de Destaque */}
        <Card className="mt-6 md:mt-8 bg-gradient-to-r from-gold/10 to-royal/10 border-gold/20 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 text-center sm:text-left">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gold/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-silk-100 mb-1 md:mb-2">
                Materiais Exclusivos
              </h3>
              <p className="text-silk-300 text-sm md:text-base">
                Novos materiais são adicionados regularmente. Continue suas aulas para desbloquear!
              </p>
            </div>
            <Button 
              onClick={() => navigate('/cursos')}
              className="btn-gold flex-shrink-0 w-full sm:w-auto"
            >
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
