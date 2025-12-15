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

    console.log('[Verify] Token recebido:', token?.substring(0, 20) + '...')

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token obrigatorio' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.log('[Verify] ERRO: Variaveis nao configuradas')
      return new Response(
        JSON.stringify({ success: false, error: 'Erro de configuracao' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

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

    if (userError || !userData?.user?.email) {
      console.log('[Verify] Usuario nao encontrado')
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario nao encontrado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Usuario:', userData.user.email)

    // Gerar action link
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://areademembrocodigodareconquista-nine.vercel.app'
    
    const { data: linkData, error: genError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
      options: {
        redirectTo: `${SITE_URL}/dashboard`
      }
    })

    if (genError || !linkData?.properties?.action_link) {
      console.log('[Verify] Erro ao gerar link:', genError?.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao gerar sessao' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Action link gerado!')

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

    return new Response(
      JSON.stringify({
        success: true,
        action_link: linkData.properties.action_link,
        user_id: magicLink.user_id
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
