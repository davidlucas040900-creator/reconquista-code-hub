import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ==============================================
// MAPEAMENTO DE PRODUTOS LOJOU -> NOME PADRAO
// ==============================================
const PRODUCT_MAP: Record<string, string> = {
  'codigo_reconquista': 'O Codigo da Reconquista - Programa Completo',
  'codigo-reconquista': 'O Codigo da Reconquista - Programa Completo',
  'deusa_vip': 'A Deusa na Cama - Acesso VIP',
  'deusa-vip': 'A Deusa na Cama - Acesso VIP',
  'deusa_essencial': 'A Deusa na Cama - Essencial',
  'deusa-essencial': 'A Deusa na Cama - Essencial',
  'exclusivo_1': 'Acesso Exclusivo para os 1%',
  'exclusivo-1': 'Acesso Exclusivo para os 1%',
  'exclusivo_1_essencial': 'Acesso Exclusivo para os 1% - Essencial',
  'exclusivo-1-essencial': 'Acesso Exclusivo para os 1% - Essencial',
  'santuario': 'O Santuario',
}

// ==============================================
// MAPEAMENTO DE PRODUTO -> CURSO (SLUG)
// ==============================================
const PRODUCT_TO_COURSE: Record<string, string> = {
  'codigo_reconquista': 'codigo-reconquista',
  'codigo-reconquista': 'codigo-reconquista',
  'deusa_vip': 'deusa-na-cama',
  'deusa-vip': 'deusa-na-cama',
  'deusa_essencial': 'deusa-na-cama',
  'deusa-essencial': 'deusa-na-cama',
  'exclusivo_1': 'exclusivo-1-porcento',
  'exclusivo-1': 'exclusivo-1-porcento',
  'exclusivo_1_essencial': 'exclusivo-1-porcento',
  'exclusivo-1-essencial': 'exclusivo-1-porcento',
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
    console.log('[Lojou] Produto Nome:', originalProductName)

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

    // BUSCAR OU CRIAR USUARIO
    let userId: string | null = null

    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const existingUser = authUsers?.users?.find(u => u.email?.toLowerCase() === email)
    
    if (existingUser) {
      userId = existingUser.id
      console.log('[Lojou] Usuario encontrado:', userId)
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: { full_name: name, whatsapp: whatsapp, source: 'lojou_payment' }
      })

      if (createError) {
        if (createError.message.includes('already') || createError.message.includes('exists')) {
          const { data: retryUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
          const retryUser = retryUsers?.users?.find(u => u.email?.toLowerCase() === email)
          if (retryUser) userId = retryUser.id
        }
        if (!userId) throw new Error('Falha ao criar usuario: ' + createError.message)
      } else if (newUser?.user) {
        userId = newUser.user.id
        console.log('[Lojou] Usuario criado:', userId)
      }
    }

    if (!userId) throw new Error('Impossivel obter ID do usuario')

    // SINCRONIZAR PROFILE - SEM has_full_access = true
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
    }

    // REGISTRAR COMPRA
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

    // CONCEDER ACESSO AO CURSO ESPECIFICO
    const { data: courseData } = await supabaseAdmin
      .from('courses')
      .select('id, name')
      .eq('slug', courseSlug)
      .eq('is_active', true)
      .single()

    if (courseData?.id) {
      await supabaseAdmin
        .from('user_courses')
        .upsert({
          user_id: userId,
          course_id: courseData.id,
          purchase_id: purchaseData?.id
        }, { onConflict: 'user_id,course_id' })
      
      console.log('[Lojou] Acesso concedido:', courseData.name)
    }

    // CRIAR MAGIC LINK
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

    // ENVIAR EMAIL
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
    }

    console.log('[Lojou] ========== SUCESSO ==========')

    return new Response(
      JSON.stringify({
        success: true,
        user_id: userId,
        email: email,
        product: standardizedName,
        course: courseSlug,
        magic_link_created: true,
        course_access_granted: true
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
