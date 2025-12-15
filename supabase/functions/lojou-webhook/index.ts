import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Mapeamento de produtos - Ajuste os IDs conforme sua Lojou Pay
const PRODUCT_MAP: Record<string, { name: string; accessKey: string }> = {
  // Codigo da Reconquista
  'codigo_reconquista': { name: 'O Codigo da Reconquista - Programa Completo', accessKey: 'codigo_reconquista' },
  'codigo-reconquista': { name: 'O Codigo da Reconquista - Programa Completo', accessKey: 'codigo_reconquista' },
  
  // Deusa na Cama
  'deusa_vip': { name: 'A Deusa na Cama - Acesso VIP', accessKey: 'deusa_cama' },
  'deusa_essencial': { name: 'A Deusa na Cama - Essencial', accessKey: 'deusa_cama' },
  'deusa-vip': { name: 'A Deusa na Cama - Acesso VIP', accessKey: 'deusa_cama' },
  'deusa-essencial': { name: 'A Deusa na Cama - Essencial', accessKey: 'deusa_cama' },
  
  // Exclusivo 1%
  'exclusivo_1': { name: 'Acesso Exclusivo para os 1%', accessKey: 'exclusivo_1percent' },
  'exclusivo_1_essencial': { name: 'Acesso Exclusivo para os 1% - Essencial', accessKey: 'exclusivo_1percent' },
  'exclusivo-1': { name: 'Acesso Exclusivo para os 1%', accessKey: 'exclusivo_1percent' },
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
    console.log('[Lojou Webhook] Payload recebido:', JSON.stringify(payload))

    // Log do webhook para auditoria
    const { data: webhookLog } = await supabaseAdmin
      .from('payment_webhooks')
      .insert({
        provider: 'lojou_pay',
        event_type: payload.event || payload.status || 'unknown',
        payload,
        processed: false
      })
      .select()
      .single()

    // Extrair dados do payload (ajustar conforme formato real da Lojou Pay)
    const email = payload.customer?.email || payload.email || payload.buyer?.email || payload.data?.customer?.email
    const name = payload.customer?.name || payload.name || payload.buyer?.name || payload.data?.customer?.name || 'Cliente'
    const productId = payload.product?.id || payload.product_id || payload.offer_id || payload.data?.product?.id || 'codigo_reconquista'
    const productName = payload.product?.name || payload.product_name || payload.data?.product?.name
    const status = payload.status || payload.event || payload.data?.status

    console.log('[Lojou] Dados extraidos:', { email, name, productId, status })

    // Verificar status aprovado
    const approvedStatuses = ['approved', 'paid', 'completed', 'confirmed', 'APPROVED', 'PAID', 'COMPLETED']
    if (!approvedStatuses.includes(status?.toUpperCase?.() || status)) {
      console.log('[Lojou] Status nao aprovado:', status)
      await supabaseAdmin.from('payment_webhooks').update({ 
        processed: false, 
        error_message: 'Status nao aprovado: ' + status 
      }).eq('id', webhookLog?.id)
      
      return new Response(
        JSON.stringify({ received: true, processed: false, reason: 'Status not approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email) {
      console.error('[Lojou] Email nao encontrado no payload')
      await supabaseAdmin.from('payment_webhooks').update({ 
        processed: false, 
        error_message: 'Email nao encontrado' 
      }).eq('id', webhookLog?.id)
      
      return new Response(
        JSON.stringify({ error: 'Email do cliente nao encontrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mapear produto
    const product = PRODUCT_MAP[productId] || PRODUCT_MAP[productId?.toLowerCase?.()] || { 
      name: productName || 'O Codigo da Reconquista', 
      accessKey: 'codigo_reconquista' 
    }

    console.log('[Lojou] Produto mapeado:', product)

    // Verificar/criar usuario (SEM SENHA - apenas magic link)
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    let userId: string
    let isNewUser = false
    
    const existingUser = users.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      userId = existingUser.id
      console.log('[Lojou] Usuario existente:', userId)
    } else {
      // Criar usuario SEM SENHA (acesso apenas via magic link)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true,
        user_metadata: { 
          full_name: name,
          source: 'lojou_pay',
          first_product: product.name
        }
      })

      if (createError || !newUser?.user) {
        console.error('[Lojou] Erro ao criar usuario:', createError)
        throw new Error('Falha ao criar usuario: ' + createError?.message)
      }

      userId = newUser.user.id
      isNewUser = true
      console.log('[Lojou] Novo usuario criado (sem senha):', userId)
    }

    // Atualizar perfil com acesso
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: email.toLowerCase(),
        full_name: name,
        has_full_access: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('[Lojou] Erro ao atualizar perfil:', profileError)
    }

    // Registrar compra
    await supabaseAdmin.from('user_purchases').insert({
      user_id: userId,
      product_id: productId,
      product_name: product.name,
      access_key: product.accessKey,
      amount: payload.amount || payload.value || payload.data?.amount || 0,
      currency: payload.currency || 'MZN',
      purchased_at: new Date().toISOString(),
      payload: payload
    }).catch(err => console.log('[Lojou] Erro ao registrar compra:', err))

    // Gerar Magic Link personalizado
    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    await supabaseAdmin.from('magic_links').insert({
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString(),
      product_id: productId,
      product_name: product.name
    })

    // Enviar email personalizado por produto
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://areademembrocodigodareconquista-nine.vercel.app'
    const magicLink = `${SITE_URL}/auto-login?token=${token}`
    const firstName = name.split(' ')[0]

    if (RESEND_API_KEY) {
      // Email personalizado por produto
      let emailSubject = ''
      let emailIntro = ''
      let emailColor = '#D4AF37'
      
      if (product.accessKey === 'codigo_reconquista') {
        emailSubject = `💕 ${firstName}, seu acesso ao Codigo da Reconquista esta pronto!`
        emailIntro = 'Voce deu o primeiro passo para transformar sua vida amorosa. O Codigo da Reconquista vai te guiar nessa jornada!'
        emailColor = '#D4AF37'
      } else if (product.accessKey === 'deusa_cama') {
        emailSubject = ` ${firstName}, seu acesso ao A Deusa na Cama esta liberado!`
        emailIntro = 'Prepare-se para despertar a deusa que existe em voce. Conteudos exclusivos te esperam!'
        emailColor = '#E91E63'
      } else if (product.accessKey === 'exclusivo_1percent') {
        emailSubject = ` ${firstName}, bem-vinda ao Acesso Exclusivo para os 1%!`
        emailIntro = 'Voce agora faz parte de um grupo seleto. Conteudos premium e exclusivos te aguardam!'
        emailColor = '#9C27B0'
      } else {
        emailSubject = ` ${firstName}, seu acesso esta pronto!`
        emailIntro = 'Sua compra foi confirmada e seu acesso ja esta liberado!'
      }

      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Codigo da Reconquista <acesso@codigodareconquista.xyz>',
          to: email,
          subject: emailSubject,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
              <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
                
                <!-- Header -->
                <div style="text-align:center;margin-bottom:30px;">
                  <div style="display:inline-block;background:linear-gradient(135deg,${emailColor},${emailColor}dd);padding:12px 24px;border-radius:10px;">
                    <span style="font-size:20px;font-weight:bold;color:#fff;"> Reconquista</span>
                  </div>
                </div>
                
                <!-- Card Principal -->
                <div style="background:#1a1a1a;border:1px solid ${emailColor}33;border-radius:16px;padding:35px;margin-bottom:25px;">
                  
                  <h1 style="color:${emailColor};font-size:26px;margin:0 0 15px;text-align:center;">
                    Parabens, ${firstName}! 
                  </h1>
                  
                  <p style="color:#fff;font-size:16px;line-height:1.6;margin:0 0 20px;text-align:center;">
                    ${emailIntro}
                  </p>
                  
                  <!-- Produto -->
                  <div style="background:${emailColor}15;border:1px solid ${emailColor}30;border-radius:10px;padding:18px;margin:20px 0;">
                    <p style="color:#888;font-size:13px;margin:0 0 5px;">Produto adquirido:</p>
                    <p style="color:${emailColor};font-size:17px;font-weight:bold;margin:0;">
                       ${product.name}
                    </p>
                  </div>
                  
                  <p style="color:#ccc;font-size:15px;text-align:center;margin:25px 0 20px;">
                    Clique no botao abaixo para acessar sua area exclusiva:
                  </p>
                  
                  <!-- CTA Button -->
                  <div style="text-align:center;margin:25px 0;">
                    <a href="${magicLink}" 
                       style="display:inline-block;background:linear-gradient(135deg,${emailColor},${emailColor}dd);
                              color:#000;padding:16px 40px;text-decoration:none;border-radius:10px;
                              font-weight:bold;font-size:16px;box-shadow:0 4px 15px ${emailColor}40;">
                       ACESSAR MINHA AREA
                    </a>
                  </div>
                  
                  <p style="color:#666;font-size:12px;text-align:center;margin-top:20px;">
                     Este link expira em 7 dias
                  </p>
                  
                </div>
                
                <!-- Dicas -->
                <div style="background:#111;border-radius:10px;padding:20px;margin-bottom:25px;">
                  <h3 style="color:${emailColor};font-size:14px;margin:0 0 12px;"> Dicas importantes:</h3>
                  <ul style="color:#999;font-size:13px;line-height:1.8;margin:0;padding-left:18px;">
                    <li>Salve este email para acessar quando quiser</li>
                    <li>Voce pode solicitar um novo link a qualquer momento</li>
                    <li>Duvidas? Responda este email</li>
                  </ul>
                </div>
                
                <!-- Footer -->
                <div style="text-align:center;padding-top:15px;border-top:1px solid #222;">
                  <p style="color:#666;font-size:11px;margin:0;">
                     2025 Codigo da Reconquista. Todos os direitos reservados.
                  </p>
                </div>
                
              </div>
            </body>
            </html>
          `
        })
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.error('[Lojou] Erro ao enviar email:', errorText)
      } else {
        console.log('[Lojou] Email enviado com sucesso para:', email)
      }
    } else {
      console.log('[Lojou] RESEND_API_KEY nao configurada')
    }

    // Marcar webhook como processado
    await supabaseAdmin.from('payment_webhooks').update({
      processed: true,
      processed_at: new Date().toISOString(),
      user_email: email.toLowerCase()
    }).eq('id', webhookLog?.id)

    // Log de acesso
    await supabaseAdmin.from('access_logs').insert({
      user_id: userId,
      action: 'purchase_completed',
      metadata: {
        product_id: productId,
        product_name: product.name,
        is_new_user: isNewUser,
        magic_link_sent: !!RESEND_API_KEY
      }
    }).catch(() => {})

    console.log('[Lojou] Processamento concluido com sucesso!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pagamento processado com sucesso',
        user_id: userId,
        is_new_user: isNewUser,
        product: product.name,
        magic_link_sent: !!RESEND_API_KEY
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Lojou Webhook] Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
