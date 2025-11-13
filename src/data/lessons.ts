export interface LessonData {
  module: number;
  lesson: number;
  title: string;
  videoId: string;
  description?: string;
}

export const lessonsData: LessonData[] = [
  // Módulo 1
  { module: 1, lesson: 1, title: "Suma que ELE VEM ATRÁS!", videoId: "c1CQZVK5lhc", description: "Descubra por que a ausência estratégica é a chave para fazê-lo voltar." },
  { module: 1, lesson: 2, title: "NÃO TENHA MEDO de sumir e ELE TE ESQUECER!", videoId: "S7_4EebCUcM", description: "Aprenda a aplicar o distanciamento sem medo de perdê-lo." },
  { module: 1, lesson: 3, title: "Os HOMENS SEMPRE VOLTAM Como assim!!", videoId: "fsCvIC_FYRM", description: "Entenda a psicologia por trás do retorno masculino." },
  { module: 1, lesson: 4, title: "HOMEM precisa de AUSÊNCIA e TEMPO para CORRER ATRÁS", videoId: "wPFir0N4HoU", description: "O timing perfeito para aplicar a ausência estratégica." },

  // Módulo 2
  { module: 2, lesson: 1, title: "OS 5 PRINCÍPIOS DA MENTE MASCULINA!", videoId: "Kvmh9RUIfFc", description: "Domine os 5 pilares da psicologia masculina." },
  { module: 2, lesson: 2, title: "COMO CONTROLAR A MENTE DE UM HOMEM?", videoId: "-pfXXwkNWTk", description: "Aprenda os mecanismos psicológicos que regem decisões masculinas." },
  { module: 2, lesson: 3, title: "O que o SILÊNCIO faz na CABEÇA de um HOMEM?", videoId: "v_d7mmtVh0c", description: "O poder do silêncio estratégico na reconquista." },
  { module: 2, lesson: 4, title: "CABEÇA DO HOMEM no PÓS TÉRMINO", videoId: "knKjXRx0iag", description: "Como ele pensa e sente após o término." },

  // Módulo 3
  { module: 3, lesson: 1, title: "Como deixar um HOMEM COM MEDO DE PERDER!", videoId: "Itat8QDkhhQ", description: "Ative o gatilho do medo da perda." },
  { module: 3, lesson: 2, title: "APRENDA A REJEITAR PRA ELE VIR ATRAS!", videoId: "5LMJop82nBk", description: "A arte de rejeitar estrategicamente." },
  { module: 3, lesson: 3, title: "Postura que faz HOMEM QUERER FEITO DOIDO", videoId: "8KD93jjgbBg", description: "A postura que desperta desejo irresistível." },

  // Módulo 4
  { module: 4, lesson: 1, title: "3 Frases Pra Mexer PROFUNDAMENTE com o Psicológico de um Homem!", videoId: "hjVBIwEWO7o", description: "As 3 frases secretas que ativam memória emocional." },
  { module: 4, lesson: 2, title: "A Mensagem que Reconquista ELE Sumiu Diga isso!", videoId: "tu2NxuqrbK4", description: "A mensagem exata para quando ele desaparece." },
  { module: 4, lesson: 3, title: "ELE SUMIU! Devo MANDAR um 'Oi'?", videoId: "hRYhIoNhJqs", description: "Como reagir quando ele some." },

  // Módulo 5
  { module: 5, lesson: 1, title: "O EX APARECEU FAÇA CERTO DESSA VEZ!", videoId: "-6YSO7AYrZI", description: "O que dizer e fazer quando ele te procura." },
  { module: 5, lesson: 2, title: "Como se comportar ao se ENCONTRAR com EX?", videoId: "sklhMr24Fg4", description: "Guia completo de postura e linguagem corporal." },
  { module: 5, lesson: 3, title: "Ele enviou 'SAUDADES'!!! O QUE RESPONDER?", videoId: "h5gUHiS-q7k", description: "A resposta perfeita para reconquistar." },

  // Módulo 6
  { module: 6, lesson: 1, title: "WHATSAPP SEJA DIRETA AO FALAR COM HOMEM!", videoId: "jkBEYleb4ZM", description: "Domine a comunicação por mensagem." },
  { module: 6, lesson: 2, title: "WhatsApp; Mensagem MEDÍOCRE NÃO se RESPONDE!!", videoId: "MYPGCmLJFKw", description: "Como identificar e lidar com mensagens rasas." },
  { module: 6, lesson: 3, title: "VOCÊ sabe se COMUNICAR com um HOMEM?", videoId: "eSgYJD9OVSU", description: "A arte da comunicação eficaz." },

  // Módulo 7
  { module: 7, lesson: 1, title: "POR QUE NENHUM RELACIONAMENTO MEU VAI PRA FRENTE", videoId: "kSf3mrsW5XA", description: "Identifique padrões sabotadores." },
  { module: 7, lesson: 2, title: "Como VIRAR O JOGO no seu RELACIONAMENTO?", videoId: "4p3u7AaOsDg", description: "Estratégias para transformar sua relação." },
  { module: 7, lesson: 3, title: "Como prender um homem? TÉCNICA INFALÍVEL!", videoId: "NXDmCor9bUY", description: "A técnica definitiva para mantê-lo apaixonado." },
  { module: 7, lesson: 4, title: "COMO MANTER O HOMEM INTERESSADO?", videoId: "zbwv5QuANd8", description: "Mantenha a chama acesa para sempre." },
];

export const getLessonData = (moduleNumber: number, lessonNumber: number): LessonData | undefined => {
  return lessonsData.find(l => l.module === moduleNumber && l.lesson === lessonNumber);
};

export const getModuleLessons = (moduleNumber: number): LessonData[] => {
  return lessonsData.filter(l => l.module === moduleNumber);
};
