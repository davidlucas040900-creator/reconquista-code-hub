export interface Lesson {
  id: number;
  title: string;
  description: string;
  youtubeId: string;
  duration: string;
  isBonus?: boolean;
}

export interface Module {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  duration: string;
  lessons: Lesson[];
  progress: number;
  badge: 'NOVO' | 'POPULAR' | 'EXCLUSIVO' | null;
}

export const santuarioModules: Module[] = [
  {
    id: 15,
    title: 'O Poder da Onisciência',
    slug: 'poder-onisciencia',
    description: 'Ele pode mentir para si mesmo. Para ti, nunca mais. Domina a arte de ler microexpressões e detectar mentiras.',
    thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600',
    duration: '60 min',
    lessons: [
      {
        id: 1,
        title: 'A Ciência das Microexpressões',
        description: 'Domina a arte de ler as 7 emoções universais no rosto dele em frações de segundo. Esta é a base da tua nova capacidade de ver a verdade.',
        youtubeId: 'PQ_xOjrT7ls',
        duration: '12 min',
      },
      {
        id: 2,
        title: 'O Interrogatório Silencioso',
        description: 'Aprende as técnicas de observação que os especialistas usam para saber se alguém está a esconder algo, mesmo antes de abrirem a boca.',
        youtubeId: 'gaZ_uoU73u4',
        duration: '15 min',
      },
      {
        id: 3,
        title: 'Descodificando a Voz Masculina',
        description: 'A voz dele é um detector de mentiras. Aprende a analisar o tom, a velocidade e as pausas para saber a intenção real por trás de cada palavra.',
        youtubeId: 'f2uqzkVxVa0',
        duration: '13 min',
      },
      {
        id: 4,
        title: 'As Confissões de um Especialista',
        description: 'Um mestre da linguagem corporal revela os sinais de mentira mais comuns em relacionamentos. Conhecimento de bastidores para o teu arsenal.',
        youtubeId: 'Jigz4Te-x3k',
        duration: '10 min',
      },
      {
        id: 5,
        title: 'O Subtexto das Palavras Dele',
        description: 'Homens raramente dizem o que sentem. Esta aula ensina-te a "traduzir" as frases mais comuns deles para o que elas realmente significam.',
        youtubeId: 'b4-eY7d9zrc',
        duration: '10 min',
      },
    ],
    progress: 0,
    badge: 'EXCLUSIVO',
  },
  {
    id: 16,
    title: 'O Campo de Batalha Digital',
    slug: 'campo-batalha-digital',
    description: 'O teu perfil não é um diário. É uma arma. Aprende a usar as redes sociais como ferramenta estratégica.',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
    duration: '50 min',
    lessons: [
      {
        id: 1,
        title: 'A Arquitetura do Perfil Magnético',
        description: 'Que tipo de foto postar para gerar uma resposta emocional imediata? Aprende a criar a "isca" visual perfeita.',
        youtubeId: 'mhsJfLCPR-Y',
        duration: '14 min',
      },
      {
        id: 2,
        title: 'O Jogo do Mistério Online',
        description: 'O passo a passo para curar o teu perfil de uma forma que o deixa a questionar-se, a desejar saber mais e a sentir que te está a perder.',
        youtubeId: 'IORp0GB71EM',
        duration: '12 min',
      },
      {
        id: 3,
        title: 'A Estratégia do Ciúme Calculado',
        description: 'Como e quando postar para ativar o ciúme dele de forma subtil e elegante, sem parecer desesperada ou óbvia.',
        youtubeId: 'E2FKbGI4F1k',
        duration: '13 min',
      },
      {
        id: 4,
        title: 'Stalkeando o Stalker',
        description: 'Ele está a ver tudo o que postas, mesmo que não interaja. Entende a psicologia por trás do "like" e do "view" e como usar isso a teu favor.',
        youtubeId: 'e-RyIKu14vo',
        duration: '11 min',
      },
    ],
    progress: 0,
    badge: 'POPULAR',
  },
  {
    id: 17,
    title: 'Acesso ao Cérebro Dele',
    slug: 'acesso-cerebro',
    description: 'Palavras não descrevem a realidade. Elas a criam. Scripts poderosos para dominar qualquer conversa.',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
    duration: '48 min',
    lessons: [
      {
        id: 1,
        title: 'O Script do "Estou Confuso"',
        description: 'A resposta exata e desarmante para quando ele usa a desculpa "estou confuso", que o força a tomar uma decisão e a ver-te como uma mulher de alto valor.',
        youtubeId: '7af5gtYD8ew',
        duration: '12 min',
      },
      {
        id: 2,
        title: 'O Script do "Oi, Sumida"',
        description: 'Como responder à mensagem mais temida de todas. A resposta que o tira do pedestal e o coloca a lutar pela tua atenção novamente.',
        youtubeId: '3BABnpl6zGM',
        duration: '10 min',
      },
      {
        id: 3,
        title: 'A Arte do "Frame Control"',
        description: 'Aprende a nunca entrar na "conversa" dele, mas sim a puxá-lo sempre para a tua. A técnica para dominar qualquer discussão sem levantar a voz.',
        youtubeId: 'weIki9ME1bg',
        duration: '14 min',
      },
      {
        id: 4,
        title: 'O Golpe de Misericórdia no Orgulho',
        description: 'A sequência de palavras que fere o ego de um homem orgulhoso e o faz perceber que precisa de ti para se sentir validado.',
        youtubeId: 'YMbPQsUyh64',
        duration: '12 min',
      },
    ],
    progress: 0,
    badge: null,
  },
  {
    id: 18,
    title: 'A Blacklist Masculina',
    slug: 'blacklist-masculina',
    description: 'Alguns homens não são um projeto para consertar. São uma lição para aprender. Imunidade emocional completa.',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
    duration: '52 min',
    lessons: [
      {
        id: 1,
        title: 'Anatomia do Narcisista',
        description: 'Aprende a reconhecer os sinais subtis e os comportamentos de um narcisista para nunca mais caíres na armadilha dele.',
        youtubeId: 'BoT49pnE058',
        duration: '15 min',
      },
      {
        id: 2,
        title: 'O "Menino que Não Cresce" (Síndrome de Peter Pan)',
        description: 'Como identificar o homem que tem medo de compromisso e responsabilidade, e porque ele nunca vai mudar por ti.',
        youtubeId: 'mKDa01fg90A',
        duration: '13 min',
      },
      {
        id: 3,
        title: 'O Manipulador Vitimista',
        description: 'Ele faz-te sentir culpada por tudo? Aprende a identificar e a neutralizar a tática do homem que se faz de vítima para te controlar.',
        youtubeId: '_wBIWLFqZjc',
        duration: '12 min',
      },
      {
        id: 4,
        title: 'O Mapa do Homem Tóxico',
        description: 'Os 5 sinais de alerta que indicam que estás num relacionamento tóxico e que precisas de sair imediatamente.',
        youtubeId: '0GlWHTsgEb4',
        duration: '12 min',
      },
    ],
    progress: 0,
    badge: null,
  },
  {
    id: 19,
    title: 'O Protocolo de Emergência',
    slug: 'protocolo-emergencia',
    description: 'Fizeste asneira? Calma. Até as Deusas erram. A diferença é que elas sabem como consertar.',
    thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600',
    duration: '35 min',
    lessons: [
      {
        id: 1,
        title: 'O Botão de "Desfazer"',
        description: 'Enviaste a mensagem errada? Ligaste a mais? Aprende a técnica para neutralizar uma "burrada" e recuperar a tua postura em menos de 24 horas.',
        youtubeId: '3fLLPjakU7o',
        duration: '12 min',
      },
      {
        id: 2,
        title: 'O Pós-Surto Emocional',
        description: 'Perdeste a cabeça e "soltaste os cachorros" nele? Assiste a este protocolo passo a passo para reverter a situação e usar o teu "surto" a teu favor.',
        youtubeId: 'I-3gCQdDI0s',
        duration: '11 min',
      },
      {
        id: 3,
        title: 'Recuperando a Dignidade Perdida',
        description: 'Se sentes que te humilhaste ou que jogaste a tua dignidade fora, esta aula é o teu plano de primeiros socorros para recuperar o teu valor e o respeito dele.',
        youtubeId: 'aF-NEbT08BM',
        duration: '12 min',
      },
    ],
    progress: 0,
    badge: null,
  },
  {
    id: 20,
    title: 'O Diário da Deusa (BÓNUS)',
    slug: 'diario-deusa',
    description: 'Ele vai voltar. Mas primeiro, tu voltas para ti mesma. Mindset, meditações e afirmações de poder.',
    thumbnail: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600',
    duration: '40 min',
    lessons: [
      {
        id: 1,
        title: 'Para Quando a Dor de Amor Ataca',
        description: 'Uma meditação guiada e palavras de força para ouvires nos momentos de maior sofrimento.',
        youtubeId: 'HZgJgmp3fcw',
        duration: '10 min',
        isBonus: true,
      },
      {
        id: 2,
        title: 'A Arte de "Soltar"',
        description: 'Aprende a soltar a ansiedade e o controlo. Este áudio ensina-te a mentalidade que, paradoxalmente, o faz voltar mais rápido.',
        youtubeId: 'GpmXRB3o-fM',
        duration: '10 min',
        isBonus: true,
      },
      {
        id: 3,
        title: 'Afirmações de Poder "Eu Sou"',
        description: 'Um áudio de 5 minutos com afirmações poderosas para reprogramar a tua mente e a tua energia, para ouvires todas as manhãs.',
        youtubeId: '8uDYf9Z5vWk',
        duration: '5 min',
        isBonus: true,
      },
      {
        id: 4,
        title: 'Meditação Guiada para o Amor Próprio',
        description: 'Uma meditação profunda para reconectar contigo mesma e curar a tua autoestima. Essencial para a tua jornada.',
        youtubeId: 'LUHspFWn0q4',
        duration: '15 min',
        isBonus: true,
      },
    ],
    progress: 0,
    badge: 'NOVO',
  },
];
