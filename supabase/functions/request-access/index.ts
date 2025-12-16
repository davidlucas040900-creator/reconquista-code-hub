import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const email = body?.email

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email e obrigatorio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Request Access] Solicitacao para:', email)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar usuario pelo email
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers()

    if (usersError) {
      console.log('[Request Access] Erro ao listar usuarios:', usersError.message)
      throw new Error('Erro ao buscar usuarios')
    }

    const existingUser = usersData.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!existingUser) {
      console.log('[Request Access] Usuario nao encontrado:', email)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Se este email estiver cadastrado, voce recebera um link de acesso.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se tem acesso
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('has_full_access, full_name')
      .eq('id', existingUser.id)
      .single()

    if (profileError) {
      console.log('[Request Access] Erro ao buscar perfil:', profileError.message)
    }

    if (!profile?.has_full_access) {
      console.log('[Request Access] Usuario sem acesso')
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Se este email estiver cadastrado, voce recebera um link de acesso.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // NOVO: Invalidar todos os tokens antigos NAO USADOS deste usuario
    const { error: invalidateError } = await supabaseAdmin
      .from('magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', existingUser.id)
      .is('used_at', null)

    if (invalidateError) {
      console.log('[Request Access] Erro ao invalidar tokens antigos:', invalidateError.message)
    } else {
      console.log('[Request Access] Tokens antigos invalidados')
    }

    // Gerar novo token
    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias

    // Inserir magic link
    const { error: insertError } = await supabaseAdmin.from('magic_links').insert({
      user_id: existingUser.id,
      token: token,
      expires_at: expiresAt
    })

    if (insertError) {
      console.log('[Request Access] Erro ao inserir magic link:', insertError.message)
      throw new Error('Erro ao gerar link de acesso')
    }

    console.log('[Request Access] Novo magic link criado')

    // Enviar email
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://areademembrocodigodareconquista.vercel.app'
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const magicLink = `${SITE_URL}/auto-login?token=${token}`
    const firstName = profile?.full_name?.split(' ')[0] || 'Aluna'

    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Codigo da Reconquista <acesso@codigodareconquista.xyz>',
          to: email,
          subject: `${firstName}, aqui esta seu link de acesso!`,
          html: `
            <div style="font-family:Arial;max-width:600px;margin:0 auto;padding:40px 20px;background:#0a0a0a;color:#fff;">
              <div style="text-align:center;margin-bottom:30px;">
                <span style="font-size:24px;font-weight:bold;color:#D4AF37;">Reconquista</span>
              </div>
              <div style="background:#1a1a1a;border:1px solid #D4AF3733;border-radius:16px;padding:35px;">
                <h1 style="color:#D4AF37;font-size:24px;margin:0 0 15px;text-align:center;">
                  Ola, ${firstName}!
                </h1>
                <p style="color:#fff;font-size:16px;line-height:1.6;text-align:center;margin:0 0 25px;">
                  Voce solicitou acesso a sua area de membros.<br>
                  Clique no botao abaixo para entrar:
                </p>
                <div style="text-align:center;margin:30px 0;">
                  <a href="${magicLink}"
                     style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#F4E06D);
                            color:#000;padding:16px 40px;text-decoration:none;border-radius:10px;
                            font-weight:bold;font-size:16px;">
                     ACESSAR AGORA
                  </a>
                </div>
                <p style="color:#666;font-size:12px;text-align:center;">
                  Este link expira em 7 dias.
                </p>
              </div>
            </div>
          `
        })
      })

      if (emailResponse.ok) {
        console.log('[Request Access] Email enviado com sucesso!')
      } else {
        const errorText = await emailResponse.text()
        console.log('[Request Access] Erro ao enviar email:', errorText)
      }
    }

    // Log de acesso
    try {
      await supabaseAdmin.from('access_logs').insert({
        user_id: existingUser.id,
        action: 'request_access',
        metadata: { email, token_generated: true }
      })
    } catch (logError) {
      console.log('[Request Access] Erro no log (ignorado):', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Link de acesso enviado para seu email!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.log('[Request Access] Erro:', error.message)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
