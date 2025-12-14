import { useState, useMemo, useRef, useEffect } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import { toast } from 'sonner';

interface VideoPlayerProps {
  videoUrl?: string;
  youtubeId?: string;
  onProgress?: (percentage: number) => void;
  onComplete?: () => void;
}

// Função para extrair ID do YouTube de várias URLs
function extractYoutubeId(url: string): string {
  if (!url) return '';
  
  // Se já for apenas o ID (11 caracteres)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  
  // Padrões de URL do YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return url;
}

export function VideoPlayer({ videoUrl, youtubeId, onProgress, onComplete }: VideoPlayerProps) {
  const [hasCompleted, setHasCompleted] = useState(false);
  const [lastReportedProgress, setLastReportedProgress] = useState(0);
  const playerRef = useRef<any>(null);

  // Usar youtubeId se fornecido, senão extrair de videoUrl
  const videoId = youtubeId || extractYoutubeId(videoUrl || '');

  const plyrSource = useMemo(() => ({
    type: 'video' as const,
    sources: [{ 
      src: videoId, 
      provider: 'youtube' as const 
    }],
  }), [videoId]);

  const plyrOptions = useMemo(() => ({
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      'settings',
      'fullscreen'
    ],
    settings: ['quality', 'speed'],
    youtube: { 
      noCookie: true, 
      rel: 0, 
      showinfo: 0, 
      iv_load_policy: 3, 
      modestbranding: 1,
      playsinline: 1
    },
    loop: { active: false },
    ratio: '16:9',
    hideControls: false,
    resetOnEnd: false,
  }), []);

  // Handler para progresso do vídeo
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (playerRef.current?.plyr) {
        const player = playerRef.current.plyr;
        if (player.duration > 0) {
          const percentage = Math.round((player.currentTime / player.duration) * 100);
          
          // Reportar progresso a cada 5%
          if (percentage >= lastReportedProgress + 5) {
            setLastReportedProgress(percentage);
            onProgress?.(percentage);
          }
          
          // Marcar como completa em 90%
          if (percentage >= 90 && !hasCompleted) {
            setHasCompleted(true);
            onComplete?.();
          }
        }
      }
    };

    const interval = setInterval(handleTimeUpdate, 1000);
    return () => clearInterval(interval);
  }, [lastReportedProgress, hasCompleted, onProgress, onComplete]);

  if (!videoId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-900 flex items-center justify-center">
        <p className="text-zinc-400">Vídeo não disponível</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <Plyr 
        ref={playerRef}
        source={plyrSource} 
        options={plyrOptions}
      />
      <style>{`
        :root {
          --plyr-color-main: #a855f7;
        }
        .plyr {
          --plyr-video-background: #000;
        }
        .plyr__video-embed iframe {
          pointer-events: auto;
        }
        .plyr__controls {
          pointer-events: all !important;
          z-index: 50;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        }
        .plyr__control--overlaid {
          pointer-events: all !important;
          z-index: 50;
          background: rgba(168, 85, 247, 0.9) !important;
        }
        .plyr__control--overlaid:hover {
          background: rgba(168, 85, 247, 1) !important;
        }
        .plyr--full-ui input[type=range] {
          color: #a855f7;
        }
        .plyr__progress__buffer {
          background: rgba(168, 85, 247, 0.3);
        }
      `}</style>
    </div>
  );
}
