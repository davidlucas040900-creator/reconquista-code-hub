// supabase/functions/request-access/index.ts

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
    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar se o usuário existe
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!existingUser) {
      // Não revelar se o email existe ou não (segurança)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Se este email estiver cadastrado, você receberá um link de acesso.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se tem acesso (comprou algum produto)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('has_full_access, full_name')
      .eq('id', existingUser.id)
      .single()

    if (!profile?.has_full_access) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Se este email estiver cadastrado, você receberá um link de acesso.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gerar novo magic link
    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    await supabaseAdmin.from('magic_links').insert({
      user_id: existingUser.id,
      token: token,
      expires_at: expiresAt.toISOString(),
    })

    // Enviar email
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://areademembrocodigodareconquista-nine.vercel.app'
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const magicLink = `${SITE_URL}/auto-login?token=${token}`
    const firstName = profile.full_name?.split(' ')[0] || 'Aluna'

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
          subject: '🔐 Seu link de acesso está aqui!',
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #18181b; margin: 0; font-size: 24px;">
                  Olá, ${firstName}!
                </h1>
              </div>
              
              <p style="color: #52525b;">
                Você solicitou acesso à sua área de membros. 
                Clique no botão abaixo para entrar:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${magicLink}" 
                   style="display: inline-block; background: #18181b; color: white; 
                          padding: 14px 32px; text-decoration: none; border-radius: 8px;
                          font-weight: 500; font-size: 16px;">
                  Acessar Área de Membros
                </a>
              </div>

              <p style="color: #71717a; font-size: 14px;">
                Este link expira em 24 horas.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 30px 0;">
              
              <p style="color: #a1a1aa; font-size: 12px; text-align: center;">
                Se você não solicitou este acesso, ignore este email.
              </p>
              
            </body>
            </html>
          `
        })
      })

      // Log de acesso
      await supabaseAdmin.from('access_logs').insert({
        user_id: existingUser.id,
        action: 'request_access',
        metadata: { email, token_generated: true }
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Link de acesso enviado para seu email!' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
