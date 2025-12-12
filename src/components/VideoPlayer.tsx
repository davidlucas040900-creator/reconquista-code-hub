import { useState } from 'react';
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

  const plyrSource = {
    type: 'video' as const,
    sources: [
      {
        src: youtubeId,
        provider: 'youtube' as const,
      },
    ],
  };

  const plyrOptions = {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'mute',
      'volume',
      'settings',
      'fullscreen',
    ],
    settings: ['quality', 'speed'],
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
      cc_load_policy: 0,
      autoplay: 0,
    },
    ratio: '16:9' as const,
    hideControls: false,
    resetOnEnd: false,
    keyboard: { focused: true, global: false },
  };

  const handleTimeUpdate = (event: any) => {
    const player = event.detail.plyr;
    if (player.duration > 0) {
      const percentage = (player.currentTime / player.duration) * 100;

      if (percentage % 5 < 0.5) {
        onProgress?.(Math.round(percentage));
      }

      if (percentage >= 90 && !hasCompleted) {
        setHasCompleted(true);

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast.success(' Parabéns!', {
          description: 'Concluíste esta aula com sucesso!',
        });

        onComplete?.();
      }
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl plyr-wrapper">
      <Plyr
        source={plyrSource}
        options={plyrOptions}
        onTimeUpdate={handleTimeUpdate}
      />

      <style>{`
        /* Cores customizadas do Plyr */
        :root {
          --plyr-color-main: #FFD700;
          --plyr-video-control-background-hover: #E50914;
        }

        /* ESCONDER ELEMENTOS DO YOUTUBE */
        .plyr-wrapper .ytp-title,
        .plyr-wrapper .ytp-chrome-top,
        .plyr-wrapper .ytp-show-cards-title,
        .plyr-wrapper .ytp-watermark,
        .plyr-wrapper .ytp-gradient-top,
        .plyr-wrapper .ytp-gradient-bottom,
        .plyr-wrapper .ytp-pause-overlay,
        .plyr-wrapper .ytp-endscreen-content,
        .plyr-wrapper .ytp-cards-teaser,
        .plyr-wrapper .iv-branding,
        .plyr-wrapper .ytp-ce-element {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }

        /* Forçar z-index dos controles do Plyr */
        .plyr__controls {
          z-index: 9999 !important;
        }

        /* Esconder overlay de pausa do YouTube */
        .plyr__video-embed iframe {
          pointer-events: none;
        }

        .plyr__video-embed:hover iframe {
          pointer-events: auto;
        }

        /* Remover qualquer overlay */
        .plyr__poster {
          z-index: 1;
        }

        .plyr--playing .ytp-gradient-top,
        .plyr--playing .ytp-chrome-top {
          opacity: 0 !important;
        }
      `}</style>
    </div>
  );
}
