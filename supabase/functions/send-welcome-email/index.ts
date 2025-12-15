import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, magicLink, productName } = await req.json()

    // HTML do email
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #0a0a0a; color: #ffffff; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .header { text-align: center; margin-bottom: 40px; }
    .logo { font-size: 32px; font-weight: bold; color: #D4AF37; }
    .content { background: #1a1a1a; border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 40px; }
    .button { display: inline-block; background: linear-gradient(135deg, #D4AF37 0%, #F4E06D 100%); color: #0a0a0a; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; margin-top: 40px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo"> Reconquista</div>
    </div>
    <div class="content">
      <h1 style="color: #D4AF37;">Bem-vinda, ${name}! </h1>
      <p>Sua compra de <strong>${productName}</strong> foi confirmada com sucesso!</p>
      <p>Clique no botão abaixo para acessar sua área de membros:</p>
      <p style="text-align: center;">
        <a href="${magicLink}" class="button">ACESSAR AGORA</a>
      </p>
      <p style="color: #888; font-size: 14px;">
        Este link expira em 24 horas. Salve este email para acessar facilmente.
      </p>
      <hr style="border: 1px solid #333; margin: 30px 0;">
      <p><strong>Suas credenciais:</strong></p>
      <p> Email: ${email}</p>
      <p> Senha: Reconquista@2026</p>
      <p style="color: #888; font-size: 14px;">
        Recomendamos que você altere sua senha após o primeiro acesso.
      </p>
    </div>
    <div class="footer">
      <p>Precisa de ajuda? <a href="https://wa.me/258849999999" style="color: #D4AF37;">Entre em contato</a></p>
      <p> 2025 Reconquista. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
    `

    // OPÇÃO 1: Usar Resend (Recomendado)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Reconquista <noreply@reconquista.com>',
          to: [email],
          subject: `🎉 Bem-vinda! Seu acesso está pronto`,
          html: emailHTML,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar email via Resend')
      }

      return new Response(
        JSON.stringify({ success: true, provider: 'resend' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // OPÇÃO 2: Log (se não tiver Resend configurado)
    console.log(' EMAIL SERIA ENVIADO PARA:', email)
    console.log(' MAGIC LINK:', magicLink)

    return new Response(
      JSON.stringify({ 
        success: true, 
        provider: 'log',
        message: 'Email logado (configure RESEND_API_KEY para enviar de verdade)'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
