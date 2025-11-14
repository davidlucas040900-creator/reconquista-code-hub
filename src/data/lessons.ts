═══════════════════════════════════════════════════════════
📄 ARQUIVO CORRIGIDO: src/data/lessons.ts
═══════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════
// TIPOS E INTERFACES
// ═══════════════════════════════════════════════════════════

export interface LessonData {
  module: number;
  lesson: number;
  title: string;
  videoId: string;
  description: string;
  duration?: string; // Ex: "8 min"
  views?: string; // Ex: "1.4M"
  isBonus?: boolean;
  order?: number; // Ordem de exibição
}

export interface ModuleStats {
  totalLessons: number;
  bonusLessons: number;
  regularLessons: number;
  totalDuration?: string;
}

// ═══════════════════════════════════════════════════════════
// DADOS DAS AULAS (CORRIGIDO E COMPLETO)
// ═══════════════════════════════════════════════════════════

export const lessonsData: LessonData[] = [
  // ═══════════════════════════════════════════════════════════
  // MÓDULO 1 - RESET EMOCIONAL (7 AULAS)
  // ═══════════════════════════════════════════════════════════
  { 
    module: 1, 
    lesson: 1, 
    title: "Suma que ELE VEM ATRÁS!", 
    videoId: "c1CQZVK5lhc", 
    description: "Descubra por que a ausência estratégica é a chave para fazê-lo voltar.",
    duration: "8 min",
    views: "1.4M",
    order: 1
  },
  { 
    module: 1, 
    lesson: 2, 
    title: "NÃO TENHA MEDO de sumir e ELE TE ESQUECER!", 
    videoId: "S7_4EebCUcM", 
    description: "Aprenda a aplicar o distanciamento sem medo de perdê-lo.",
    duration: "7 min",
    views: "1.2M",
    order: 2
  },
  { 
    module: 1, 
    lesson: 3, 
    title: "Os HOMENS SEMPRE VOLTAM Como assim!!", 
    videoId: "fsCvIC_FYRM", 
    description: "Entenda a psicologia por trás do retorno masculino.",
    duration: "9 min",
    views: "1M",
    order: 3
  },
  { 
    module: 1, 
    lesson: 4, 
    title: "HOMEM precisa de AUSÊNCIA e TEMPO para CORRER ATRÁS", 
    videoId: "wPFir0N4HoU", 
    description: "O timing perfeito para aplicar a ausência estratégica.",
    duration: "6 min",
    views: "985K",
    order: 4
  },
  { 
    module: 1, 
    lesson: 5, 
    title: "Por que quando a MULHER SOME O HOMEM VAI ATRÁS? (BÓNUS)", 
    videoId: "w3gApW6MI3M", 
    description: "Entenda a psicologia por trás do movimento de ausência.",
    duration: "7 min",
    views: "1.1M",
    isBonus: true,
    order: 5
  },
  { 
    module: 1, 
    lesson: 6, 
    title: "Por que NÃO IR ATRÁS é a melhor escolha? (BÓNUS)", 
    videoId: "ODhg0ND4DYc", 
    description: "Descubra porque resistir é a estratégia vencedora.",
    duration: "8 min",
    views: "842K",
    isBonus: true,
    order: 6
  },
  { 
    module: 1, 
    lesson: 7, 
    title: "Não entre em DESESPERO! Senão você PERDE! (BÓNUS)", 
    videoId: "jGjdF7U14EY", 
    description: "Como manter o controle emocional em momentos críticos.",
    duration: "7 min",
    views: "498K",
    isBonus: true,
    order: 7
  },

  // ═══════════════════════════════════════════════════════════
  // MÓDULO 2 - MAPA DA MENTE MASCULINA (7 AULAS)
  // ═══════════════════════════════════════════════════════════
  { 
    module: 2, 
    lesson: 1, 
    title: "OS 5 PRINCÍPIOS DA MENTE MASCULINA!", 
    videoId: "Kvmh9RUIfFc", 
    description: "Domine os 5 pilares da psicologia masculina.",
    duration: "10 min",
    views: "472K",
    order: 1
  },
  { 
    module: 2, 
    lesson: 2, 
    title: "COMO CONTROLAR A MENTE DE UM HOMEM?", 
    videoId: "-pfXXwkNWTk", // ✅ CORRIGIDO (adicionado hífen)
    description: "Aprenda os mecanismos psicológicos que regem decisões masculinas.",
    duration: "9 min",
    views: "316K",
    order: 2
  },
  { 
    module: 2, 
    lesson: 3, 
    title: "O que o SILÊNCIO faz na CABEÇA de um HOMEM?", 
    videoId: "v_d7mmtVh0c", 
    description: "O poder do silêncio estratégico na reconquista.",
    duration: "7 min",
    views: "604K",
    order: 3
  },
  { 
    module: 2, 
    lesson: 4, 
    title: "CABEÇA DO HOMEM no PÓS TÉRMINO", 
    videoId: "knKjXRx0iag", 
    description: "Como ele pensa e sente após o término.",
    duration: "8 min",
    views: "316K",
    order: 4
  },
  { 
    module: 2, 
    lesson: 5, 
    title: "OS HOMENS SÃO PREVISÍVEIS!! ATENÇÃO MULHERES!! (BÓNUS)", 
    videoId: "eDMlDbXrBUA", 
    description: "Descubra os padrões comportamentais masculinos.",
    duration: "9 min",
    views: "472K",
    isBonus: true,
    order: 5
  },
  { 
    module: 2, 
    lesson: 6, 
    title: "HOMEM GOSTA DE SER PISADO E DESPREZADO? (BÓNUS)", 
    videoId: "DbMmYHv1xkk", 
    description: "A verdade sobre valorização e desprezo.",
    duration: "7 min",
    views: "506K",
    isBonus: true,
    order: 6
  },
  { 
    module: 2, 
    lesson: 7, 
    title: "LINHA MASCULINA do tempo no PÓS TÉRMINO? (BÓNUS)", 
    videoId: "nz3IEPR7euo", 
    description: "A cronologia emocional masculina após o fim.",
    duration: "8 min",
    views: "325K",
    isBonus: true,
    order: 7
  },

  // ═══════════════════════════════════════════════════════════
  // MÓDULO 3 - GATILHOS DA MEMÓRIA EMOCIONAL (4 AULAS)
  // ═══════════════════════════════════════════════════════════
  { 
    module: 3, 
    lesson: 1, 
    title: "Como deixar um HOMEM COM MEDO DE PERDER!", 
    videoId: "Itat8QDkhhQ", 
    description: "Ative o gatilho do medo da perda.",
    duration: "12 min",
    views: "2M",
    order: 1
  },
  { 
    module: 3, 
    lesson: 2, 
    title: "APRENDA A REJEITAR PRA ELE VIR ATRAS!", 
    videoId: "5LMJop82nBk", 
    description: "A arte de rejeitar estrategicamente.",
    duration: "9 min",
    views: "1.3M",
    order: 2
  },
  { 
    module: 3, 
    lesson: 3, 
    title: "Postura que faz HOMEM QUERER FEITO DOIDO", 
    videoId: "8KD93jjgbBg", 
    description: "A postura que desperta desejo irresistível.",
    duration: "8 min",
    views: "1.2M",
    order: 3
  },
  { 
    module: 3, 
    lesson: 4, 
    title: "EU QUERO QUE ELE VOLTE RASTEJANDO! (BÓNUS)", 
    videoId: "TAgC5VAg2_o", 
    description: "Como fazê-lo implorar pela sua atenção.",
    duration: "9 min",
    views: "601K",
    isBonus: true,
    order: 4
  },

  // ═══════════════════════════════════════════════════════════
  // MÓDULO 4 - A FRASE DE 5 PALAVRAS (3 AULAS)
  // ═══════════════════════════════════════════════════════════
  { 
    module: 4, 
    lesson: 1, 
    title: "3 Frases Pra Mexer PROFUNDAMENTE com o Psicológico de um Homem!", 
    videoId: "hjVBIwEWO7o", 
    description: "As 3 frases secretas que ativam memória emocional.",
    duration: "11 min",
    views: "545K",
    order: 1
  },
  { 
    module: 4, 
    lesson: 2, 
    title: "A Mensagem que Reconquista - ELE Sumiu? Diga isso!", 
    videoId: "tu2NxuqrbK4", 
    description: "A mensagem exata para quando ele desaparece.",
    duration: "10 min",
    views: "759K",
    order: 2
  },
  { 
    module: 4, 
    lesson: 3, 
    title: "ELE SUMIU! Devo MANDAR um 'Oi'?", 
    videoId: "hRYhIoNhJqs", 
    description: "Como reagir quando ele some.",
    duration: "7 min",
    views: "1.1M",
    order: 3
  },

  // ═══════════════════════════════════════════════════════════
  // MÓDULO 5 - PRIMEIRO CONTATO ESTRATÉGICO (3 AULAS)
  // ═══════════════════════════════════════════════════════════
  { 
    module: 5, 
    lesson: 1, 
    title: "O EX APARECEU? FAÇA CERTO DESSA VEZ!", 
    videoId: "-6YSO7AYrZI", // ✅ CORRIGIDO (adicionado hífen)
    description: "O que dizer e fazer quando ele te procura.",
    duration: "12 min",
    views: "241K",
    order: 1
  },
  { 
    module: 5, 
    lesson: 2, 
    title: "Como se comportar ao se ENCONTRAR com EX?", 
    videoId: "sklhMr24Fg4", 
    description: "Guia completo de postura e linguagem corporal.",
    duration: "11 min",
    views: "177K",
    order: 2
  },
  { 
    module: 5, 
    lesson: 3, 
    title: "Ele enviou 'SAUDADES'!!! O QUE RESPONDER?", 
    videoId: "h5gUHiS-q7k", 
    description: "A resposta perfeita para reconquistar.",
    duration: "9 min",
    views: "545K",
    order: 3
  },

  // ═══════════════════════════════════════════════════════════
  // MÓDULO 6 - DOMÍNIO DA CONVERSA (5 AULAS)
  // ═══════════════════════════════════════════════════════════
  { 
    module: 6, 
    lesson: 1, 
    title: "WHATSAPP: SEJA DIRETA AO FALAR COM HOMEM!", 
    videoId: "jkBEYleb4ZM", 
    description: "Domine a comunicação por mensagem.",
    duration: "9 min",
    views: "239K",
    order: 1
  },
  { 
    module: 6, 
    lesson: 2, 
    title: "WhatsApp: Mensagem MEDÍOCRE NÃO se RESPONDE!!", 
    videoId: "MYPGCmLJFKw", 
    description: "Como identificar e lidar com mensagens rasas.",
    duration: "7 min",
    views: "346K",
    order: 2
  },
  { 
    module: 6, 
    lesson: 3, 
    title: "VOCÊ sabe se COMUNICAR com um HOMEM?", 
    videoId: "eSgYJD9OVSU", 
    description: "A arte da comunicação eficaz.",
    duration: "8 min",
    views: "239K",
    order: 3
  },
  { 
    module: 6, 
    lesson: 4, 
    title: "O que falar no WHATS após um Gelo? Parte 1 (BÓNUS)", 
    videoId: "QDFILn1Z-n0", 
    description: "Estratégias para quebrar o gelo - Parte 1.",
    duration: "9 min",
    views: "618K",
    isBonus: true,
    order: 4
  },
  { 
    module: 6, 
    lesson: 5, 
    title: "O que falar no SAPP após Gelo? Parte 2 (BÓNUS)", 
    videoId: "UL6eqQ3yGFA", 
    description: "Estratégias para quebrar o gelo - Parte 2.",
    duration: "8 min",
    views: "217K",
    isBonus: true,
    order: 5
  },

  // ═══════════════════════════════════════════════════════════
  // MÓDULO 7 - CONQUISTA DURADOURA (6 AULAS)
  // ═══════════════════════════════════════════════════════════
  { 
    module: 7, 
    lesson: 1, 
    title: "POR QUE NENHUM RELACIONAMENTO MEU VAI PRA FRENTE?", 
    videoId: "kSf3mrsW5XA", 
    description: "Identifique padrões sabotadores.",
    duration: "11 min",
    views: "532K",
    order: 1
  },
  { 
    module: 7, 
    lesson: 2, 
    title: "Como VIRAR O JOGO no seu RELACIONAMENTO?", 
    videoId: "4p3u7AaOsDg", 
    description: "Estratégias para transformar sua relação.",
    duration: "9 min",
    views: "183K",
    order: 2
  },
  { 
    module: 7, 
    lesson: 3, 
    title: "Como prender um homem? TÉCNICA INFALÍVEL!", 
    videoId: "NXDmCor9bUY", 
    description: "A técnica definitiva para mantê-lo apaixonado.",
    duration: "10 min",
    views: "852K",
    order: 3
  },
  { 
    module: 7, 
    lesson: 4, 
    title: "COMO MANTER O HOMEM INTERESSADO?", 
    videoId: "zbwv5QuANd8", 
    description: "Mantenha a chama acesa para sempre.",
    duration: "8 min",
    views: "325K",
    order: 4
  },
  { 
    module: 7, 
    lesson: 5, 
    title: "NÃO ACEITE qualquer coisa de um HOMEM!! (BÓNUS)", 
    videoId: "s4SzR3LStMc", 
    description: "Estabeleça padrões elevados e mantenha-os.",
    duration: "7 min",
    views: "239K",
    isBonus: true,
    order: 5
  },
  { 
    module: 7, 
    lesson: 6, 
    title: "NÃO DÊ O SEU PODER A UM HOMEM! (BÓNUS)", 
    videoId: "koNd0YLIYkQ", 
    description: "Mantenha o seu poder pessoal sempre.",
    duration: "7 min",
    views: "152K",
    isBonus: true,
    order: 6
  },
];

// ═══════════════════════════════════════════════════════════
// ÍNDICES PARA PERFORMANCE (O(1) lookup)
// ═══════════════════════════════════════════════════════════

// Cache de módulos para busca rápida
const lessonsByModule = new Map<number, LessonData[]>();
const lessonByKey = new Map<string, LessonData>();

// Inicializar índices
lessonsData.forEach(lesson => {
  // Índice por módulo
  if (!lessonsByModule.has(lesson.module)) {
    lessonsByModule.set(lesson.module, []);
  }
  lessonsByModule.get(lesson.module)!.push(lesson);
  
  // Índice por chave única
  const key = `${lesson.module}-${lesson.lesson}`;
  lessonByKey.set(key, lesson);
});

// ═══════════════════════════════════════════════════════════
// CONSTANTES DE VALIDAÇÃO
// ═══════════════════════════════════════════════════════════

export const EXPECTED_MODULE_COUNTS = {
  1: 7,
  2: 7,
  3: 4,
  4: 3,
  5: 3,
  6: 5,
  7: 6,
} as const;

export const TOTAL_MODULES = 7;
export const TOTAL_LESSONS = 35;

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS OTIMIZADAS
// ═══════════════════════════════════════════════════════════

/**
 * Busca uma aula específica - O(1) com Map
 */
export const getLessonData = (moduleNumber: number, lessonNumber: number): LessonData | undefined => {
  const key = `${moduleNumber}-${lessonNumber}`;
  const lesson = lessonByKey.get(key);
  
  if (!lesson) {
    console.error(`❌ Aula não encontrada: Módulo ${moduleNumber}, Aula ${lessonNumber}`);
  }
  
  return lesson;
};

/**
 * Retorna todas as aulas de um módulo - O(1) com Map
 */
export const getModuleLessons = (moduleNumber: number): LessonData[] => {
  const lessons = lessonsByModule.get(moduleNumber) || [];
  
  if (lessons.length === 0) {
    console.warn(`⚠️ Nenhuma aula encontrada para o módulo ${moduleNumber}`);
  }
  
  return lessons;
};

/**
 * Retorna a próxima aula (mesmo módulo ou próximo módulo)
 */
export const getNextLesson = (moduleNumber: number, lessonNumber: number): LessonData | null => {
  const currentIndex = lessonsData.findIndex(
    l => l.module === moduleNumber && l.lesson === lessonNumber
  );
  
  if (currentIndex === -1 || currentIndex === lessonsData.length - 1) {
    return null;
  }
  
  return lessonsData[currentIndex + 1];
};

/**
 * Retorna a aula anterior
 */
export const getPreviousLesson = (moduleNumber: number, lessonNumber: number): LessonData | null => {
  const currentIndex = lessonsData.findIndex(
    l => l.module === moduleNumber && l.lesson === lessonNumber
  );
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return lessonsData[currentIndex - 1];
};

/**
 * Total de aulas (geral ou por módulo)
 */
export const getTotalLessons = (moduleNumber?: number): number => {
  if (moduleNumber) {
    return lessonsByModule.get(moduleNumber)?.length || 0;
  }
  return lessonsData.length;
};

/**
 * Calcula progresso do módulo
 */
export const getModuleProgress = (moduleNumber: number, completedLessons: number[]): number => {
  const moduleLessons = getModuleLessons(moduleNumber);
  const completed = moduleLessons.filter(l => 
    completedLessons.includes(l.lesson)
  ).length;
  
  return moduleLessons.length > 0 
    ? Math.round((completed / moduleLessons.length) * 100)
    : 0;
};

/**
 * Estatísticas de um módulo
 */
export const getModuleStats = (moduleNumber: number): ModuleStats => {
  const lessons = getModuleLessons(moduleNumber);
  const bonusLessons = lessons.filter(l => l.isBonus).length;
  
  return {
    totalLessons: lessons.length,
    bonusLessons,
    regularLessons: lessons.length - bonusLessons,
  };
};

/**
 * Retorna apenas aulas regulares (não bónus)
 */
export const getRegularLessons = (moduleNumber: number): LessonData[] => {
  return getModuleLessons(moduleNumber).filter(l => !l.isBonus);
};

/**
 * Retorna apenas aulas bónus
 */
export const getBonusLessons = (moduleNumber: number): LessonData[] => {
  return getModuleLessons(moduleNumber).filter(l => l.isBonus);
};

/**
 * Valida se todos os módulos têm a contagem esperada
 */
export const validateLessonCounts = (): boolean => {
  let isValid = true;
  
  Object.entries(EXPECTED_MODULE_COUNTS).forEach(([module, expected]) => {
    const actual = getTotalLessons(Number(module));
    if (actual !== expected) {
      console.error(`❌ Módulo ${module}: esperado ${expected} aulas, encontrado ${actual}`);
      isValid = false;
    }
  });
  
  return isValid;
};

/**
 * Verifica duplicatas de videoId
 */
export const checkDuplicateVideos = (): void => {
  const videoIds = new Set<string>();
  const duplicates: string[] = [];
  
  lessonsData.forEach(lesson => {
    if (videoIds.has(lesson.videoId)) {
      duplicates.push(lesson.videoId);
    } else {
      videoIds.add(lesson.videoId);
    }
  });
  
  if (duplicates.length > 0) {
    console.warn(`⚠️ Vídeos duplicados encontrados:`, duplicates);
  }
};

/**
 * Valida formato do YouTube ID
 */
export const isValidYouTubeId = (videoId: string): boolean => {
  // YouTube IDs têm 11 caracteres (ou 12 com hífen inicial para não listados)
  return /^-?[\w-]{11}$/.test(videoId);
};

/**
 * Valida integridade dos dados
 */
export const validateLessonsData = (): void => {
  console.log('🔍 Validando dados das aulas...');
  
  // Validar contagens
  validateLessonCounts();
  
  // Verificar duplicatas
  checkDuplicateVideos();
  
  // Validar YouTube IDs
  lessonsData.forEach(lesson => {
    if (!isValidYouTubeId(lesson.videoId)) {
      console.error(`❌ YouTube ID inválido no Módulo ${lesson.module}, Aula ${lesson.lesson}: ${lesson.videoId}`);
    }
  });
  
  console.log(`✅ Total de aulas: ${lessonsData.length}`);
  console.log(`✅ Total de módulos: ${lessonsByModule.size}`);
};

// ═══════════════════════════════════════════════════════════
// EXECUTAR VALIDAÇÃO EM DESENVOLVIMENTO
// ═══════════════════════════════════════════════════════════

if (import.meta.env?.DEV) {
  validateLessonsData();
}

═══════════════════════════════════════════════════════════
