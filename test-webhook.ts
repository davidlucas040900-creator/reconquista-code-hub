
// test-webhook.ts - Testar webhook localmente

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://csltrjuucicnlhipaszh.supabase.co'

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzbHRyanV1Y2ljbmxoaXBhc3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0NDQxODcsImV4cCI6MjA3NjAyMDE4N30.MSqM7ePuOtDkr_11X0MtFiqIXSrzXOeWd_5cPIH7VAE'

// Payload de teste (simulando Lojou)

const testPayload = {

  id: TEST-${Date.now()},

  nome_cliente: 'Maria Teste',

  email: 'fatimaamerico262@gmail.com', 

  whatsapp: '+258849999999',

  produto: 'O Código da Reconquista - Programa Completo',

  preco: 197.00,

  taxa: 29.90,

  status: 'aprovado'

}

async function testWebhook() {

  console.log(' TESTANDO WEBHOOK...\n')

  console.log(' Payload:', JSON.stringify(testPayload, null, 2))

  try {

    // Chamar o webhook

    const response = await fetch(

      'https://csltrjuucicnlhipaszh.supabase.co/functions/v1/lojou-webhook',

      {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

          'Authorization': Bearer ${SUPABASE_ANON_KEY}

        },

        body: JSON.stringify(testPayload)

      }

    )

    const result = await response.json()

    console.log('\n RESULTADO:')

    console.log('Status:', response.status)

    console.log('Response:', JSON.stringify(result, null, 2))

    if (response.ok) {

      console.log('\n WEBHOOK FUNCIONOU!')

      console.log('\n VERIFICAÇÕES:')

      console.log('1. Vá no Supabase > Table Editor > purchases')

      console.log('2. Vá no Supabase > Table Editor > profiles')

      console.log('3. Verifique se o usuário teste@exemplo.com foi criado')

      console.log('4. Verifique seu email (teste@exemplo.com)')

      console.log('5. Deve ter recebido email de boas-vindas com magic link')

    } else {

      console.log('\n❌ ERRO NO WEBHOOK!')

    }

  } catch (error) {

    console.error('\n❌ ERRO:', error)

  }

}

testWebhook()

