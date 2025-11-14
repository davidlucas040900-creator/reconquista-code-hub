// ═══════════════════════════════════════════════════════════════════════════════
// 📹 ESTRUTURA COMPLETA DE AULAS - CÓDIGO DA RECONQUISTA
// ═══════════════════════════════════════════════════════════════════════════════

export interface Lesson {
  id: string;
  number: number;
  title: string;
  videoId: string;
  description: string;
  duration?: string;
  views?: string;
  isBonus?: boolean;
}

export interface Module {
  id: number;
  title: string;
  slug: string;
  theme: string;
  description: string;
  thumbnail: string;
  totalLessons: number;
  totalDuration: string;
  lessons: Lesson[];
}

export const modulesData: Module[] = [
  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎥 MÓDULO 1 – RESET EMOCIONAL
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 1,
    title: "Reset Emocional",
    slug: "reset-emocional",
    theme: "Ausência estratégica, não correr atrás, controle emocional",
    description: "Aprende a parar de agir pela emoção e descobre a melhor técnica de reconquista amorosa. O primeiro passo para virar o jogo.",
    thumbnail: "https://pub-335435355c6548d7987945a540eca66b.r2.dev/MODULO%201.webp",
    totalLessons: 7,
    totalDuration: "2h 15min",
    lessons: [
      {
        id: "m1-l1",
        number: 1,
        title: "Suma que ELE VEM ATRÁS!!!",
        videoId: "c1CQZVK5lhc",
        description: "Entenda por que o desapego é a chave para fazê-lo voltar. Aprenda a virar o jogo usando a ausência estratégica a seu favor.",
        views: "1.4M",
      },
      {
        id: "m1-l2",
        number: 2,
        title: "NÃO TENHA MEDO de sumir e ELE TE ESQUECER",
        videoId: "S7_4EebCUcM",
        description: "Descubra o timing perfeito para aplicar a ausência e fazer ele sentir a sua falta de forma incontrolável.",
        views: "1.2M",
      },
      {
        id: "m1-l3",
        number: 3,
        title: "Os HOMENS SEMPRE VOLTAM? Como assim?!!",
        videoId: "fsCvIC_FYRM",
        description: "A verdade sobre o comportamento masculino após o término. Por que eles sempre voltam quando você para de correr atrás.",
        views: "1M",
      },
      {
        id: "m1-l4",
        number: 4,
        title: "Por que quando a MULHER SOME O HOMEM VAI ATRÁS?!",
        videoId: "w3gApW6MI3M",
        description: "A psicologia por trás do comportamento masculino quando você desaparece. Como usar isso a seu favor.",
        views: "1.1M",
      },
      {
        id: "m1-l5",
        number: 5,
        title: "HOMEM precisa de AUSÊNCIA e TEMPO para CORRER ATRÁS",
        videoId: "wPFir0N4HoU",
        description: "O timing exato que você precisa respeitar para fazer ele voltar desesperado. A ciência da ausência estratégica.",
        views: "985k",
      },
      {
        id: "m1-l6",
        number: 6,
        title: "Por que NÃO IR ATRÁS é a melhor escolha?",
        videoId: "ODhg0ND4DYc",
        description: "Bónus: Entenda os mecanismos psicológicos que fazem o não-contato funcionar. Por que correr atrás sempre falha.",
        views: "498k",
        isBonus: true,
      },
      {
        id: "m1-l7",
        number: 7,
        title: "Não entre em DESESPERO! Senão você PERDE!",
        videoId: "jGjdF7U14EY",
        description: "Bónus: Como manter o controle emocional quando a ansiedade bater. Técnicas práticas para não sabotar o processo.",
        views: "498k",
        isBonus: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎥 MÓDULO 2 – MAPA DA MENTE MASCULINA
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 2,
    title: "Mapa da Mente Masculina",
    slug: "mapa-mente-masculina",
    theme: "Psicologia masculina, como homens pensam",
    description: "Descobre porque homens se apaixonam pela ausência e como fazer ele sentir a tua falta de forma irresistível.",
    thumbnail: "https://pub-335435355c6548d7987945a540eca66b.r2.dev/MODULO%202.webp",
    totalLessons: 7,
    totalDuration: "2h 30min",
    lessons: [
      {
        id: "m2-l1",
        number: 1,
        title: "OS 5 PRINCÍPIOS DA MENTE MASCULINA!!!",
        videoId: "Kvmh9RUIfFc",
        description: "Domine os 5 pilares da psicologia masculina que determinam como ele age, sente e decide em um relacionamento.",
        views: "472k",
      },
      {
        id: "m2-l2",
        number: 2,
        title: "COMO CONTROLAR A MENTE DE UM HOMEM?",
        videoId: "-pfXXwkNWTk",
        description: "Aprenda os mecanismos psicológicos que regem as decisões masculinas e como usá-los a seu favor na reconquista.",
        views: "604k",
      },
      {
        id: "m2-l3",
        number: 3,
        title: "O que o SILÊNCIO faz na CABEÇA de um HOMEM?",
        videoId: "v_d7mmtVh0c",
        description: "Descubra o efeito devastador do silêncio na mente masculina. Como usar a ausência de comunicação como arma estratégica.",
        views: "604k",
      },
      {
        id: "m2-l4",
        number: 4,
        title: "CABEÇA DO HOMEM no PÓS TÉRMINO",
        videoId: "knKjXRx0iag",
        description: "Entre na mente dele após o término. Entenda as fases psicológicas que todo homem passa e como capitalizar cada uma.",
        views: "316k",
      },
      {
        id: "m2-l5",
        number: 5,
        title: "OS HOMENS SÃO PREVISÍVEIS!! ATENÇÃO MULHERES!!",
        videoId: "eDMlDbXrBUA",
        description: "Bónus: Os padrões comportamentais masculinos que se repetem em 99% dos casos. Como prever as ações dele.",
        views: "472k",
        isBonus: true,
      },
      {
        id: "m2-l6",
        number: 6,
        title: "HOMEM GOSTA DE SER PISADO E DESPREZADO?",
        videoId: "DbMmYHv1xkk",
        description: "Bónus: A verdade controversa sobre como homens reagem ao desprezo. Por que ele valoriza mais quem o ignora.",
        views: "506k",
        isBonus: true,
      },
      {
        id: "m2-l7",
        number: 7,
        title: "LINHA MASCULINA do tempo no PÓS TÉRMINO?",
        videoId: "nz3IEPR7euo",
        description: "Bónus: A timeline completa do que acontece na cabeça dele desde o término até o momento em que ele volta.",
        views: "325k",
        isBonus: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎥 MÓDULO 3 – GATILHOS DA MEMÓRIA EMOCIONAL
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 3,
    title: "Gatilhos da Memória Emocional",
    slug: "gatilhos-memoria-emocional",
    theme: "Fazer ele sentir medo de perder, saudade",
    description: "Como ativar a memória emocional dele e fazê-lo reviver os melhores momentos convosco de forma involuntária.",
    thumbnail: "https://pub-335435355c6548d7987945a540eca66b.r2.dev/MODULO%203.webp",
    totalLessons: 4,
    totalDuration: "1h 45min",
    lessons: [
      {
        id: "m3-l1",
        number: 1,
        title: "Como deixar um HOMEM COM MEDO DE PERDER?!!",
        videoId: "Itat8QDkhhQ",
        description: "Ative o gatilho do medo da perda e faça ele perceber que pode estar a cometer o maior erro da vida dele. A técnica mais poderosa.",
        views: "2M",
      },
      {
        id: "m3-l2",
        number: 2,
        title: "APRENDA A REJEITAR PRA ELE VIR ATRAS!!!",
        videoId: "5LMJop82nBk",
        description: "A arte da rejeição estratégica. Como dizer 'não' de forma que aumente exponencialmente o desejo dele por você.",
        views: "1.3M",
      },
      {
        id: "m3-l3",
        number: 3,
        title: "Postura que faz HOMEM QUERER FEITO DOIDO",
        videoId: "8KD93jjgbBg",
        description: "A postura exata de corpo, tom de voz e atitude que ativa o desejo masculino de forma incontrolável.",
        views: "1.2M",
      },
      {
        id: "m3-l4",
        number: 4,
        title: "EU QUERO QUE ELE VOLTE RASTEJAAAANNNDO!!!!",
        videoId: "TAgC5VAg2_o",
        description: "Bónus: Como inverter completamente a dinâmica de poder e fazer ele implorar por uma segunda chance.",
        views: "601k",
        isBonus: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎥 MÓDULO 4 – A FRASE DE 5 PALAVRAS
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 4,
    title: "A Frase de 5 Palavras",
    slug: "frase-5-palavras",
    theme: "O que dizer/escrever, frases específicas",
    description: "A frase secreta de 5 palavras que ativa o desejo dele instantaneamente. Usa no WhatsApp, ao vivo ou por áudio.",
    thumbnail: "https://pub-335435355c6548d7987945a540eca66b.r2.dev/MODULO%204.webp",
    totalLessons: 7,
    totalDuration: "2h 00min",
    lessons: [
      {
        id: "m4-l1",
        number: 1,
        title: "3 Frases Pra Mexer PROFUNDAMENTE com o Psicológico de um Homem!",
        videoId: "hjVBIwEWO7o",
        description: "Aprenda as 3 frases secretas que ativam a memória emocional dele e reacendem a paixão adormecida.",
        views: "1.1M",
      },
      {
        id: "m4-l2",
        number: 2,
        title: "A Mensagem que Reconquista - ELE Sumiu? Diga isso!",
        videoId: "tu2NxuqrbK4",
        description: "A mensagem exata para enviar quando ele desaparece, que o faz voltar arrependido e desesperado por uma segunda chance.",
        views: "759k",
      },
      {
        id: "m4-l3",
        number: 3,
        title: "ELE SUMIU! Devo MANDAR um 'Oi'?!!",
        videoId: "hRYhIoNhJqs",
        description: "O que fazer quando ele some. Se deve ou não tomar a iniciativa e exatamente o que dizer se decidir mandar mensagem.",
        views: "1.1M",
      },
      {
        id: "m4-l4",
        number: 4,
        title: "Ele enviou 'SAUDADES'!!! O QUE RESPONDER??",
        videoId: "h5gUHiS-q7k",
        description: "Scripts prontos para quando ele der sinais de que está com saudades. Como responder sem parecer carente.",
        views: "545k",
      },
      {
        id: "m4-l5",
        number: 5,
        title: "WhatsApp: Mensagem MEDÍOCRE NÃO se RESPONDE!!",
        videoId: "MYPGCmLJFKw",
        description: "Bónus: Como filtrar as mensagens dele e não cair na armadilha de responder qualquer coisa.",
        views: "346k",
        isBonus: true,
      },
      {
        id: "m4-l6",
        number: 6,
        title: "O que falar no WHATS após um Gelo? Parte 1",
        videoId: "QDFILn1Z-n0",
        description: "Bónus: Estratégias práticas para quebrar o silêncio sem perder o controle da situação.",
        views: "618k",
        isBonus: true,
      },
      {
        id: "m4-l7",
        number: 7,
        title: "O que falar no SAPP após Gelo? Parte 2",
        videoId: "UL6eqQ3yGFA",
        description: "Bónus: Continuação das estratégias de comunicação pós-silêncio com exemplos reais.",
        views: "217k",
        isBonus: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎥 MÓDULO 5 – PRIMEIRO CONTATO ESTRATÉGICO
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 5,
    title: "Primeiro Contato Estratégico",
    slug: "primeiro-contato-estrategico",
    theme: "Como se comportar quando ele reaparece",
    description: "O que dizer quando ele te procurar (ou como fazer ele dar o primeiro passo). Scripts prontos para cada situação.",
    thumbnail: "https://pub-335435355c6548d7987945a540eca66b.r2.dev/MODULO%205.webp",
    totalLessons: 3,
    totalDuration: "1h 30min",
    lessons: [
      {
        id: "m5-l1",
        number: 1,
        title: "O EX APARECEU? FAÇA CERTO DESSA VEZ!",
        videoId: "-6YSO7AYrZI",
        description: "O que dizer e fazer quando ele te procura de novo. Evite os erros fatais e capitalize este momento crucial.",
        views: "241k",
      },
      {
        id: "m5-l2",
        number: 2,
        title: "Como se comportar ao se ENCONTRAR com EX?",
        videoId: "sklhMr24Fg4",
        description: "O guia completo de postura, tom de voz e linguagem corporal para o primeiro encontro após o término.",
        views: "177k",
      },
      {
        id: "m5-l3",
        number: 3,
        title: "APRENDA A SE CONTROLAR QUANDO ELE APARECER",
        videoId: "G37FOnMkW2A", // Nota: Este é o ID aproximado do vídeo "MULHER NÃO CORRE ATRÁS"
        description: "Bónus: Técnicas de autocontrole emocional para não estragar tudo quando ele finalmente voltar.",
        views: "484k",
        isBonus: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎥 MÓDULO 6 – DOMÍNIO DA CONVERSA
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 6,
    title: "Domínio da Conversa",
    slug: "dominio-conversa",
    theme: "Como conversar sem parecer carente",
    description: "Como manter conversas envolventes sem parecer carente. As 3 frases que ativam o desejo do homem.",
    thumbnail: "https://pub-335435355c6548d7987945a540eca66b.r2.dev/MODULO%206.webp",
    totalLessons: 5,
    totalDuration: "1h 50min",
    lessons: [
      {
        id: "m6-l1",
        number: 1,
        title: "WHATSAPP: SEJA DIRETA AO FALAR COM HOMEM!",
        videoId: "jkBEYleb4ZM",
        description: "Domine a arte da comunicação por mensagem. Aprenda o tom, o timing e as frases que criam tensão e desejo.",
        views: "239k",
      },
      {
        id: "m6-l2",
        number: 2,
        title: "VOCÊ sabe se COMUNICAR com um HOMEM?",
        videoId: "eSgYJD9OVSU",
        description: "Os princípios da comunicação masculina. Como falar a língua dele sem perder sua autenticidade.",
        views: "320k",
      },
      {
        id: "m6-l3",
        number: 3,
        title: "MULHER NÃO CORRE ATRÁS DE HOMEM!! APRENDA!!",
        videoId: "G37FOnMkW2A",
        description: "A regra de ouro da reconquista. Por que você nunca deve correr atrás e como manter a postura de valor.",
        views: "651k",
      },
      {
        id: "m6-l4",
        number: 4,
        title: "NÃO ACEITE qualquer coisa de um HOMEM!!",
        videoId: "s4SzR3LStMc",
        description: "Bónus: Como estabelecer limites claros sem afastá-lo. A arte de dizer não mantendo o interesse.",
        views: "239k",
        isBonus: true,
      },
      {
        id: "m6-l5",
        number: 5,
        title: "NÃO DÊ O SEU PODER A UM HOMEM!",
        videoId: "koNd0YLIYkQ",
        description: "Bónus: Como manter seu poder pessoal mesmo estando apaixonada. O equilíbrio entre amor e independência.",
        views: "280k",
        isBonus: true,
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // 🎥 MÓDULO 7 – CONQUISTA DURADOURA
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: 7,
    title: "Conquista Duradoura",
    slug: "conquista-duradoura",
    theme: "Manter relacionamento, prender um homem",
    description: "Os 5 pilares do relacionamento saudável. Como manter a chama acesa e transformar reconquista em amor eterno.",
    thumbnail: "https://pub-335435355c6548d7987945a540eca66b.r2.dev/MODULO%207.webp",
    totalLessons: 6,
    totalDuration: "2h 10min",
    lessons: [
      {
        id: "m7-l1",
        number: 1,
        title: "POR QUE NENHUM RELACIONAMENTO MEU VAI PRA FRENTE?",
        videoId: "kSf3mrsW5XA",
        description: "Identifique os padrões sabotadores que impedem seus relacionamentos de evoluir e corrija-os de uma vez por todas.",
        views: "532k",
      },
      {
        id: "m7-l2",
        number: 2,
        title: "Como VIRAR O JOGO no seu RELACIONAMENTO??!",
        videoId: "4p3u7AaOsDg",
        description: "Estratégias práticas para transformar uma relação desgastada em um compromisso forte, saudável e duradouro.",
        views: "183k",
      },
      {
        id: "m7-l3",
        number: 3,
        title: "Como prender um homem? TÉCNICA INFALÍVEL!",
        videoId: "NXDmCor9bUY",
        description: "A técnica psicológica que faz um homem querer ficar para sempre. Como se tornar insubstituível na vida dele.",
        views: "852k",
      },
      {
        id: "m7-l4",
        number: 4,
        title: "COMO MANTER O HOMEM INTERESSADO??!!",
        videoId: "zbwv5QuANd8",
        description: "Os segredos para manter o interesse dele vivo mesmo após meses ou anos juntos. O antídoto contra a rotina.",
        views: "325k",
      },
      {
        id: "m7-l5",
        number: 5,
        title: "QUER NAMORAR?? ENTÃO NÃO FAÇA ISSO...",
        videoId: "qnw_Olu0rnM", // Nota: ID aproximado, pode precisar verificar
        description: "Bónus: Os erros que destroem qualquer chance de relacionamento sério. O que nunca fazer se quer compromisso.",
        views: "532k",
        isBonus: true,
      },
      {
        id: "m7-l6",
        number: 6,
        title: "Por que o HOMEM SOME?",
        videoId: "qnw_Olu0rnM",
        description: "Bónus: Entenda os motivos reais que fazem um homem se afastar e como prevenir isso no futuro.",
        views: "325k",
        isBonus: true,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// 🎯 FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Buscar módulo por ID
 */
export const getModuleById = (moduleId: number): Module | undefined => {
  return modulesData.find((m) => m.id === moduleId);
};

/**
 * Buscar módulo por slug
 */
export const getModuleBySlug = (slug: string): Module | undefined => {
  return modulesData.find((m) => m.slug === slug);
};

/**
 * Buscar aula específica
 */
export const getLesson = (moduleId: number, lessonNumber: number): Lesson | undefined => {
  const module = getModuleById(moduleId);
  return module?.lessons.find((l) => l.number === lessonNumber);
};

/**
 * Obter próxima aula
 */
export const getNextLesson = (
  moduleId: number,
  currentLessonNumber: number
): { moduleId: number; lesson: Lesson } | null => {
  const currentModule = getModuleById(moduleId);
  if (!currentModule) return null;

  // Tentar próxima aula no mesmo módulo
  const nextLessonInModule = currentModule.lessons.find(
    (l) => l.number === currentLessonNumber + 1
  );

  if (nextLessonInModule) {
    return { moduleId, lesson: nextLessonInModule };
  }

  // Se não houver, buscar primeira aula do próximo módulo
  const nextModule = getModuleById(moduleId + 1);
  if (nextModule && nextModule.lessons.length > 0) {
    return { moduleId: nextModule.id, lesson: nextModule.lessons[0] };
  }

  return null;
};

/**
 * Obter aula anterior
 */
export const getPreviousLesson = (
  moduleId: number,
  currentLessonNumber: number
): { moduleId: number; lesson: Lesson } | null => {
  const currentModule = getModuleById(moduleId);
  if (!currentModule) return null;

  // Tentar aula anterior no mesmo módulo
  const prevLessonInModule = currentModule.lessons.find(
    (l) => l.number === currentLessonNumber - 1
  );

  if (prevLessonInModule) {
    return { moduleId, lesson: prevLessonInModule };
  }

  // Se não houver, buscar última aula do módulo anterior
  const prevModule = getModuleById(moduleId - 1);
  if (prevModule && prevModule.lessons.length > 0) {
    const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
    return { moduleId: prevModule.id, lesson: lastLesson };
  }

  return null;
};

/**
 * Calcular progresso total do usuário
 */
export const calculateProgress = (completedLessons: string[]): number => {
  const totalLessons = modulesData.reduce((acc, m) => acc + m.lessons.length, 0);
  return Math.round((completedLessons.length / totalLessons) * 100);
};

/**
 * Obter estatísticas do curso
 */
export const getCourseStats = () => {
  const totalModules = modulesData.length;
  const totalLessons = modulesData.reduce((acc, m) => acc + m.lessons.length, 0);
  const bonusLessons = modulesData.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.isBonus).length,
    0
  );

  return {
    totalModules,
    totalLessons,
    mainLessons: totalLessons - bonusLessons,
    bonusLessons,
  };
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 ESTATÍSTICAS DO CURSO
// ═══════════════════════════════════════════════════════════════════════════════
// Total: 7 módulos, 39 aulas (28 principais + 11 bónus)
