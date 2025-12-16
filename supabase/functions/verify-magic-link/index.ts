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
    const token = body?.token

    console.log('[Verify] Iniciando...')

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token obrigatorio' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Buscar magic link
    const { data: magicLink, error: linkError } = await supabaseAdmin
      .from('magic_links')
      .select('user_id, expires_at, used_at')
      .eq('token', token)
      .single()

    if (linkError || !magicLink) {
      return new Response(
        JSON.stringify({ success: false, error: 'Link invalido ou nao encontrado.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Validar usado
    if (magicLink.used_at) {
      return new Response(
        JSON.stringify({ success: false, error: 'Este link ja foi utilizado. Solicite um novo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Validar expiracao
    if (new Date(magicLink.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Link expirado. Solicite um novo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Buscar usuario
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(magicLink.user_id)

    if (userError || !userData?.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario nao encontrado.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Usuario:', userData.user.email)

    // 5. Marcar como usado
    await supabaseAdmin
      .from('magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    // 6. Limpar sessoes antigas
    try {
      await supabaseAdmin.rpc('delete_user_sessions', { p_user_id: magicLink.user_id })
    } catch (e) {
      console.log('[Verify] Aviso sessoes:', e.message)
    }

    // 7. Gerar sessao via Admin API
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
      user_id: magicLink.user_id
    })

    if (sessionError || !sessionData?.session) {
      console.log('[Verify] Erro createSession:', sessionError?.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao criar sessao.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 8. Log
    supabaseAdmin.from('access_logs').insert({
      user_id: magicLink.user_id,
      action: 'magic_link_login'
    }).then(() => {}).catch(() => {})

    console.log('[Verify] Sucesso!')

    return new Response(
      JSON.stringify({
        success: true,
        access_token: sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        user: {
          id: userData.user.id,
          email: userData.user.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.log('[Verify] Erro:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
