import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const PRODUCT_MAP: Record<string, string> = {
  'codigo_reconquista': 'O Codigo da Reconquista - Programa Completo',
  'deusa_vip': 'A Deusa na Cama - Acesso VIP',
  'deusa_essencial': 'A Deusa na Cama - Essencial',
  'exclusivo_1': 'Acesso Exclusivo para os 1%',
  'santuario': 'O Santuario'
}

// Mapeamento de produto para curso (slug)
const PRODUCT_TO_COURSE: Record<string, string> = {
  'codigo_reconquista': 'codigo-reconquista',
  'deusa_vip': 'deusa-na-cama',
  'deusa_essencial': 'deusa-na-cama',
  'exclusivo_1': 'codigo-reconquista',
  'santuario': 'codigo-reconquista'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log('[Lojou] ========== WEBHOOK RECEBIDO ==========')
    console.log('[Lojou] Payload:', JSON.stringify(payload, null, 2))

    // 1. EXTRAIR DADOS DO PAYLOAD
    const rawEmail = payload.email || payload.customer?.email || payload.buyer?.email || ''
    const email = rawEmail.toLowerCase().trim()
    const name = payload.name || payload.customer?.name || payload.buyer?.name || 'Cliente'
    const whatsapp = payload.whatsapp || payload.customer?.phone || payload.buyer?.phone || ''
    const lojouProductId = payload.product?.id || payload.product_id || 'unknown'
    const originalProductName = payload.product?.name || payload.product_name || 'Produto'
    const amount = payload.amount || payload.valor || 0
    const fee = payload.fee || payload.taxa || 0
    const status = payload.status || payload.event || 'unknown'
    const transactionId = payload.id || payload.transaction_id || crypto.randomUUID()

    console.log('[Lojou] Email extraido:', email)
    console.log('[Lojou] Nome:', name)
    console.log('[Lojou] Produto ID:', lojouProductId)
    console.log('[Lojou] Status:', status)

    // 2. VALIDAR EMAIL
    if (!email) {
      console.error('[Lojou] ERRO: Email nao encontrado no payload')
      return new Response(
        JSON.stringify({ success: false, error: 'Email nao encontrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('[Lojou] ERRO: Email com formato invalido:', email)
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de email invalido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. VALIDAR STATUS DO PAGAMENTO
    const approvedStatuses = ['approved', 'paid', 'completed', 'confirmed', 'payment.approved', 'success']
    const statusLower = String(status).toLowerCase()
    const isApproved = approvedStatuses.some(s => statusLower.includes(s.replace('payment.', '')))

    if (!isApproved) {
      console.log('[Lojou] Status nao aprovado, ignorando:', status)
      return new Response(
        JSON.stringify({ received: true, reason: 'Status not approved', status: status }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const standardizedName = PRODUCT_MAP[lojouProductId] || originalProductName
    console.log('[Lojou] Produto padronizado:', standardizedName)

    // =====================================================
    // 4. BUSCAR OU CRIAR USUARIO - CORRIGIDO!
    // IMPORTANTE: Buscar PRIMEIRO no Auth, depois sincronizar Profile
    // =====================================================
    let userId: string | null = null
    let userEmail: string = email

    // PASSO 4.1: Buscar usuário no Auth pelo email
    console.log('[Lojou] [PASSO 4.1] Buscando usuario no Auth...')
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })

    if (listError) {
      console.error('[Lojou] Erro ao listar usuarios:', listError.message)
    } else if (authUsers?.users) {
      const existingAuthUser = authUsers.users.find(u => u.email?.toLowerCase() === email)
      if (existingAuthUser) {
        userId = existingAuthUser.id
        userEmail = existingAuthUser.email || email
        console.log('[Lojou] Usuario ENCONTRADO no Auth:', userId)
      }
    }

    // PASSO 4.2: Se não existe no Auth, CRIAR
    if (!userId) {
      console.log('[Lojou] [PASSO 4.2] Usuario nao existe no Auth, criando...')
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: { 
          full_name: name, 
          whatsapp: whatsapp, 
          source: 'lojou_payment',
          created_via: 'webhook'
        }
      })

      if (createError) {
        console.error('[Lojou] Erro ao criar usuario:', createError.message)
        
        // Se erro é "já existe", tentar buscar novamente
        if (createError.message.includes('already') || createError.message.includes('exists')) {
          console.log('[Lojou] Usuario ja existe, buscando novamente...')
          const { data: retryUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
          const retryUser = retryUsers?.users?.find(u => u.email?.toLowerCase() === email)
          if (retryUser) {
            userId = retryUser.id
            console.log('[Lojou] Usuario encontrado no retry:', userId)
          }
        }

        if (!userId) {
          throw new Error('Falha ao criar usuario: ' + createError.message)
        }
      } else if (newUser?.user) {
        userId = newUser.user.id
        console.log('[Lojou] Novo usuario criado com sucesso:', userId)
      }
    }

    if (!userId) {
      throw new Error('Impossivel obter ID do usuario apos todas as tentativas')
    }

    // PASSO 4.3: Garantir que o Profile existe e está sincronizado
    console.log('[Lojou] [PASSO 4.3] Sincronizando profile...')
    
    // Verificar se profile existe
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle()

    if (existingProfile) {
      // Profile existe, atualizar
      console.log('[Lojou] Profile existente, atualizando...')
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          email: email,
          full_name: name,
          whatsapp: whatsapp,
          has_full_access: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('[Lojou] Erro ao atualizar profile:', updateError.message)
      } else {
        console.log('[Lojou] Profile atualizado com sucesso')
      }
    } else {
      // Profile não existe, criar
      console.log('[Lojou] Profile nao existe, criando...')
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: name,
          whatsapp: whatsapp,
          has_full_access: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertError) {
        // Se erro de duplicação, tentar update
        if (insertError.code === '23505') {
          console.log('[Lojou] Profile ja existe (conflito), tentando update...')
          await supabaseAdmin
            .from('profiles')
            .update({
              email: email,
              full_name: name,
              whatsapp: whatsapp,
              has_full_access: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId)
        } else {
          console.error('[Lojou] Erro ao criar profile:', insertError.message)
        }
      } else {
        console.log('[Lojou] Profile criado com sucesso')
      }
    }

    // =====================================================
    // 5. REGISTRAR COMPRA
    // =====================================================
    console.log('[Lojou] [PASSO 5] Registrando compra...')
    
    const { data: purchaseData, error: purchaseError } = await supabaseAdmin
      .from('purchases')
      .insert({
        user_id: userId,
        product_name: originalProductName,
        lojou_product_name: standardizedName,
        lojou_transaction_id: String(transactionId),
        amount: Number(amount),
        fee: Number(fee),
        status: 'active',
        customer_email: email,
        customer_name: name,
        customer_whatsapp: whatsapp,
        raw_payload: payload,
        created_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (purchaseError) {
      console.error('[Lojou] Erro ao registrar compra:', purchaseError.message)
      // Não bloquear o fluxo, apenas logar
    } else {
      console.log('[Lojou] Compra registrada, ID:', purchaseData?.id)
    }

    // =====================================================
    // 6. CONCEDER ACESSO AO CURSO
    // =====================================================
    console.log('[Lojou] [PASSO 6] Concedendo acesso ao curso...')
    
    const courseSlug = PRODUCT_TO_COURSE[lojouProductId] || 'codigo-reconquista'
    
    // Buscar o curso pelo slug
    const { data: courseData } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('slug', courseSlug)
      .single()

    if (courseData?.id) {
      const { error: accessError } = await supabaseAdmin
        .from('user_courses')
        .upsert({
          user_id: userId,
          course_id: courseData.id,
          purchase_id: purchaseData?.id,
          granted_at: new Date().toISOString(),
          is_active: true
        }, { onConflict: 'user_id,course_id' })

      if (accessError) {
        console.error('[Lojou] Erro ao conceder acesso ao curso:', accessError.message)
      } else {
        console.log('[Lojou] Acesso ao curso concedido:', courseSlug)
      }
    } else {
      console.log('[Lojou] Curso nao encontrado:', courseSlug)
    }

    // =====================================================
    // 7. CRIAR MAGIC LINK
    // =====================================================
    console.log('[Lojou] [PASSO 7] Criando magic link...')
    
    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    const { data: magicLinkData, error: magicLinkError } = await supabaseAdmin
      .from('magic_links')
      .insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt.toISOString(),
        product_id: lojouProductId,
        product_name: standardizedName
      })
      .select('id')
      .single()

    if (magicLinkError) {
      console.error('[Lojou] ERRO ao criar magic_link:', magicLinkError.message)
      throw new Error('Falha ao criar magic link: ' + magicLinkError.message)
    }

    console.log('[Lojou] Magic link criado, ID:', magicLinkData?.id)

    // =====================================================
    // 8. ENVIAR EMAIL
    // =====================================================
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://areademembrocodigodareconquista-nine.vercel.app'
    const magicLink = `${SITE_URL}/auto-login?token=${token}`
    const firstName = name.split(' ')[0]

    console.log('[Lojou] [PASSO 8] Enviando email...')
    console.log('[Lojou] Magic Link:', magicLink)

    if (RESEND_API_KEY) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); color: #ffffff; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">Parabéns, ${firstName}! 🎉</h1>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0;">
            Seu acesso ao <strong style="color: #D4AF37;">${standardizedName}</strong> foi liberado com sucesso!
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0;">
            Clique no botão abaixo para acessar sua área de membros:
          </p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${magicLink}" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%); color: #000000; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);">
              ACESSAR MINHA ÁREA DE MEMBROS
            </a>
          </div>
          <p style="font-size: 14px; color: #888; text-align: center;">
            Este link é válido por 7 dias.
          </p>
          <hr style="border: none; border-top: 1px solid #333; margin: 30px 0;">
          <p style="font-size: 12px; color: #666; text-align: center;">
            Se você não solicitou este acesso, ignore este email.
          </p>
        </div>
      `

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Codigo da Reconquista <acesso@codigodareconquista.xyz>',
          to: email,
          subject: `${firstName}, seu acesso foi liberado! 🎉`,
          html: htmlContent
        })
      })

      if (emailResponse.ok) {
        console.log('[Lojou] Email enviado com sucesso!')
      } else {
        const emailError = await emailResponse.text()
        console.error('[Lojou] Erro ao enviar email:', emailError)
      }
    } else {
      console.warn('[Lojou] RESEND_API_KEY nao configurada')
    }

    // =====================================================
    // 9. LOG DE SUCESSO
    // =====================================================
    console.log('[Lojou] ========== WEBHOOK PROCESSADO COM SUCESSO ==========')
    console.log('[Lojou] User ID:', userId)
    console.log('[Lojou] Email:', email)
    console.log('[Lojou] Produto:', standardizedName)

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email: email,
        product: standardizedName,
        magic_link_created: true,
        course_access_granted: true
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Lojou] ========== ERRO FATAL ==========')
    console.error('[Lojou] Mensagem:', error.message)
    console.error('[Lojou] Stack:', error.stack)

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})