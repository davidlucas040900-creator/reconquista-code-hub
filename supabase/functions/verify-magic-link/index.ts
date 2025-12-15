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

  const startTime = Date.now()

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

    // 1. Buscar magic link (query optimizada - sem SELECT *)
    const { data: magicLink, error: linkError } = await supabaseAdmin
      .from('magic_links')
      .select('user_id, expires_at, used_at')
      .eq('token', token)
      .single()

    if (linkError || !magicLink) {
      console.log('[Verify] Token nao encontrado')
      return new Response(
        JSON.stringify({ success: false, error: 'Link invalido ou nao encontrado.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Validar usado
    if (magicLink.used_at) {
      console.log('[Verify] Token ja usado')
      return new Response(
        JSON.stringify({ success: false, error: 'Este link ja foi utilizado. Solicite um novo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Validar expiracao
    if (new Date(magicLink.expires_at) < new Date()) {
      console.log('[Verify] Token expirado')
      return new Response(
        JSON.stringify({ success: false, error: 'Link expirado. Solicite um novo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Token valido, user:', magicLink.user_id)

    // 4. Marcar como usado ANTES (previne uso duplicado em requests paralelos)
    await supabaseAdmin
      .from('magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    // 5. Buscar usuario
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(magicLink.user_id)
    
    if (userError || !userData?.user?.email) {
      console.log('[Verify] Usuario nao encontrado')
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario nao encontrado.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Usuario:', userData.user.email)

    // 6. Criar sessao (metodo optimizado com UUID mais curto)
    const tempPass = crypto.randomUUID().split('-')[0] + Date.now().toString(36)

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      magicLink.user_id, 
      { password: tempPass }
    )

    if (updateError) {
      console.log('[Verify] Erro update:', updateError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao preparar sessao.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: userData.user.email,
      password: tempPass
    })

    if (signInError || !signInData.session) {
      console.log('[Verify] Erro signIn:', signInError?.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao criar sessao.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 7. Log async (nao bloqueia resposta)
    supabaseAdmin.from('access_logs').insert({
      user_id: magicLink.user_id,
      action: 'magic_link_login',
      metadata: { elapsed_ms: Date.now() - startTime }
    }).then(() => {}).catch(() => {})

    const elapsed = Date.now() - startTime
    console.log(`[Verify] Sucesso em ${elapsed}ms`)

    // 8. Retornar (mesmo formato que AutoLogin.tsx espera)
    return new Response(
      JSON.stringify({
        success: true,
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
        user: {
          id: signInData.user.id,
          email: signInData.user.email
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
