import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Verificar token customizado na tabela magic_links
    const { data: magicLink, error: linkError } = await supabaseAdmin
      .from('magic_links')
      .select('*, profiles!inner(email)')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (linkError || !magicLink) {
      return new Response(
        JSON.stringify({ error: 'Token inválido, expirado ou já usado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Gerar sessão de autenticação (SEM precisar de senha!)
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: magicLink.profiles.email
    })

    if (sessionError || !sessionData?.properties?.action_link) {
      throw new Error('Erro ao gerar sessão de autenticação')
    }

    // 3. Marcar token como usado
    await supabaseAdmin
      .from('magic_links')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token)

    // 4. Log de acesso
    await supabaseAdmin.from('access_logs').insert({
      user_id: magicLink.user_id,
      action: 'magic_link_login',
      metadata: { token_used: true }
    })

    // 5. Retornar action_link do Supabase
    return new Response(
      JSON.stringify({
        success: true,
        action_link: sessionData.properties.action_link
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
