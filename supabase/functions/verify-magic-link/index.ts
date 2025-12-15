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

    console.log('[Verify] Token recebido')

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

    // Buscar magic link
    const { data: magicLink, error: linkError } = await supabaseAdmin
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (linkError || !magicLink) {
      console.log('[Verify] Token invalido ou expirado')
      return new Response(
        JSON.stringify({ success: false, error: 'Link invalido, expirado ou ja utilizado.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Magic link valido, user:', magicLink.user_id)

    // Buscar usuario
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(magicLink.user_id)
    if (!userData?.user?.email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario nao encontrado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Usuario encontrado:', userData.user.email)

    // Criar sessao usando senha temporaria
    const tempPassword = 'TempMagicLink_' + Date.now() + '_' + Math.random().toString(36)
    
    // Atualizar senha temporariamente
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(magicLink.user_id, {
      password: tempPassword
    })

    if (updateError) {
      console.log('[Verify] Erro ao atualizar senha:', updateError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao preparar sessao' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fazer login com a senha temporaria
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: userData.user.email,
      password: tempPassword
    })

    if (signInError || !signInData.session) {
      console.log('[Verify] Erro no signIn:', signInError?.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao criar sessao' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Sessao criada com sucesso!')

    // Marcar token como usado
    await supabaseAdmin.from('magic_links').update({ used_at: new Date().toISOString() }).eq('token', token)

    // Log
    try {
      await supabaseAdmin.from('access_logs').insert({
        user_id: magicLink.user_id,
        action: 'magic_link_login',
        metadata: { product_name: magicLink.product_name }
      })
    } catch (e) {}

    // Retornar tokens da sessao
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
    console.log('[Verify] Erro geral:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
