import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const DEFAULT_PASSWORD = 'Reconquista@2026'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('=== WEBHOOK LOJOU ===', JSON.stringify(payload, null, 2))

    const transactionId = payload.id || payload.ID || payload.transaction_id || `TXN-${Date.now()}`
    const customerName = payload.nome_cliente || payload.nome || payload.name || 'Cliente'
    const productName = payload.produto || payload.product || ''
    const price = parseFloat(payload.preco || payload.price || payload.valor || 0)
    const fee = parseFloat(payload.taxa || payload.fee || 0)
    const status = (payload.status || 'aprovado').toLowerCase()
    const whatsapp = payload.whatsapp || payload.phone || payload.telefone || ''
    const email = (payload.email || payload.Email || '').toLowerCase().trim()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const approvedStatuses = ['aprovado', 'approved', 'paid', 'pago', 'completed', 'complete', 'success']
    if (!approvedStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ message: 'Status ignorado', status }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: existingPurchase } = await supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('lojou_transaction_id', transactionId)
      .maybeSingle()

    if (existingPurchase) {
      return new Response(
        JSON.stringify({ message: 'Transação já processada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let userId: string
    let isNewUser = false

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users?.find(u => u.email?.toLowerCase() === email)

    if (existingUser) {
      userId = existingUser.id
    } else {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: customerName, whatsapp: whatsapp }
      })

      if (createError) throw createError
      userId = newUser.user.id
      isNewUser = true
    }

    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      email: email,
      full_name: customerName,
      whatsapp: whatsapp,
      has_full_access: true,
      subscription_tier: 'premium',
      purchase_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('lojou_product_name', productName)
      .maybeSingle()

    await supabaseAdmin.from('purchases').insert({
      user_id: userId,
      profile_id: userId,
      product_id: product?.id || null,
      lojou_transaction_id: transactionId,
      lojou_product_name: productName,
      amount: price,
      fee: fee,
      status: 'active',
      customer_email: email,
      customer_name: customerName,
      customer_whatsapp: whatsapp,
      raw_payload: payload,
    })

    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await supabaseAdmin.from('magic_links').insert({
      user_id: userId,
      token: token,
      expires_at: expiresAt.toISOString(),
    })

    const SITE_URL = Deno.env.get('SITE_URL') || 'https://www.codigodareconquista.xyz'
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const magicLink = `${SITE_URL}/auto-login?token=${token}`

    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Código da Reconquista <acesso@codigodareconquista.xyz>',
          to: email,
          subject: isNewUser 
            ? '🎉 Bem-vinda! Seu acesso está liberado!'
            : '🚀 Compra confirmada!',
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #7c3aed; margin: 0;">🎉 Parabéns${customerName ? ', ' + customerName.split(' ')[0] : ''}!</h1>
              </div>
              
              <p>Sua compra do <strong>${productName}</strong> foi aprovada!</p>
              
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0;">
                <a href="${magicLink}" 
                   style="display: inline-block; background: white; color: #7c3aed; 
                          padding: 15px 40px; text-decoration: none; border-radius: 8px;
                          font-weight: bold; font-size: 16px;">
                  ACESSAR ÁREA DE MEMBROS
                </a>
              </div>

              ${isNewUser ? `
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0 0 10px; font-weight: bold;">📧 Seus dados de acesso:</p>
                <p style="margin: 5px 0;">Email: <strong>${email}</strong></p>
                <p style="margin: 5px 0;">Senha: <strong>${DEFAULT_PASSWORD}</strong></p>
              </div>
              ` : ''}

              <p style="color: #666; font-size: 14px;">
                O botão acima te leva direto para a área de membros.<br>
                Você também pode acessar pelo site usando seu email e senha.
              </p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center;">
                Código da Reconquista © ${new Date().getFullYear()}
              </p>
              
            </body>
            </html>
          `
        })
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: isNewUser ? 'Usuário criado' : 'Compra registrada',
        user_id: userId,
        is_new_user: isNewUser,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})