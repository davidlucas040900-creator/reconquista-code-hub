-- =====================================================
-- INSERIR MÓDULOS E AULAS: O SANTUÁRIO
-- =====================================================

DO $$
DECLARE
  santuario_course_id UUID;
  mod1_id UUID;
  mod2_id UUID;
  mod3_id UUID;
  mod4_id UUID;
  mod5_id UUID;
  mod6_id UUID;
BEGIN
  -- Pegar ID do curso "O Santuário" (ou criar se não existir)
  SELECT id INTO santuario_course_id FROM public.courses WHERE slug = 'santuario';

  IF santuario_course_id IS NULL THEN
    INSERT INTO public.courses (name, slug, description, thumbnail, price, order_index)
    VALUES (
      'O Santuário  Exclusivo Para os 1%',
      'santuario',
      'Curso exclusivo com técnicas avançadas de leitura comportamental, domínio digital e scripts de poder para relacionamentos de alto nível.',
      'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800',
      997.00,
      3
    ) RETURNING id INTO santuario_course_id;
  END IF;

  -- =====================================================
  -- MÓDULO 1: O Poder da Onisciência (5 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    santuario_course_id,
    'O Poder da Onisciência',
    'poder-onisciencia',
    'Ele pode mentir para si mesmo. Para ti, nunca mais. Domina a arte de ler microexpressões e detectar mentiras.',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600',
    1
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod1_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod1_id, 'A Ciência das Microexpressões', 'Domina a arte de ler as 7 emoções universais no rosto dele em frações de segundo. Esta é a base da tua nova capacidade de ver a verdade.', 'PQ_xOjrT7ls', 12, 1),
  (mod1_id, 'O Interrogatório Silencioso', 'Aprende as técnicas de observação que os especialistas usam para saber se alguém está a esconder algo, mesmo antes de abrirem a boca.', 'gaZ_uoU73u4', 15, 2),
  (mod1_id, 'Descodificando a Voz Masculina', 'A voz dele é um detector de mentiras. Aprende a analisar o tom, a velocidade e as pausas para saber a intenção real por trás de cada palavra.', 'f2uqzkVxVa0', 13, 3),
  (mod1_id, 'As Confissões de um Especialista', 'Um mestre da linguagem corporal revela os sinais de mentira mais comuns em relacionamentos. Conhecimento de bastidores para o teu arsenal.', 'Jigz4Te-x3k', 10, 4),
  (mod1_id, 'O Subtexto das Palavras Dele', 'Homens raramente dizem o que sentem. Esta aula ensina-te a "traduzir" as frases mais comuns deles para o que elas realmente significam.', 'b4-eY7d9zrc', 10, 5);

  -- =====================================================
  -- MÓDULO 2: O Campo de Batalha Digital (4 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    santuario_course_id,
    'O Campo de Batalha Digital',
    'campo-batalha-digital',
    'O teu perfil não é um diário. É uma arma. Aprende a usar as redes sociais como ferramenta estratégica.',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600',
    2
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod2_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod2_id, 'A Arquitetura do Perfil Magnético', 'Que tipo de foto postar para gerar uma resposta emocional imediata? Aprende a criar a "isca" visual perfeita.', 'mhsJfLCPR-Y', 14, 1),
  (mod2_id, 'O Jogo do Mistério Online', 'O passo a passo para curar o teu perfil de uma forma que o deixa a questionar-se, a desejar saber mais e a sentir que te está a perder.', 'IORp0GB71EM', 12, 2),
  (mod2_id, 'A Estratégia do Ciúme Calculado', 'Como e quando postar para ativar o ciúme dele de forma subtil e elegante, sem parecer desesperada ou óbvia.', 'E2FKbGI4F1k', 13, 3),
  (mod2_id, 'Stalkeando o Stalker', 'Ele está a ver tudo o que postas, mesmo que não interaja. Entende a psicologia por trás do "like" e do "view" e como usar isso a teu favor.', 'e-RyIKu14vo', 11, 4);

  -- =====================================================
  -- MÓDULO 3: Acesso ao Cérebro Dele (4 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    santuario_course_id,
    'Acesso ao Cérebro Dele',
    'acesso-cerebro',
    'Palavras não descrevem a realidade. Elas a criam. Scripts poderosos para dominar qualquer conversa.',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',
    3
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod3_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod3_id, 'O Script do "Estou Confuso"', 'A resposta exata e desarmante para quando ele usa a desculpa "estou confuso", que o força a tomar uma decisão e a ver-te como uma mulher de alto valor.', '7af5gtYD8ew', 12, 1),
  (mod3_id, 'O Script do "Oi, Sumida"', 'Como responder à mensagem mais temida de todas. A resposta que o tira do pedestal e o coloca a lutar pela tua atenção novamente.', '3BABnpl6zGM', 10, 2),
  (mod3_id, 'A Arte do "Frame Control"', 'Aprende a nunca entrar na "conversa" dele, mas sim a puxá-lo sempre para a tua. A técnica para dominar qualquer discussão sem levantar a voz.', 'weIki9ME1bg', 14, 3),
  (mod3_id, 'O Golpe de Misericórdia no Orgulho', 'A sequência de palavras que fere o ego de um homem orgulhoso e o faz perceber que precisa de ti para se sentir validado.', 'YMbPQsUyh64', 12, 4);

  -- =====================================================
  -- MÓDULO 4: A Blacklist Masculina (4 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    santuario_course_id,
    'A Blacklist Masculina',
    'blacklist-masculina',
    'Alguns homens não são um projeto para consertar. São uma lição para aprender. Imunidade emocional completa.',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
    4
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod4_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod4_id, 'Anatomia do Narcisista', 'Aprende a reconhecer os sinais subtis e os comportamentos de um narcisista para nunca mais caíres na armadilha dele.', 'BoT49pnE058', 15, 1),
  (mod4_id, 'O "Menino que Não Cresce" (Síndrome de Peter Pan)', 'Como identificar o homem que tem medo de compromisso e responsabilidade, e porque ele nunca vai mudar por ti.', 'mKDa01fg90A', 13, 2),
  (mod4_id, 'O Manipulador Vitimista', 'Ele faz-te sentir culpada por tudo? Aprende a identificar e a neutralizar a tática do homem que se faz de vítima para te controlar.', '_wBIWLFqZjc', 12, 3),
  (mod4_id, 'O Mapa do Homem Tóxico', 'Os 5 sinais de alerta que indicam que estás num relacionamento tóxico e que precisas de sair imediatamente.', '0GlWHTsgEb4', 12, 4);

  -- =====================================================
  -- MÓDULO 5: O Protocolo de Emergência (3 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    santuario_course_id,
    'O Protocolo de Emergência',
    'protocolo-emergencia',
    'Fizeste asneira? Calma. Até as Deusas erram. A diferença é que elas sabem como consertar.',
    'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600',
    5
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod5_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod5_id, 'O Botão de "Desfazer"', 'Enviaste a mensagem errada? Ligaste a mais? Aprende a técnica para neutralizar uma "burrada" e recuperar a tua postura em menos de 24 horas.', '3fLLPjakU7o', 12, 1),
  (mod5_id, 'O Pós-Surto Emocional', 'Perdeste a cabeça e "soltaste os cachorros" nele? Assiste a este protocolo passo a passo para reverter a situação e usar o teu "surto" a teu favor.', 'I-3gCQdDI0s', 11, 2),
  (mod5_id, 'Recuperando a Dignidade Perdida', 'Se sentes que te humilhaste ou que jogaste a tua dignidade fora, esta aula é o teu plano de primeiros socorros para recuperar o teu valor e o respeito dele.', 'aF-NEbT08BM', 12, 3);

  -- =====================================================
  -- MÓDULO 6: O Diário da Deusa - BÓNUS (4 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    santuario_course_id,
    'O Diário da Deusa (BÓNUS)',
    'diario-deusa',
    'Ele vai voltar. Mas primeiro, tu voltas para ti mesma. Mindset, meditações e afirmações de poder.',
    'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=600',
    6
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod6_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, is_bonus, order_index) VALUES
  (mod6_id, 'Para Quando a Dor de Amor Ataca', 'Uma meditação guiada e palavras de força para ouvires nos momentos de maior sofrimento.', 'HZgJgmp3fcw', 10, true, 1),
  (mod6_id, 'A Arte de "Soltar"', 'Aprende a soltar a ansiedade e o controlo. Este áudio ensina-te a mentalidade que, paradoxalmente, o faz voltar mais rápido.', 'GpmXRB3o-fM', 10, true, 2),
  (mod6_id, 'Afirmações de Poder "Eu Sou"', 'Um áudio de 5 minutos com afirmações poderosas para reprogramar a tua mente e a tua energia, para ouvires todas as manhãs.', '8uDYf9Z5vWk', 5, true, 3),
  (mod6_id, 'Meditação Guiada para o Amor Próprio', 'Uma meditação profunda para reconectar contigo mesma e curar a tua autoestima. Essencial para a tua jornada.', 'LUHspFWn0q4', 15, true, 4);

END $$;

-- Verificar inserção
SELECT 
  'O SANTUÁRIO INSERIDO:' as info,
  COUNT(DISTINCT cm.id) as total_modulos,
  COUNT(cl.id) as total_aulas
FROM public.courses c
LEFT JOIN public.course_modules cm ON cm.course_id = c.id
LEFT JOIN public.course_lessons cl ON cl.module_id = cm.id
WHERE c.slug = 'santuario';
