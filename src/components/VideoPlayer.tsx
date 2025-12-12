import { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface VideoPlayerProps {
  youtubeId: string;
  onProgress?: (percentage: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ youtubeId, onProgress, onComplete }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Plyr | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Criar elemento de vídeo para o Plyr
    const videoElement = document.createElement('div');
    videoElement.setAttribute('data-plyr-provider', 'youtube');
    videoElement.setAttribute('data-plyr-embed-id', youtubeId);
    
    // Limpar container e adicionar elemento
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(videoElement);

    // Inicializar Plyr
    playerRef.current = new Plyr(videoElement, {
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
      ratio: '16:9',
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        playsinline: 1,
      },
    });

    const player = playerRef.current;

    // Event listeners
    player.on('ready', () => {
      console.log(' Plyr inicializado para:', youtubeId);
    });

    player.on('timeupdate', () => {
      if (!player.duration) return;
      
      const percentage = (player.currentTime / player.duration) * 100;
      
      if (onProgress) {
        onProgress(Math.round(percentage));
      }

      if (percentage >= 90 && !hasCompleted) {
        setHasCompleted(true);
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast.success(' Parabéns! Aula concluída!');

        if (onComplete) {
          onComplete();
        }
      }
    });

    player.on('ended', () => {
      if (!hasCompleted && onComplete) {
        setHasCompleted(true);
        onComplete();
      }
    });

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [youtubeId, onProgress, onComplete, hasCompleted]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="plyr-container w-full"
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
