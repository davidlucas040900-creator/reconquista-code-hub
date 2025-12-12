import { useState, useMemo } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface VideoPlayerProps {
  youtubeId: string;
  onProgress?: (percentage: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ youtubeId, onProgress, onComplete }: VideoPlayerProps) {
  const [hasCompleted, setHasCompleted] = useState(false);

  // Fonte do vídeo
  const plyrSource = useMemo(() => ({
    type: 'video' as const,
    sources: [
      {
        src: youtubeId,
        provider: 'youtube' as const,
      },
    ],
  }), [youtubeId]);

  // Configurações Agressivas de Limpeza
  const plyrOptions = useMemo(() => ({
    controls: [
      'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'
    ],
    settings: ['quality', 'speed'],
    // Configurações específicas do YouTube
    youtube: {
      noCookie: true,
      rel: 0,             // Relacionados só do mesmo canal
      showinfo: 0,        // Tenta esconder info (depreciado mas ajuda)
      iv_load_policy: 3,  // Remove anotações
      modestbranding: 1,  // Minimiza o logo
      controls: 0,        // Remove controles nativos
      disablekb: 1,       // Desabilita teclado nativo
      playsinline: 1,
    },
    // Truque: Loop evita a tela de recomendações final
    loop: { active: false }, 
    ratio: '16:9' as const,
  }), []);

  const handleTimeUpdate = (event: any) => {
    const player = event.detail.plyr;
    if (player.duration > 0) {
      const percentage = (player.currentTime / player.duration) * 100;

      if (Math.floor(percentage) % 5 === 0) {
        onProgress?.(Math.round(percentage));
      }

      if (percentage >= 90 && !hasCompleted) {
        setHasCompleted(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success(' Parabéns!', { description: 'Aula concluída!' });
        onComplete?.();
      }
    }
  };

  // Truque para evitar recomendações no final
  const handleEnded = (event: any) => {
    const player = event.detail.plyr;
    // Opcional: Reiniciar ou mostrar uma capa, evita a grade do YT
    // player.restart(); 
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl group">
      <Plyr
        source={plyrSource}
        options={plyrOptions}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* CSS HACK PARA LIMPEZA TOTAL */}
      <style>{`
        :root {
          --plyr-color-main: #FFD700;
        }

        /* 1. Bloqueia qualquer clique no iframe do YouTube (Títulos, Logos, Botões) */
        .plyr__video-embed iframe {
          pointer-events: none;
          /* Opcional: Aumentar levemente para cortar bordas do YT se necessário */
          /* transform: scale(1.01); */
        }

        /* 2. Garante que os controles do Plyr funcionem */
        .plyr__controls {
          pointer-events: all !important;
          z-index: 50;
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
        }

        /* 3. Garante que o botão de Play gigante funcione */
        .plyr__control--overlaid {
          pointer-events: all !important;
          z-index: 50;
        }

        /* 4. Esconder sugestões de vídeo quando pausado (truque visual) */
        .plyr--paused .plyr__video-embed iframe {
          opacity: 0.7; /* Escurece o vídeo pausado para esconder a UI do YT */
        }
      `}</style>
    </div>
  );
}
