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
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.log('[Verify] ERRO: Variaveis de ambiente nao configuradas')
      return new Response(
        JSON.stringify({ success: false, error: 'Erro de configuracao do servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      console.log('[Verify] Token invalido ou expirado:', linkError?.message)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Link invalido, expirado ou ja utilizado. Solicite um novo acesso.' 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Magic link valido para user:', magicLink.user_id)

    // Buscar email do usuario
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(
      magicLink.user_id
    )

    if (userError || !userData?.user?.email) {
      console.log('[Verify] Usuario nao encontrado:', userError?.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario nao encontrado' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userEmail = userData.user.email
    console.log('[Verify] Email do usuario:', userEmail)

    // Gerar action link do Supabase
    const SITE_URL = Deno.env.get('SITE_URL') || 'https://areademembrocodigodareconquista-nine.vercel.app'
    
    const { data: linkData, error: genError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
      options: {
        redirectTo: `${SITE_URL}/dashboard`
      }
    })

    if (genError || !linkData?.properties?.action_link) {
      console.log('[Verify] Erro ao gerar sessao:', genError?.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao gerar sessao de acesso' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Action link gerado com sucesso!')

    // Marcar token como usado
    const { error: updateError } = await supabaseAdmin
      .from('magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    if (updateError) {
      console.log('[Verify] Erro ao marcar token como usado:', updateError.message)
    }

    // Log de acesso
    try {
      await supabaseAdmin.from('access_logs').insert({
        user_id: magicLink.user_id,
        action: 'magic_link_login',
        metadata: { 
          product_name: magicLink.product_name || 'N/A',
          token_used: true 
        }
      })
    } catch (logErr) {
      console.log('[Verify] Erro no log (ignorado)')
    }

    console.log('[Verify] Sucesso! Retornando action_link')

    return new Response(
      JSON.stringify({
        success: true,
        action_link: linkData.properties.action_link,
        user_id: magicLink.user_id,
        product_name: magicLink.product_name
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.log('[Verify] Erro geral:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno do servidor' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
