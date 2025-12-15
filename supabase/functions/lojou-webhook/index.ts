import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lojou-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const DEFAULT_PASSWORD = 'Reconquista@2026'
const WEBHOOK_SECRET = Deno.env.get('LOJOU_WEBHOOK_SECRET') || ''

// Função para validar assinatura da Lojou
function validateSignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET || !signature) return false
  
  const hmac = createHmac('sha256', WEBHOOK_SECRET)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  
  return signature === expectedSignature
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. LER PAYLOAD
    const rawPayload = await req.text()
    const payload = JSON.parse(rawPayload)
    
    console.log('=== WEBHOOK LOJOU RECEBIDO ===', JSON.stringify(payload, null, 2))

    // 2. VALIDAR ASSINATURA (SEGURANÇA)
    const signature = req.headers.get('x-lojou-signature') || req.headers.get('x-signature') || ''
    
    if (WEBHOOK_SECRET) {
      const isValid = validateSignature(rawPayload, signature)
      
      if (!isValid) {
        console.error(' ASSINATURA INVÁLIDA!')
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      console.log('✅ Assinatura validada com sucesso')
    } else {
      console.warn('⚠️  WEBHOOK_SECRET não configurado - validação desabilitada')
    }

    // 3. EXTRAIR DADOS
    const transactionId = payload.id || payload.ID || payload.transaction_id || `TXN-${Date.now()}`
    const customerName = payload.nome_cliente || payload.nome || payload.name || 'Cliente'
    const productName = payload.produto || payload.product || ''
    const price = parseFloat(payload.preco || payload.price || payload.valor || 0)
    const fee = parseFloat(payload.taxa || payload.fee || 0)
    const status = (payload.status || 'aprovado').toLowerCase()
    const whatsapp = payload.whatsapp || payload.phone || payload.telefone || ''
    let email = (payload.email || payload.Email || '').toLowerCase().trim()

    // Validações
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Apenas processar status aprovado
    const approvedStatuses = ['aprovado', 'approved', 'paid', 'pago', 'completed', 'complete', 'success']
    if (!approvedStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ message: 'Status ignorado (não aprovado)', status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. VERIFICAR SE TRANSAÇÃO JÁ EXISTE
    const { data: existingPurchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('lojou_transaction_id', transactionId)
      .single()

    if (existingPurchase) {
      console.log('  Transação duplicada, ignorando')
      return new Response(
        JSON.stringify({ message: 'Transação já processada', transactionId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5. VERIFICAR SE USUÁRIO JÁ EXISTE
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const user = existingUser.users.find(u => u.email === email)

    let userId = user?.id

    // 6. CRIAR USUÁRIO SE NÃO EXISTE
    if (!userId) {
      console.log(' Criando novo usuário:', email)
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: customerName,
          whatsapp: whatsapp,
          created_via: 'lojou_webhook',
          transaction_id: transactionId
        }
      })

      if (createError) {
        console.error(' Erro ao criar usuário:', createError)
        throw createError
      }

      userId = newUser.user.id
      console.log(' Usuário criado:', userId)

      // Criar profile
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email,
        full_name: customerName,
        whatsapp,
        has_full_access: true,
        role: 'user',
        purchase_date: new Date().toISOString()
      })
      
      console.log(' Profile criado')
    } else {
      console.log('ℹ  Usuário já existe:', userId)
      
      // Atualizar profile para dar acesso
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        has_full_access: true,
        purchase_date: new Date().toISOString()
      })
    }

    // 7. REGISTRAR COMPRA
    await supabaseAdmin.from('purchases').insert({
      user_id: userId,
      profile_id: userId,
      lojou_transaction_id: transactionId,
      customer_name: customerName,
      customer_email: email,
      customer_whatsapp: whatsapp,
      product_name: productName,
      amount: price,
      fee: fee,
      status: 'active',
      raw_payload: payload
    })
    
    console.log(' Compra registrada')

    // 8. GERAR MAGIC LINK
    const { data: magicLinkData, error: magicError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: `${Deno.env.get('PUBLIC_SITE_URL') || 'https://reconquista.vercel.app'}/dashboard`
      }
    })

    if (magicError) {
      console.error('  Erro ao gerar magic link:', magicError)
    }

    const magicLink = magicLinkData?.properties?.action_link || ''
    console.log(' Magic link gerado')

    // 9. SALVAR MAGIC LINK NO BANCO
    if (magicLink) {
      const token = magicLink.split('token=')[1]?.split('&')[0] || ''
      
      if (token) {
        await supabaseAdmin.from('magic_links').insert({
          user_id: userId,
          token: token,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        
        console.log(' Magic link salvo no banco')
      }
    }

    // 10. ENVIAR EMAIL COM MAGIC LINK
    try {
      await supabaseAdmin.functions.invoke('send-welcome-email', {
        body: {
          email,
          name: customerName,
          magicLink,
          productName
        }
      })
      
      console.log(' Email de boas-vindas enviado')
    } catch (emailError) {
      console.error('  Erro ao enviar email:', emailError)
      // Não falhar o webhook por causa de email
    }

    // 11. INICIALIZAR MÓDULOS DO USUÁRIO
    try {
      await supabaseAdmin.functions.invoke('initialize-user-modules', {
        body: { userId }
      })
      
      console.log(' Módulos inicializados')
    } catch (moduleError) {
      console.error('  Erro ao inicializar módulos:', moduleError)
    }

    // 12. RESPOSTA DE SUCESSO
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processado com sucesso',
        userId,
        transactionId,
        magicLink: magicLink ? 'enviado' : 'não gerado'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error(' ERRO NO WEBHOOK:', error)
    
    return new Response(
      JSON.stringify({
        error: 'Erro ao processar webhook',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
