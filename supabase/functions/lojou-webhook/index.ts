import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-lojou-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const WEBHOOK_SECRET = Deno.env.get('LOJOU_WEBHOOK_SECRET') || ''
const SITE_URL = Deno.env.get('SITE_URL') || Deno.env.get('PUBLIC_SITE_URL') || 'https://areademembrocodigodareconquista.vercel.app'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

// Validar assinatura HMAC
function validateSignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET || !signature) return false
  const hmac = createHmac('sha256', WEBHOOK_SECRET)
  hmac.update(payload)
  const expectedSignature = hmac.digest('hex')
  return signature === expectedSignature
}

// Gerar token seguro
function generateSecureToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  let webhookLogId: string | null = null

  try {
    // ========================================
    // 1. LER E VALIDAR PAYLOAD
    // ========================================
    const rawPayload = await req.text()
    const payload = JSON.parse(rawPayload)

    console.log('=== WEBHOOK LOJOU RECEBIDO ===')
    console.log('Payload:', JSON.stringify(payload, null, 2))

    // Extrair dados do payload
    const transactionId = payload.id || payload.ID || payload.transaction_id || `TXN-${Date.now()}`
    const customerName = payload.nome_cliente || payload.nome || payload.name || 'Cliente'
    const productName = payload.produto || payload.product || payload.product_name || ''
    const price = parseFloat(payload.preco || payload.price || payload.valor || 0)
    const fee = parseFloat(payload.taxa || payload.fee || 0)
    const status = (payload.status || 'aprovado').toLowerCase()
    const whatsapp = payload.whatsapp || payload.phone || payload.telefone || ''
    const email = (payload.email || payload.Email || '').toLowerCase().trim()

    // ========================================
    // 2. REGISTRAR WEBHOOK (AUDITORIA)
    // ========================================
    const { data: webhookLog } = await supabaseAdmin
      .from('payment_webhooks')
      .insert({
        provider: 'lojou',
        event_type: status,
        payload: payload,
        user_email: email,
        transaction_id: transactionId,
        processed: false
      })
      .select('id')
      .single()

    webhookLogId = webhookLog?.id

    // ========================================
    // 3. VALIDAR ASSINATURA (SEGURANÇA)
    // ========================================
    const signature = req.headers.get('x-lojou-signature') || req.headers.get('x-signature') || ''

    if (WEBHOOK_SECRET) {
      const isValid = validateSignature(rawPayload, signature)
      if (!isValid) {
        console.error('❌ ASSINATURA INVÁLIDA!')
        await supabaseAdmin
          .from('payment_webhooks')
          .update({ error_message: 'Assinatura inválida' })
          .eq('id', webhookLogId)

        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      console.log('✅ Assinatura validada')
    } else {
      console.warn('⚠️ WEBHOOK_SECRET não configurado')
    }

    // ========================================
    // 4. VALIDAÇÕES
    // ========================================
    if (!email) {
      await supabaseAdmin
        .from('payment_webhooks')
        .update({ error_message: 'Email não fornecido' })
        .eq('id', webhookLogId)

      return new Response(
        JSON.stringify({ error: 'Email obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Apenas processar status aprovado
    const approvedStatuses = ['aprovado', 'approved', 'paid', 'pago', 'completed', 'complete', 'success']
    if (!approvedStatuses.includes(status)) {
      await supabaseAdmin
        .from('payment_webhooks')
        .update({ processed: true, processed_at: new Date().toISOString(), error_message: `Status ignorado: ${status}` })
        .eq('id', webhookLogId)

      return new Response(
        JSON.stringify({ message: 'Status ignorado', status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========================================
    // 5. VERIFICAR IDEMPOTÊNCIA (DUPLICADOS)
    // ========================================
    const { data: existingPurchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('lojou_transaction_id', transactionId)
      .single()

    if (existingPurchase) {
      console.log('⚠️ Transação duplicada, ignorando:', transactionId)
      await supabaseAdmin
        .from('payment_webhooks')
        .update({ processed: true, processed_at: new Date().toISOString(), error_message: 'Transação duplicada' })
        .eq('id', webhookLogId)

      return new Response(
        JSON.stringify({ message: 'Transação já processada', transactionId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========================================
    // 6. BUSCAR OU CRIAR UTILIZADOR (SEM SENHA!)
    // ========================================
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === email)

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      console.log('ℹ️ Utilizador existente:', userId)

      // Atualizar profile
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email: email,
        full_name: customerName || existingUser.user_metadata?.full_name,
        whatsapp: whatsapp || null,
        has_full_access: true,
        purchase_date: new Date().toISOString()
      })
    } else {
      // CRIAR UTILIZADOR SEM SENHA (apenas magic link)
      console.log('🆕 Criando novo utilizador:', email)

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          full_name: customerName,
          whatsapp: whatsapp,
          created_via: 'lojou_webhook',
          transaction_id: transactionId
        }
        // SEM PASSWORD! Utilizador só entra via Magic Link
      })

      if (createError) {
        console.error('❌ Erro ao criar utilizador:', createError)
        await supabaseAdmin
          .from('payment_webhooks')
          .update({ error_message: `Erro criar user: ${createError.message}` })
          .eq('id', webhookLogId)
        throw createError
      }

      userId = newUser.user.id
      console.log('✅ Utilizador criado:', userId)

      // Criar profile
      await supabaseAdmin.from('profiles').insert({
        id: userId,
        email: email,
        full_name: customerName,
        whatsapp: whatsapp,
        has_full_access: true,
        role: 'user',
        purchase_date: new Date().toISOString()
      })

      // Criar role
      await supabaseAdmin.from('user_roles').insert({
        user_id: userId,
        role: 'user'
      })

      console.log('✅ Profile criado')
    }

    // ========================================
    // 7. REGISTRAR COMPRA
    // ========================================
    const { error: purchaseError } = await supabaseAdmin.from('purchases').insert({
      user_id: userId,
      profile_id: userId,
      lojou_transaction_id: transactionId,
      lojou_product_name: productName,
      product_name: productName,
      customer_name: customerName,
      customer_email: email,
      customer_whatsapp: whatsapp,
      amount: price,
      fee: fee,
      status: 'active',
      raw_payload: payload
    })

    if (purchaseError) {
      console.error('❌ Erro ao registrar compra:', purchaseError)
    } else {
      console.log('✅ Compra registrada (trigger vai dar acesso ao curso)')
    }

    // ========================================
    // 8. GERAR MAGIC LINK CUSTOMIZADO
    // ========================================
    const token = generateSecureToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    await supabaseAdmin.from('magic_links').insert({
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString()
    })

    const magicLink = `${SITE_URL}/auto-login?token=${token}`
    console.log('✅ Magic link gerado')

    // ========================================
    // 9. ENVIAR EMAIL COM MAGIC LINK
    // ========================================
    const firstName = customerName.split(' ')[0] || 'Aluna'

    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Código da Reconquista <acesso@codigodareconquista.xyz>',
            to: email,
            subject: '🎉 Sua compra foi confirmada! Acesse agora',
            html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #D4AF37; margin: 0; font-size: 28px;">👑 Código da Reconquista</h1>
    </div>
    
    <div style="background: #1a1a1a; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 16px; padding: 40px;">
      
      <h2 style="color: #ffffff; margin: 0 0 20px 0;">Olá, ${firstName}! 🎉</h2>
      
      <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">
        Sua compra de <strong style="color: #D4AF37;">${productName || 'Código da Reconquista'}</strong> foi confirmada com sucesso!
      </p>
      
      <p style="color: #cccccc; font-size: 16px; line-height: 1.6;">
        Clique no botão abaixo para acessar sua área de membros:
      </p>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${magicLink}" 
           style="display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F4E06D 100%); 
                  color: #0a0a0a; padding: 18px 40px; text-decoration: none; border-radius: 12px; 
                  font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);">
          ACESSAR ÁREA DE MEMBROS →
        </a>
      </div>
      
      <div style="background: rgba(212, 175, 55, 0.1); border-radius: 8px; padding: 15px; margin-top: 30px;">
        <p style="color: #D4AF37; font-size: 14px; margin: 0;">
          ⏰ Este link expira em <strong>7 dias</strong>. Salve este email!
        </p>
      </div>
      
      <p style="color: #888888; font-size: 14px; margin-top: 25px;">
        Caso o botão não funcione, copie e cole este link no navegador:<br>
        <a href="${magicLink}" style="color: #D4AF37; word-break: break-all;">${magicLink}</a>
      </p>
      
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
      <p style="color: #666666; font-size: 12px;">
        Precisa de ajuda? Entre em contato pelo WhatsApp<br>
        © 2025 Código da Reconquista. Todos os direitos reservados.
      </p>
    </div>
    
  </div>
</body>
</html>
            `
          })
        })

        if (emailResponse.ok) {
          console.log('✅ Email enviado com sucesso')
        } else {
          const errorText = await emailResponse.text()
          console.error('❌ Erro ao enviar email:', errorText)
        }
      } catch (emailError) {
        console.error('❌ Erro ao enviar email:', emailError)
      }
    } else {
      console.warn('⚠️ RESEND_API_KEY não configurado - email não enviado')
      
      // Fallback: tentar enviar via função send-welcome-email
      try {
        await supabaseAdmin.functions.invoke('send-welcome-email', {
          body: { email, name: customerName, magicLink, productName }
        })
        console.log('✅ Email enviado via send-welcome-email')
      } catch (fallbackError) {
        console.error('❌ Fallback email também falhou:', fallbackError)
      }
    }

    // ========================================
    // 10. INICIALIZAR MÓDULOS (SE APLICÁVEL)
    // ========================================
    try {
      await supabaseAdmin.functions.invoke('initialize-user-modules', {
        body: { userId }
      })
      console.log('✅ Módulos inicializados')
    } catch (moduleError) {
      console.warn('⚠️ Erro ao inicializar módulos:', moduleError)
    }

    // ========================================
    // 11. MARCAR WEBHOOK COMO PROCESSADO
    // ========================================
    await supabaseAdmin
      .from('payment_webhooks')
      .update({ 
        processed: true, 
        processed_at: new Date().toISOString() 
      })
      .eq('id', webhookLogId)

    // ========================================
    // 12. RESPOSTA DE SUCESSO
    // ========================================
    console.log('=== WEBHOOK PROCESSADO COM SUCESSO ===')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processado com sucesso',
        userId,
        transactionId,
        email,
        magicLinkSent: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ ERRO NO WEBHOOK:', error)

    if (webhookLogId) {
      await supabaseAdmin
        .from('payment_webhooks')
        .update({ 
          processed: false,
          error_message: error.message || 'Erro desconhecido'
        })
        .eq('id', webhookLogId)
    }

    return new Response(
      JSON.stringify({
        error: 'Erro ao processar webhook',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
