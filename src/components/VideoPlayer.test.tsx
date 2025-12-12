import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  youtubeId: string;
  onProgress?: (percentage: number) => void;
  onComplete?: () => void;
}

export function VideoPlayer({ youtubeId, onProgress, onComplete }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(' VideoPlayer montado com ID:', youtubeId);
    console.log(' Plyr disponível?', typeof window.Plyr !== 'undefined');
  }, [youtubeId]);

  return (
    <div ref={containerRef} className="w-full aspect-video bg-black rounded-lg">
      {/* Player de teste - iframe direto */}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&controls=1`}
        className="w-full h-full rounded-lg"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      <p className="text-white text-center mt-2">
        🧪 Teste: {youtubeId} | Plyr: {typeof window.Plyr !== 'undefined' ? '✅' : '❌'}
      </p>
    </div>
  );
}
