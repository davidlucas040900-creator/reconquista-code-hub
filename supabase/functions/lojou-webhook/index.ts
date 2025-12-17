import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const PRODUCT_MAP: Record<string, string> = {
  'codigo_reconquista': 'O Codigo da Reconquista - Programa Completo',
  'codigo-reconquista': 'O Codigo da Reconquista - Programa Completo',
  'deusa_vip': 'A Deusa na Cama - Acesso VIP',
  'deusa-vip': 'A Deusa na Cama - Acesso VIP',
  'deusa_essencial': 'A Deusa na Cama - Essencial',
  'deusa-essencial': 'A Deusa na Cama - Essencial',
  'deusa-na-cama': 'A Deusa na Cama',
  'exclusivo_1': 'Acesso Exclusivo para os 1%',
  'exclusivo-1': 'Acesso Exclusivo para os 1%',
  'exclusivo_1_essencial': 'Acesso Exclusivo para os 1% - Essencial',
  'exclusivo-1-essencial': 'Acesso Exclusivo para os 1% - Essencial',
  'exclusivo-1-porcento': 'Acesso Exclusivo para os 1%',
  'santuario': 'O Santuario',
}

const PRODUCT_TO_COURSE: Record<string, string> = {
  'codigo_reconquista': 'codigo-reconquista',
  'codigo-reconquista': 'codigo-reconquista',
  'deusa_vip': 'deusa-na-cama',
  'deusa-vip': 'deusa-na-cama',
  'deusa_essencial': 'deusa-na-cama',
  'deusa-essencial': 'deusa-na-cama',
  'deusa-na-cama': 'deusa-na-cama',
  'exclusivo_1': 'exclusivo-1-porcento',
  'exclusivo-1': 'exclusivo-1-porcento',
  'exclusivo_1_essencial': 'exclusivo-1-porcento',
  'exclusivo-1-essencial': 'exclusivo-1-porcento',
  'exclusivo-1-porcento': 'exclusivo-1-porcento',
  'santuario': 'santuario',
}

function identifyProductByName(productName: string): { slug: string; standardName: string } {
  const name = productName.toLowerCase()
  if (name.includes('codigo') || name.includes('reconquista')) {
    return { slug: 'codigo-reconquista', standardName: 'O Codigo da Reconquista - Programa Completo' }
  }
  if (name.includes('deusa') || name.includes('cama')) {
    if (name.includes('essencial')) {
      return { slug: 'deusa-na-cama', standardName: 'A Deusa na Cama - Essencial' }
    }
    return { slug: 'deusa-na-cama', standardName: 'A Deusa na Cama - Acesso VIP' }
  }
  if (name.includes('exclusivo') || name.includes('1%')) {
    if (name.includes('essencial')) {
      return { slug: 'exclusivo-1-porcento', standardName: 'Acesso Exclusivo para os 1% - Essencial' }
    }
    return { slug: 'exclusivo-1-porcento', standardName: 'Acesso Exclusivo para os 1%' }
  }
  if (name.includes('santuario') || name.includes('santuário')) {
    return { slug: 'santuario', standardName: 'O Santuario' }
  }
  return { slug: 'codigo-reconquista', standardName: productName }
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

    console.log('[Lojou] Email:', email)
    console.log('[Lojou] Produto ID:', lojouProductId)

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email nao encontrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Formato de email invalido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const approvedStatuses = ['approved', 'paid', 'completed', 'confirmed', 'payment.approved', 'success']
    const statusLower = String(status).toLowerCase()
    const isApproved = approvedStatuses.some(s => statusLower.includes(s.replace('payment.', '')))

    if (!isApproved) {
      console.log('[Lojou] Status nao aprovado:', status)
      return new Response(
        JSON.stringify({ received: true, reason: 'Status not approved', status: status }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let courseSlug = PRODUCT_TO_COURSE[lojouProductId]
    let standardizedName = PRODUCT_MAP[lojouProductId]

    if (!courseSlug || !standardizedName) {
      const identified = identifyProductByName(originalProductName)
      courseSlug = courseSlug || identified.slug
      standardizedName = standardizedName || identified.standardName
    }

    console.log('[Lojou] Curso:', courseSlug)

    // ==============================================
    // BUSCAR USUARIO DIRETO NA TABELA auth.users
    // ==============================================
    let userId: string | null = null
    let isNewUser = false

    console.log('[Lojou] Buscando usuario na tabela auth.users...')
    
    const { data: existingUser, error: searchError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      userId = existingUser.id
      isNewUser = false
      console.log('[Lojou] Usuario EXISTENTE encontrado via profiles:', userId)
    } else {
      // Tentar buscar direto no auth.users usando RPC ou criar novo
      console.log('[Lojou] Nao encontrado em profiles, tentando criar...')
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: { full_name: name, whatsapp: whatsapp, source: 'lojou_payment' }
      })

      if (newUser?.user) {
        userId = newUser.user.id
        isNewUser = true
        console.log('[Lojou] Usuario NOVO criado:', userId)
      } else if (createError) {
        console.log('[Lojou] Erro ao criar:', createError.message)
        
        // Se erro é "já existe", buscar pelo auth.users diretamente
        if (createError.message.includes('already') || createError.message.includes('exists') || createError.message.includes('registered')) {
          console.log('[Lojou] Usuario ja existe no Auth, buscando ID...')
          
          // Buscar na tabela auth.users diretamente (requer service_role)
          const { data: authUser } = await supabaseAdmin
            .rpc('get_user_id_by_email', { user_email: email })
          
          if (authUser) {
            userId = authUser
            isNewUser = false
            console.log('[Lojou] Usuario encontrado via RPC:', userId)
          } else {
            // Ultima tentativa: buscar via SQL direto
            const { data: directUser } = await supabaseAdmin
              .from('auth_users_view')
              .select('id')
              .eq('email', email)
              .maybeSingle()
            
            if (directUser) {
              userId = directUser.id
              isNewUser = false
              console.log('[Lojou] Usuario encontrado via view:', userId)
            }
          }
        }
        
        if (!userId) {
          throw new Error('Nao foi possivel criar ou encontrar o usuario: ' + createError.message)
        }
      }
    }

    if (!userId) {
      throw new Error('Impossivel obter ID do usuario')
    }

    console.log('[Lojou] User ID final:', userId, '| Novo:', isNewUser)

    // ==============================================
    // SINCRONIZAR PROFILE
    // ==============================================
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (existingProfile) {
      await supabaseAdmin
        .from('profiles')
        .update({
          email: email,
          full_name: name,
          whatsapp: whatsapp,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      console.log('[Lojou] Profile atualizado')
    } else {
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: name,
          whatsapp: whatsapp,
          has_full_access: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      console.log('[Lojou] Profile criado')
    }

    // ==============================================
    // VERIFICAR COMPRA DUPLICADA
    // ==============================================
    const { data: existingPurchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('lojou_transaction_id', String(transactionId))
      .maybeSingle()

    let purchaseId = existingPurchase?.id

    if (!existingPurchase) {
      const { data: purchaseData } = await supabaseAdmin
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
      
      purchaseId = purchaseData?.id
      console.log('[Lojou] Compra registrada:', purchaseId)
    } else {
      console.log('[Lojou] Compra duplicada ignorada')
    }

    // ==============================================
    // CONCEDER ACESSO AO CURSO
    // ==============================================
    const { data: courseData } = await supabaseAdmin
      .from('courses')
      .select('id, name')
      .eq('slug', courseSlug)
      .eq('is_active', true)
      .single()

    let courseAccessGranted = false

    if (courseData?.id) {
      const { data: existingAccess } = await supabaseAdmin
        .from('user_courses')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', courseData.id)
        .maybeSingle()

      if (!existingAccess) {
        await supabaseAdmin
          .from('user_courses')
          .insert({
            user_id: userId,
            course_id: courseData.id,
            purchase_id: purchaseId
          })
        console.log('[Lojou] Acesso concedido:', courseData.name)
      } else {
        console.log('[Lojou] Usuario ja tinha acesso')
      }
      courseAccessGranted = true
    }

    // ==============================================
    // MAGIC LINK
    // ==============================================
    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await supabaseAdmin
      .from('magic_links')
      .insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt.toISOString(),
        product_id: lojouProductId,
        product_name: standardizedName
      })

    // ==============================================
    // ENVIAR EMAIL
    // ==============================================
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://areademembrocodigodareconquista-nine.vercel.app'
    const magicLink = `${SITE_URL}/auto-login?token=${token}`
    const firstName = name.split(' ')[0]

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Codigo da Reconquista <acesso@codigodareconquista.xyz>',
          to: email,
          subject: `${firstName}, seu acesso foi liberado!`,
          html: `
            <div style="font-family: Arial; max-width: 600px; margin: 0 auto; padding: 40px; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); color: #fff; border-radius: 10px;">
              <h1 style="color: #D4AF37; text-align: center;">Parabens, ${firstName}!</h1>
              <p style="color: #e0e0e0;">Seu acesso ao <strong style="color: #D4AF37;">${standardizedName}</strong> foi liberado!</p>
              <div style="text-align: center; margin: 35px 0;">
                <a href="${magicLink}" style="display: inline-block; padding: 18px 40px; background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%); color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  ACESSAR MINHA AREA DE MEMBROS
                </a>
              </div>
              <p style="color: #888; text-align: center; font-size: 14px;">Este link e valido por 7 dias.</p>
            </div>
          `
        })
      })
      console.log('[Lojou] Email enviado')
    }

    console.log('[Lojou] ========== SUCESSO ==========')

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email: email,
        is_new_user: isNewUser,
        product: standardizedName,
        course: courseSlug,
        magic_link_created: true,
        course_access_granted: courseAccessGranted
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Lojou] ERRO:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
