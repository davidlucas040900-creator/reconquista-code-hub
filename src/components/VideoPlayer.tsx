import { useEffect, useRef, useState } from 'react';
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  youtubeId: string;
  onProgress?: (percentage: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ youtubeId, onProgress, onComplete }: VideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const plyrInstanceRef = useRef<Plyr | null>(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerRef.current || !youtubeId) return;

    setIsLoading(true);

    // Limpar instância anterior
    if (plyrInstanceRef.current) {
      plyrInstanceRef.current.destroy();
    }

    try {
      const player = new Plyr(playerRef.current, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
        settings: ['quality', 'speed'],
        youtube: {
          noCookie: true,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          modestbranding: 1,
        },
        ratio: '16:9',
      });

      plyrInstanceRef.current = player;

      // Loading completo quando o player está pronto
      player.on('ready', () => {
        setIsLoading(false);
        setError(null);
      });

      player.on('error', () => {
        setError('Erro ao carregar vídeo');
        setIsLoading(false);
      });

      player.on('timeupdate', () => {
        if (player.duration > 0) {
          const percentage = (player.currentTime / player.duration) * 100;
          onProgress?.(Math.round(percentage));

          if (percentage >= 90 && !hasCompleted) {
            setHasCompleted(true);
            onComplete?.();
          }
        }
      });

    } catch (error) {
      setError('Falha ao inicializar player');
      setIsLoading(false);
    }

    return () => {
      if (plyrInstanceRef.current) {
        plyrInstanceRef.current.destroy();
      }
    };
  }, [youtubeId]);

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-white text-sm">Carregando vídeo...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
          <div className="text-center p-8">
            <p className="text-red-500 mb-4">❌ {error}</p>
            <a
              href={`https://www.youtube.com/watch?v=${youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Abrir no YouTube
            </a>
          </div>
        </div>
      )}

      {/* Player */}
      <div
        ref={playerRef}
        data-plyr-provider="youtube"
        data-plyr-embed-id={youtubeId}
        className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-500'}
      />

      <style>{`
        :root {
          --plyr-color-main: #FFD700;
          --plyr-video-control-background-hover: #E50914;
        }
      `}</style>
    </div>
  );
}
