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

    console.log('[Verify] Token:', token?.substring(0, 20) + '...')

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

    // Buscar magic link valido
    const { data: magicLink, error: linkError } = await supabaseAdmin
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (linkError || !magicLink) {
      console.log('[Verify] Token invalido:', linkError?.message)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Link invalido, expirado ou ja utilizado. Solicite um novo acesso.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Magic link valido, user_id:', magicLink.user_id)

    // Buscar usuario
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      magicLink.user_id
    )

    if (userError || !userData?.user) {
      console.log('[Verify] Usuario nao encontrado')
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario nao encontrado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Usuario:', userData.user.email)

    // NOVA ABORDAGEM: Gerar sessao diretamente usando signInWithPassword fake
    // Ou usar o generateLink com redirect imediato
    
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://areademembrocodigodareconquista-nine.vercel.app'
    
    // Gerar um OTP (One-Time Password) link que nao expira tao rapido
    const { data: otpData, error: otpError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
      options: {
        redirectTo: `${SITE_URL}/dashboard`
      }
    })

    if (otpError) {
      console.log('[Verify] Erro ao gerar OTP:', otpError.message)
      
      // Fallback: retornar dados do usuario para o frontend fazer login
      return new Response(
        JSON.stringify({ 
          success: true, 
          user_id: magicLink.user_id,
          email: userData.user.email,
          use_session_restore: true
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Marcar token como usado
    await supabaseAdmin
      .from('magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    // Log
    try {
      await supabaseAdmin.from('access_logs').insert({
        user_id: magicLink.user_id,
        action: 'magic_link_login',
        metadata: { product_name: magicLink.product_name }
      })
    } catch (e) {}

    console.log('[Verify] Sucesso!')

    // Retornar o action_link (vamos melhorar o frontend para processar rapido)
    return new Response(
      JSON.stringify({
        success: true,
        action_link: otpData.properties?.action_link,
        hashed_token: otpData.properties?.hashed_token,
        user_id: magicLink.user_id,
        email: userData.user.email
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.log('[Verify] Erro:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
