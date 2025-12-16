import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  console.log('[Verify] Request recebido, metodo:', req.method)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const token = body?.token

    console.log('[Verify] Token recebido:', token ? token.substring(0, 20) + '...' : 'VAZIO')

    if (!token) {
      console.log('[Verify] ERRO: Token nao fornecido')
      return new Response(
        JSON.stringify({ success: false, error: 'Token obrigatorio' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Buscar o magic link
    console.log('[Verify] Buscando magic_link no banco...')
    const { data: magicLink, error: linkError } = await supabaseAdmin
      .from('magic_links')
      .select('id, user_id, expires_at, used_at')
      .eq('token', token)
      .maybeSingle()

    console.log('[Verify] Resultado busca:', JSON.stringify({ magicLink, linkError }))

    if (linkError) {
      console.log('[Verify] ERRO ao buscar magic_link:', linkError.message)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao buscar link: ' + linkError.message }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!magicLink) {
      console.log('[Verify] Magic link NAO encontrado para token')
      return new Response(
        JSON.stringify({ success: false, error: 'Link invalido ou nao encontrado.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('[Verify] Magic link encontrado, user_id:', magicLink.user_id)

    // 2. Verificar se já foi usado
    if (magicLink.used_at) {
      console.log('[Verify] Link ja foi utilizado em:', magicLink.used_at)
      return new Response(
        JSON.stringify({ success: false, error: 'Este link ja foi utilizado. Solicite um novo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Verificar expiração
    if (new Date(magicLink.expires_at) < new Date()) {
      console.log('[Verify] Link expirado em:', magicLink.expires_at)
      return new Response(
        JSON.stringify({ success: false, error: 'Link expirado. Solicite um novo.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4. Buscar usuário no Auth
    console.log('[Verify] Buscando usuario no Auth, ID:', magicLink.user_id)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(magicLink.user_id)

    console.log('[Verify] Resultado getUserById:', JSON.stringify({ 
      found: !!userData?.user, 
      email: userData?.user?.email,
      error: userError?.message 
    }))

    if (userError) {
      console.log('[Verify] ERRO ao buscar usuario:', userError.message)
      
      // Tentar buscar o email na tabela profiles como fallback
      console.log('[Verify] Tentando fallback via profiles...')
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email')
        .eq('id', magicLink.user_id)
        .single()

      if (profile?.email) {
        console.log('[Verify] Email encontrado em profiles:', profile.email)
        
        // Buscar usuário pelo email
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
        const foundUser = authUsers?.users?.find(u => u.email?.toLowerCase() === profile.email.toLowerCase())
        
        if (foundUser) {
          console.log('[Verify] Usuario encontrado via fallback:', foundUser.id)
          
          // Atualizar o magic_link com o ID correto
          await supabaseAdmin
            .from('magic_links')
            .update({ user_id: foundUser.id })
            .eq('id', magicLink.id)
          
          // Continuar com este usuário
          return await processLogin(supabaseAdmin, foundUser, magicLink, token, corsHeaders)
        }
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario nao encontrado.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!userData?.user) {
      console.log('[Verify] Usuario nao existe no Auth')
      return new Response(
        JSON.stringify({ success: false, error: 'Usuario nao encontrado.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return await processLogin(supabaseAdmin, userData.user, magicLink, token, corsHeaders)

  } catch (error) {
    console.log('[Verify] ERRO FATAL:', error.message)
    console.log('[Verify] Stack:', error.stack)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno: ' + error.message }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function processLogin(supabaseAdmin: any, user: any, magicLink: any, token: string, corsHeaders: any) {
  console.log('[Verify] Processando login para:', user.email)

  // Marcar como usado
  await supabaseAdmin
    .from('magic_links')
    .update({ used_at: new Date().toISOString() })
    .eq('token', token)

  console.log('[Verify] Magic link marcado como usado')

  // Gerar link de autenticação
  console.log('[Verify] Gerando link de autenticacao...')
  const { data: linkData, error: linkGenError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email,
    options: {
      redirectTo: 'https://areademembrocodigodareconquista-nine.vercel.app/auth/callback'
    }
  })

  if (linkGenError || !linkData) {
    console.log('[Verify] ERRO ao gerar link:', linkGenError?.message)
    return new Response(
      JSON.stringify({ success: false, error: 'Erro ao gerar acesso: ' + (linkGenError?.message || 'unknown') }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log('[Verify] Link de auth gerado com sucesso!')
  console.log('[Verify] Action link presente:', !!linkData.properties?.action_link)

  // Log de acesso (não bloquear se falhar)
  supabaseAdmin.from('access_logs').insert({
    user_id: user.id,
    action: 'magic_link_login'
  }).then(() => console.log('[Verify] Access log registrado'))
    .catch((e: any) => console.log('[Verify] Erro ao registrar access log:', e.message))

  console.log('[Verify] SUCESSO! Retornando dados de login')

  return new Response(
    JSON.stringify({
      success: true,
      action_link: linkData.properties?.action_link,
      user: {
        id: user.id,
        email: user.email
      }
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}