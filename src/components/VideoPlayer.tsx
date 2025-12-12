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
      'pip',
      'fullscreen',
    ],
    settings: ['quality', 'speed'],
    youtube: {
      noCookie: true,
      rel: 0,
      showinfo: 0,
      iv_load_policy: 3,
      modestbranding: 1,
    },
    ratio: '16:9' as const,
  };

  const handleTimeUpdate = (event: any) => {
    const player = event.detail.plyr;
    if (player.duration > 0) {
      const percentage = (player.currentTime / player.duration) * 100;

      // Atualizar a cada 5%
      if (percentage % 5 < 0.5) {
        onProgress?.(Math.round(percentage));
      }

      // Celebração aos 90%
      if (percentage >= 90 && !hasCompleted) {
        setHasCompleted(true);

        // Confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Toast
        toast.success(' Parabéns!', {
          description: 'Concluíste esta aula com sucesso!',
        });

        onComplete?.();
      }
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-2xl">
      <Plyr
        source={plyrSource}
        options={plyrOptions}
        onTimeUpdate={handleTimeUpdate}
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
