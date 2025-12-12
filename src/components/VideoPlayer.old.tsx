import { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface VideoPlayerProps {
  youtubeId: string;
  onProgress?: (percentage: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ youtubeId, onProgress, onComplete }: VideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const plyrInstance = useRef<Plyr | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!playerRef.current) return;

    // Configuração avançada do Plyr com proteções
    plyrInstance.current = new Plyr(playerRef.current, {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'settings',
        'fullscreen',
      ],
      settings: ['quality', 'speed'],
      quality: {
        default: 720,
        options: [1080, 720, 480, 360],
      },
      speed: {
        selected: 1,
        options: [0.5, 0.75, 1, 1.25, 1.5, 2],
      },
      ratio: '16:9',
      fullscreen: {
        enabled: true,
        fallback: true,
        iosNative: false,
      },
      storage: {
        enabled: true,
        key: 'plyr_volume',
      },
      keyboard: {
        focused: true,
        global: false,
      },
      tooltips: {
        controls: true,
        seek: true,
      },
      captions: {
        active: false,
        language: 'pt',
      },
      // Configurações do YouTube com proteção máxima
      youtube: {
        noCookie: true,           // Usa youtube-nocookie.com
        rel: 0,                   // Desabilita vídeos relacionados
        showinfo: 0,              // Remove informações do vídeo
        iv_load_policy: 3,        // Remove anotações
        modestbranding: 1,        // Remove logo do YouTube
        playsinline: 1,           // Play inline em mobile
        controls: 0,              // Remove controles nativos do YouTube
        disablekb: 1,             // Desabilita atalhos do teclado do YouTube
        fs: 0,                    // Remove botão de fullscreen do YouTube (usa o do Plyr)
        enablejsapi: 1,           // Habilita API JavaScript
        origin: window.location.origin,
      },
      // Configurações de autoplay e loop
      autoplay: false,
      muted: false,
      loop: {
        active: false,
      },
      // Configurações de qualidade
      iconUrl: '',
      blankVideo: '',
    });

    const player = plyrInstance.current;

    // Event: Quando o vídeo está pronto
    player.on('ready', () => {
      console.log(' Player pronto:', youtubeId);
    });

    // Event: Atualização de tempo (tracking de progresso)
    player.on('timeupdate', () => {
      const percentage = (player.currentTime / player.duration) * 100;
      
      if (onProgress) {
        onProgress(Math.round(percentage));
      }

      // Marcar como completo quando atingir 90%
      if (percentage >= 90 && !hasCompleted) {
        setHasCompleted(true);
        
        // Confetti ao completar
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success('🎉 Parabéns! Aula concluída!', {
          description: 'Continue assim e domine o jogo!',
        });

        if (onComplete) {
          onComplete();
        }
      }
    });

    // Event: Erro no carregamento
    player.on('error', (event: any) => {
      console.error('❌ Erro no player:', event);
      toast.error('Erro ao carregar vídeo', {
        description: 'Tente recarregar a página.',
      });
    });

    // Event: Quando o vídeo termina
    player.on('ended', () => {
      if (!hasCompleted) {
        setHasCompleted(true);
        if (onComplete) {
          onComplete();
        }
      }
    });

    // Proteções adicionais
    // Prevenir clique com botão direito
    const videoContainer = playerRef.current;
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    videoContainer?.addEventListener('contextmenu', preventContextMenu);

    // Cleanup
    return () => {
      videoContainer?.removeEventListener('contextmenu', preventContextMenu);
      player.destroy();
    };
  }, [youtubeId, onProgress, onComplete, hasCompleted]);

  return (
    <div className="relative w-full">
      {/* Proteção contra download */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ userSelect: 'none' }}
      />
      
      {/* Player Container */}
      <div
        ref={playerRef}
        data-plyr-provider="youtube"
        data-plyr-embed-id={youtubeId}
        className="plyr-container"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }}
      />

      {/* CSS customizado para Plyr */}
      <style jsx>{`
        :global(.plyr) {
          border-radius: 8px;
          overflow: hidden;
        }

        :global(.plyr__controls) {
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        }

        :global(.plyr__control--overlaid) {
          background: rgba(255, 255, 255, 0.9);
        }

        :global(.plyr__control--overlaid:hover) {
          background: rgba(255, 255, 255, 1);
        }

        :global(.plyr__control--overlaid svg) {
          fill: #000;
        }

        /* Prevenir seleção de texto */
        :global(.plyr *) {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        /* Remover logo do YouTube */
        :global(.plyr__video-embed iframe) {
          pointer-events: none;
        }

        /* Customização dos controles */
        :global(.plyr__control) {
          color: #fff;
        }

        :global(.plyr__control:hover) {
          background: rgba(255, 255, 255, 0.1);
        }

        :global(.plyr__progress__buffer) {
          background: rgba(255, 255, 255, 0.25);
        }

        :global(.plyr__volume) {
          max-width: 90px;
        }

        /* Mobile responsivo */
        @media (max-width: 768px) {
          :global(.plyr__volume) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
