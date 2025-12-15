import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Mapeamento de produtos
const PRODUCT_MAP: Record<string, { name: string; accessKey: string; color: string }> = {
  'codigo_reconquista': { 
    name: 'O Codigo da Reconquista - Programa Completo', 
    accessKey: 'codigo_reconquista',
    color: '#D4AF37'
  },
  'deusa_vip': { 
    name: 'A Deusa na Cama - Acesso VIP', 
    accessKey: 'deusa_cama',
    color: '#E91E63'
  },
  'deusa_essencial': { 
    name: 'A Deusa na Cama - Essencial', 
    accessKey: 'deusa_cama',
    color: '#E91E63'
  },
  'exclusivo_1': { 
    name: 'Acesso Exclusivo para os 1%', 
    accessKey: 'exclusivo_1percent',
    color: '#9C27B0'
  },
  'exclusivo_1_essencial': { 
    name: 'Acesso Exclusivo para os 1% - Essencial', 
    accessKey: 'exclusivo_1percent',
    color: '#9C27B0'
  },
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
    console.log('[Lojou] Payload recebido:', JSON.stringify(payload))

    // Log do webhook
    try {
      await supabaseAdmin.from('payment_webhooks').insert({
        provider: 'lojou_pay',
        event_type: payload.event || payload.status || 'unknown',
        payload,
        processed: false
      })
    } catch (logErr) {
      console.log('[Lojou] Erro ao logar webhook (ignorado):', logErr)
    }

    // ============================================
    // EXTRAIR DADOS - Formato Lojou Pay
    // Campos: ID, Nome do cliente, Produto, Preco, Taxa, Status, WhatsApp, Email
    // ============================================
    
    // Email (tentar varios campos possiveis)
    const email = payload.email || 
                  payload.Email || 
                  payload.customer?.email || 
                  payload.cliente?.email ||
                  payload.buyer?.email ||
                  payload.data?.email
    
    // Nome
    const name = payload.name ||
                 payload.nome ||
                 payload.Nome ||
                 payload["Nome do cliente"] ||
                 payload.customer?.name ||
                 payload.cliente?.nome ||
                 payload.buyer?.name ||
                 'Cliente'
    
    // Produto
    const productId = payload.product?.id ||
                      payload.produto?.id ||
                      payload.Produto ||
                      payload.product_id ||
                      'codigo_reconquista'
    
    const productName = payload.product?.name ||
                        payload.produto?.nome ||
                        payload.Produto ||
                        payload.product_name
    
    // Preco
    const amount = payload.amount ||
                   payload.Preco ||
                   payload.preco ||
                   payload.value ||
                   payload.valor ||
                   0
    
    // Status
    const status = payload.status ||
                   payload.Status ||
                   payload.event ||
                   payload.payment_status
    
    // WhatsApp
    const whatsapp = payload.whatsapp ||
                     payload.WhatsApp ||
                     payload.telefone ||
                     payload.phone

    console.log('[Lojou] Dados extraidos:', { email, name, productId, status, whatsapp })

    // Verificar status aprovado
    const approvedStatuses = ['approved', 'paid', 'completed', 'confirmed', 'APPROVED', 'PAID', 'Aprovado', 'Pago']
    const isApproved = approvedStatuses.some(s => 
      status?.toLowerCase?.() === s.toLowerCase() || status === s
    )

    if (!isApproved) {
      console.log('[Lojou] Status nao aprovado:', status)
      return new Response(
        JSON.stringify({ received: true, processed: false, reason: 'Status not approved: ' + status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!email) {
      console.error('[Lojou] Email nao encontrado no payload')
      return new Response(
        JSON.stringify({ error: 'Email do cliente nao encontrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mapear produto
    const product = PRODUCT_MAP[productId] || PRODUCT_MAP[productId?.toLowerCase?.()] || { 
      name: productName || 'O Codigo da Reconquista', 
      accessKey: 'codigo_reconquista',
      color: '#D4AF37'
    }

    console.log('[Lojou] Produto:', product)

    // Verificar/criar usuario
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    let userId: string
    let isNewUser = false
    
    const existingUser = users.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      userId = existingUser.id
      console.log('[Lojou] Usuario existente:', userId)
    } else {
      // Criar usuario SEM SENHA
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true,
        user_metadata: { 
          full_name: name,
          whatsapp: whatsapp,
          source: 'lojou_pay'
        }
      })

      if (createError || !newUser?.user) {
        console.error('[Lojou] Erro ao criar usuario:', createError)
        return new Response(
          JSON.stringify({ error: 'Falha ao criar usuario: ' + createError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      userId = newUser.user.id
      isNewUser = true
      console.log('[Lojou] Novo usuario criado:', userId)
    }

    // Atualizar perfil
    try {
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email: email.toLowerCase(),
        full_name: name,
        whatsapp: whatsapp,
        has_full_access: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' })
      console.log('[Lojou] Perfil atualizado')
    } catch (profileErr) {
      console.log('[Lojou] Erro ao atualizar perfil:', profileErr)
    }

    // Registrar compra
    try {
      await supabaseAdmin.from('user_purchases').insert({
        user_id: userId,
        product_id: productId,
        product_name: product.name,
        access_key: product.accessKey,
        amount: amount,
        currency: 'MZN',
        purchased_at: new Date().toISOString(),
        payload: payload
      })
      console.log('[Lojou] Compra registrada')
    } catch (purchaseErr) {
      console.log('[Lojou] Erro ao registrar compra:', purchaseErr)
    }

    // Gerar Magic Link
    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias

    try {
      await supabaseAdmin.from('magic_links').insert({
        user_id: userId,
        token: token,
        expires_at: expiresAt.toISOString(),
        product_id: productId,
        product_name: product.name
      })
      console.log('[Lojou] Magic link criado')
    } catch (linkErr) {
      console.log('[Lojou] Erro ao criar magic link:', linkErr)
    }

    // Enviar email
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://areademembrocodigodareconquista-nine.vercel.app'
    const magicLink = `${SITE_URL}/auto-login?token=${token}`
    const firstName = name.split(' ')[0]
    const emailColor = product.color

    if (RESEND_API_KEY) {
      console.log('[Lojou] Enviando email...')
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Codigo da Reconquista <acesso@codigodareconquista.xyz>',
          to: email,
          subject: ` ${firstName}, seu acesso ao ${product.name} esta pronto!`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
              <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
                
                <div style="text-align:center;margin-bottom:30px;">
                  <span style="font-size:24px;font-weight:bold;color:${emailColor};"> Reconquista</span>
                </div>
                
                <div style="background:#1a1a1a;border:1px solid ${emailColor}33;border-radius:16px;padding:35px;">
                  
                  <h1 style="color:${emailColor};font-size:26px;margin:0 0 15px;text-align:center;">
                    Parabens, ${firstName}! 
                  </h1>
                  
                  <p style="color:#fff;font-size:16px;line-height:1.6;text-align:center;margin:0 0 20px;">
                    Sua compra foi confirmada com sucesso!
                  </p>
                  
                  <div style="background:${emailColor}15;border:1px solid ${emailColor}30;border-radius:10px;padding:18px;margin:20px 0;">
                    <p style="color:#888;font-size:13px;margin:0 0 5px;">Produto adquirido:</p>
                    <p style="color:${emailColor};font-size:17px;font-weight:bold;margin:0;">
                       ${product.name}
                    </p>
                  </div>
                  
                  <p style="color:#ccc;font-size:15px;text-align:center;margin:25px 0 20px;">
                    Clique no botao abaixo para acessar:
                  </p>
                  
                  <div style="text-align:center;margin:25px 0;">
                    <a href="${magicLink}" 
                       style="display:inline-block;background:linear-gradient(135deg,${emailColor},${emailColor}dd);
                              color:#000;padding:16px 40px;text-decoration:none;border-radius:10px;
                              font-weight:bold;font-size:16px;">
                       ACESSAR MINHA AREA
                    </a>
                  </div>
                  
                  <p style="color:#666;font-size:12px;text-align:center;margin-top:20px;">
                    Este link expira em 7 dias
                  </p>
                  
                </div>
                
                <div style="text-align:center;margin-top:25px;">
                  <p style="color:#666;font-size:11px;">
                     2025 Codigo da Reconquista
                  </p>
                </div>
                
              </div>
            </body>
            </html>
          `
        })
      })

      if (emailResponse.ok) {
        console.log('[Lojou] Email enviado com sucesso!')
      } else {
        const errorText = await emailResponse.text()
        console.log('[Lojou] Erro ao enviar email:', errorText)
      }
    } else {
      console.log('[Lojou] RESEND_API_KEY nao configurada')
    }

    // Log de acesso
    try {
      await supabaseAdmin.from('access_logs').insert({
        user_id: userId,
        action: 'purchase_completed',
        metadata: {
          product_id: productId,
          product_name: product.name,
          is_new_user: isNewUser,
          amount: amount
        }
      })
    } catch (logErr) {
      console.log('[Lojou] Erro no log de acesso:', logErr)
    }

    console.log('[Lojou] Processamento concluido!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pagamento processado com sucesso',
        user_id: userId,
        is_new_user: isNewUser,
        product: product.name,
        email_sent: !!RESEND_API_KEY
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[Lojou] Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
