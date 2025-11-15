import { useState } from 'react';
import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

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
      onProgress?.(Math.round(percentage));

      if (percentage >= 90 && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
      }
    }
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
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
