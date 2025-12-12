-- =====================================================
-- INSERIR MÓDULOS E AULAS: A DEUSA NA CAMA
-- =====================================================

DO $$
DECLARE
  deusa_course_id UUID;
  mod1_id UUID;
  mod2_id UUID;
  mod3_id UUID;
  mod4_id UUID;
  mod5_id UUID;
  mod6_id UUID;
  mod7_id UUID;
BEGIN
  -- Pegar ID do curso "A Deusa na Cama"
  SELECT id INTO deusa_course_id FROM public.courses WHERE slug = 'deusa-na-cama';

  -- Se não existir, criar
  IF deusa_course_id IS NULL THEN
    INSERT INTO public.courses (name, slug, description, thumbnail, price, order_index)
    VALUES (
      'A Deusa na Cama',
      'deusa-na-cama',
      'Módulo premium de sedução avançada com técnicas secretas que transformam momentos íntimos em experiências inesquecíveis.',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      597.00,
      2
    ) RETURNING id INTO deusa_course_id;
  END IF;

  -- =====================================================
  -- MÓDULO 1: O Despertar da Deusa (5 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    deusa_course_id,
    'O Despertar da Deusa',
    'despertar-deusa',
    'Liberte-se da insegurança e abrace seu poder feminino',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
    1
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod1_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod1_id, 'Como perder a insegurança antes e durante o sexo', 'Descubra técnicas para eliminar bloqueios e se conectar com sua confiança natural.', 'BW7wLQECPkc', 15, 1),
  (mod1_id, 'A técnica da soltura: destravando o corpo e a mente na cama', 'Aprenda a liberar tensões e se entregar completamente ao momento íntimo.', 'YozK0FZu0dU', 18, 2),
  (mod1_id, 'Como eliminar a vergonha e assumir sua energia feminina', 'Transforme inseguranças em poder e assuma o controle da sua sexualidade.', 'f1mX86Ficio', 20, 3),
  (mod1_id, 'Como se soltar e inovar sem medo na hora do sexo', 'Explore sua criatividade e ouse experimentar novas formas de prazer.', 'BMS4D7thPrg', 16, 4),
  (mod1_id, 'Como perder a vergonha e inovar na hora do sexo', 'Quebre barreiras mentais e descubra o que realmente te excita.', 'JocIiA2pX_4', 17, 5);

  -- =====================================================
  -- MÓDULO 2: O Toque Viciante (4 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    deusa_course_id,
    'O Toque Viciante',
    'toque-viciante',
    'Domine as zonas que deixam qualquer homem viciado',
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=600',
    2
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod2_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod2_id, 'Zonas que deixam qualquer homem viciado no seu corpo', 'Mapeie os pontos de prazer masculino e use-os estrategicamente.', 'b6xb4VXuv0E', 22, 1),
  (mod2_id, '10 zonas erógenas que deixam os homens com muito tesão', 'Descubra os segredos da anatomia masculina que poucos conhecem.', 'hfKNqCIw9Ms', 19, 2),
  (mod2_id, 'Massagem sensual rápida (5 minutos)', 'Técnica express para preparar o clima em poucos minutos.', 'K_UylBFh--E', 12, 3),
  (mod2_id, 'Strip Tease fácil para iniciantes (passo a passo)', 'Aprenda a criar tensão e desejo através da arte da sedução visual.', 'iLmOtcPCgeM', 14, 4);

  -- =====================================================
  -- MÓDULO 3: O Segredo Oral (6 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    deusa_course_id,
    'O Segredo Oral',
    'segredo-oral',
    'Técnicas que enlouquecem e viciam para sempre',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600',
    3
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod3_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod3_id, 'O mindset das mulheres que enlouquecem no oral', 'A mentalidade correta que transforma uma experiência comum em extraordinária.', '8KWHAmtfuEM', 16, 1),
  (mod3_id, 'Como fazer o oral perfeito', 'Técnica completa, do básico ao avançado, para máximo prazer.', '4NC1OBMw7ao', 21, 2),
  (mod3_id, 'Como dar aquela chupada que deixa ele louco', 'Movimentos e ritmos que intensificam o prazer masculino.', 'GXKAbadNJVw', 18, 3),
  (mod3_id, 'Como chupar direito (avançado)', 'Técnicas avançadas para quem quer dominar completamente a arte.', 'F4ZZr2oVtF0', 23, 4),
  (mod3_id, 'Técnica da Lambida do Trono', 'Movimento secreto que causa sensações intensas e inesquecíveis.', '7oWiE78ns6k', 15, 5),
  (mod3_id, 'A técnica da laranja  prazer absoluto', 'Método revolucionário inspirado em práticas orientais milenares.', 'Q-DuzZq6vlY', 17, 6);

  -- =====================================================
  -- MÓDULO 4: A Cavalgada da Deusa (13 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    deusa_course_id,
    'A Cavalgada da Deusa',
    'cavalgada-deusa',
    'Domine a arte da sentada perfeita e deixe-o viciado',
    'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600',
    4
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod4_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod4_id, 'A Sentada da Deusa (técnica principal)', 'A técnica definitiva que transforma você em inesquecível.', 'KE6L8iJQkcA', 24, 1),
  (mod4_id, 'Como cavalgá-lo sem cansar', 'Posicionamento e respiração para resistência e prazer contínuo.', 'rYgr2sla7Zw', 19, 2),
  (mod4_id, 'Técnica de sentada que deixa ele em choque', 'Movimento surpreendente que ele nunca experimentou antes.', '5UB_j2B68Ec', 21, 3),
  (mod4_id, 'A Sentada Borboleta Paraguaya', 'Variação exótica que estimula pontos específicos de prazer.', 'MeF1fGBYSJA', 18, 4),
  (mod4_id, 'Posições para máximo estímulo do clitóris', 'Ângulos e movimentos para seu próprio prazer intenso.', '-hN9Q7EOiHA', 20, 5),
  (mod4_id, 'Sentada da Donzela (movimentos avançados)', 'Técnica refinada para quem quer maestria absoluta.', 'l3MSf81Kj_M', 22, 6),
  (mod4_id, 'Melhores posições para chegar lá junto com ele', 'Sincronização perfeita para orgasmos simultâneos.', '2n_TKNQESHw', 17, 7),
  (mod4_id, '3 movimentos para mexer com ele sem dizer nada', 'Linguagem corporal que comunica desejo sem palavras.', 'rPRfTBfW9KY', 14, 8),
  (mod4_id, '3 posições que eles amam', 'As favoritas masculinas que nunca falham.', 'lyUnrpl1KvI', 16, 9),
  (mod4_id, 'Movimentos que enlouquecem o boy', 'Sequências de movimentos que maximizam o prazer dele.', 'U47Y7B1i78U', 15, 10),
  (mod4_id, 'Dicas para movimentos durante a hora H', 'Ajustes finos que fazem toda a diferença.', 'P_uqsz-Lhus', 13, 11),
  (mod4_id, 'Domine a arte de sentar na cadeira', 'Variação criativa para mudar o cenário e intensificar sensações.', '-g61n3QKFRQ', 19, 12),
  (mod4_id, 'Pompoarismo para iniciantes (resistência e controle)', 'Exercícios de fortalecimento para controle vaginal absoluto.', '9ArZJydu6RY', 25, 13);

  -- =====================================================
  -- MÓDULO 5: O Big Bang Sonoro (4 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    deusa_course_id,
    'O Big Bang Sonoro',
    'big-bang-sonoro',
    'Gema e fale de forma irresistível na hora H',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600',
    5
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod5_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod5_id, 'Como gemer bonito (mesmo tímida)', 'Supere a timidez e use sua voz como ferramenta de sedução.', '9NgwS2iDPuA', 14, 1),
  (mod5_id, '4 formas de gemer e enlouquecer qualquer homem', 'Variações vocais que intensificam o desejo masculino.', 'Y8b8mZYOUrE', 16, 2),
  (mod5_id, 'O que falar na hora H (dirty talk para iniciantes)', 'Frases e palavras que excitam sem vulgaridade excessiva.', 'zPPC-3MtKyc', 19, 3),
  (mod5_id, 'Como perder a vergonha de falar durante o sexo', 'Desbloqueie sua comunicação íntima e potencialize a conexão.', 'P9a8-To6NyE', 17, 4);

  -- =====================================================
  -- MÓDULO 6: Segredos Profundos (5 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    deusa_course_id,
    'Segredos Profundos',
    'segredos-profundos',
    'Explore novos territórios com segurança e prazer',
    'https://images.unsplash.com/photo-1487260211189-670c54da558d?w=600',
    6
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod6_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod6_id, 'Como dar o C sem dor (guia para iniciantes)', 'Preparação completa, física e mental, para primeira experiência.', 'O8vm_IczzSk', 22, 1),
  (mod6_id, 'Sexo anal sem dor  técnica essencial', 'Método progressivo que garante conforto e prazer gradual.', 'mNLLV-A4JpI', 24, 2),
  (mod6_id, 'Como dar a roda com prazer', 'Transforme tabu em experiência prazerosa e segura.', 'f_VCUFzxkxU', 20, 3),
  (mod6_id, 'Como relaxar e começar no anal de forma segura', 'Técnicas de respiração e relaxamento muscular.', 'T1_kLJGFhuA', 18, 4),
  (mod6_id, 'Introdução ao mundo dos fetiches (seguro e elegante)', 'Explore fantasias de forma consensual, segura e prazerosa.', 'BESJUeTlkVw', 21, 5);

  -- =====================================================
  -- MÓDULO 7: Devoção Eterna (3 aulas)
  -- =====================================================
  INSERT INTO public.course_modules (course_id, name, slug, description, thumbnail, order_index)
  VALUES (
    deusa_course_id,
    'Devoção Eterna',
    'devocao-eterna',
    'Mantenha-o apaixonado e conectado para sempre',
    'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?w=600',
    7
  ) ON CONFLICT (course_id, slug) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO mod7_id;

  INSERT INTO public.course_lessons (module_id, title, description, video_url, duration_minutes, order_index) VALUES
  (mod7_id, 'Como se comportar após o sexo para aumentar a conexão', 'Os minutos após o clímax são cruciais para criar vínculo emocional.', 'QtZXVjJngnk', 16, 1),
  (mod7_id, 'Dica para deixá-lo louco após a transa', 'Pequenos gestos pós-sexo que criam memórias poderosas.', 'Vt8QD8RsHA0', 14, 2),
  (mod7_id, 'O que fazer quando ele some depois do sexo (estratégia da poderosa)', 'Resposta estratégica que reestabelece seu valor e atração.', 'irwY5ixTtHY', 19, 3);

END $$;

-- Verificar inserção
SELECT 
  'DEUSA NA CAMA INSERIDA:' as info,
  COUNT(DISTINCT cm.id) as total_modulos,
  COUNT(cl.id) as total_aulas
FROM public.courses c
LEFT JOIN public.course_modules cm ON cm.course_id = c.id
LEFT JOIN public.course_lessons cl ON cl.module_id = cm.id
WHERE c.slug = 'deusa-na-cama';
