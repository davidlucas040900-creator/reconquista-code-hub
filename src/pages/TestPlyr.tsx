import Plyr from 'plyr-react';
import 'plyr-react/plyr.css';

export default function TestPlyr() {
  const plyrSource = {
    type: 'video' as const,
    sources: [
      {
        src: 'BW7wLQECPkc', // ID fixo para teste
        provider: 'youtube' as const,
      },
    ],
  };

  const plyrOptions = {
    controls: ['play-large', 'play', 'progress', 'current-time', 'fullscreen'],
    youtube: { noCookie: true, rel: 0, modestbranding: 1 },
  };

  return (
    <div style={{ padding: '20px', background: '#000', minHeight: '100vh' }}>
      <h1 style={{ color: 'white' }}> TESTE PLYR ISOLADO</h1>
      <p style={{ color: 'yellow' }}>Se aparecer player customizado = Plyr funciona!</p>
      <p style={{ color: 'cyan' }}>Se aparecer YouTube normal = Problema no Plyr</p>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Plyr source={plyrSource} options={plyrOptions} />
      </div>
      
      <div style={{ color: 'white', marginTop: '20px' }}>
        <p>Versão Plyr: {typeof window !== 'undefined' && window.Plyr ? ' Carregado' : ' Não carregado'}</p>
        <p>Timestamp: {new Date().toISOString()}</p>
      </div>
    </div>
  );
}
