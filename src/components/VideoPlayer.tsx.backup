import { useEffect, useRef } from "react";
import Plyr, { APITypes } from "plyr-react";
import "plyr/dist/plyr.css";
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  videoId: string;
  onComplete?: () => void;
  poster?: string;
}

export const VideoPlayer = ({ videoId, onComplete, poster }: VideoPlayerProps) => {
  const ref = useRef<APITypes>(null);

  // Configuração do Player
  const plyrProps = {
    source: {
      type: "video" as const,
      sources: [
        {
          src: videoId,
          provider: "youtube" as const,
        },
      ],
      // Se tiver poster, adiciona aqui
      ...(poster && { poster }),
    },
    options: {
      controls: [
        "play-large",
        "play",
        "progress",
        "current-time",
        "mute",
        "volume",
        "settings",
        "pip",
        "airplay",
        "fullscreen",
      ],
      settings: ["quality", "speed", "loop"],
      youtube: { 
        noCookie: true, 
        rel: 0, 
        showinfo: 0, 
        iv_load_policy: 3, 
        modestbranding: 1 
      },
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
    },
  };

  // Detectar quando o vídeo termina
  useEffect(() => {
    const player = ref.current?.plyr;
    
    if (player) {
      player.on("ended", () => {
        console.log("Aula concluída!");
        if (onComplete) {
          onComplete();
        }
      });
    }
  }, [onComplete]);

  return (
    <Card className="overflow-hidden bg-black aspect-video relative group shadow-2xl border-none ring-1 ring-white/10 rounded-xl">
      <div className="absolute inset-0 z-10 w-full h-full video-wrapper">
        <Plyr
          ref={ref}
          {...plyrProps}
          className="w-full h-full"
        />
      </div>
      
      {/* Estilização Customizada do Plyr para combinar com o tema */}
      <style>{`
        :root {
          --plyr-color-main: #e11d48; /* Cor Rose-600 (Tema do site) */
          --plyr-video-background: #000000;
          --plyr-menu-background: rgba(20, 20, 20, 0.9);
          --plyr-menu-color: #ffffff;
        }
        
        .plyr {
          height: 100%;
          width: 100%;
          font-family: inherit;
        }

        .plyr--full-ui input[type=range] {
          color: var(--plyr-color-main);
        }

        .plyr__control--overlaid {
          background: rgba(225, 29, 72, 0.8);
        }

        .plyr__control--overlaid:hover {
          background: #e11d48;
        }
        
        /* Esconder logo do YouTube o máximo possível */
        .plyr__video-embed iframe {
          top: -50%;
          height: 200%;
        }
      `}</style>
    </Card>
  );
};
