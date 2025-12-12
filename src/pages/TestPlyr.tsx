import { VideoPlayer } from '@/components/VideoPlayer';

export default function TestPlyr() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-4">
        <h1 className="text-white text-2xl font-bold text-center">Teste Plyr.io</h1>
        
        <div className="border border-white/20 rounded-xl overflow-hidden shadow-2xl">
          <VideoPlayer 
            youtubeId="PQ_xOjrT7ls" // ID de uma aula do Santuário
            onProgress={(p) => console.log('Progresso:', p)}
            onComplete={() => alert('Vídeo terminou!')}
          />
        </div>

        <p className="text-gray-400 text-center text-sm">
          Se você vê este player customizado, o Plyr está funcionando.
        </p>
      </div>
    </div>
  );
}
