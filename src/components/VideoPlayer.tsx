import { useState, useMemo } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';
import { toast } from 'sonner';

interface VideoPlayerProps {
  youtubeId: string;
  onProgress?: (percentage: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ youtubeId, onProgress, onComplete }: VideoPlayerProps) {
  const [hasCompleted, setHasCompleted] = useState(false);

  const plyrSource = useMemo(() => ({
    type: 'video' as const,
    sources: [
      {
        src: youtubeId,
        provider: 'youtube' as const,
      },
    ],
  }), [youtubeId]);

  const plyrOptions = useMemo(() => ({
    controls: [
      'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'
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
      playsinline: 1,
    },
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
        toast.success('Aula concluída!');
        onComplete?.();
      }
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      <Plyr
        source={plyrSource}
        options={plyrOptions}
        onTimeUpdate={handleTimeUpdate}
      />

      <style>{`
        :root {
          --plyr-color-main: hsl(var(--primary));
        }

        .plyr__video-embed iframe {
          pointer-events: none;
        }

        .plyr__controls {
          pointer-events: all !important;
          z-index: 50;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        }

        .plyr__control--overlaid {
          pointer-events: all !important;
          z-index: 50;
        }
      `}</style>
    </div>
  );
}
