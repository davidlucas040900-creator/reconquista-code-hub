import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-payment-provider",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();
    const provider = req.headers.get("x-payment-provider") || "unknown";

    console.log(`[Webhook] Received ${provider} event:`, payload);

    // Log webhook para auditoria
    const { data: webhookLog, error: logError } = await supabase
      .from("payment_webhooks")
      .insert({
        provider,
        event_type: payload.type || payload.event || "unknown",
        payload,
        user_email: payload.customer_email || payload.email || payload.data?.object?.customer_email,
      })
      .select()
      .single();

    if (logError) {
      console.error("[Webhook] Erro ao registrar webhook:", logError);
    }

    // Processar baseado no provider
    let userEmail: string | null = null;
    let subscriptionTier: string | null = null;

    if (provider === "stripe") {
      if (payload.type === "checkout.session.completed") {
        userEmail = payload.data.object.customer_email;
        subscriptionTier = payload.data.object.metadata?.subscription_tier || "mensal";
      }
    } else if (provider === "paypal") {
      if (payload.event_type === "CHECKOUT.ORDER.APPROVED") {
        userEmail = payload.resource?.payer?.email_address;
        subscriptionTier = payload.resource?.purchase_units?.[0]?.custom_id || "mensal";
      }
    }

    if (userEmail && subscriptionTier) {
      console.log(`[Webhook] Processando pagamento para ${userEmail}, tier: ${subscriptionTier}`);

      // Buscar usuário pelo email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (profileError || !profile) {
        console.error("[Webhook] Usuário não encontrado:", userEmail);
        await supabase
          .from("payment_webhooks")
          .update({
            processed: false,
            error_message: "Usuário não encontrado",
          })
          .eq("id", webhookLog?.id);

        return new Response(
          JSON.stringify({ error: "Usuário não encontrado" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Calcular data de expiração
      let expiresAt: string | null = null;
      if (subscriptionTier === "semanal") {
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      } else if (subscriptionTier === "mensal") {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      }
      // vitalicio = null (sem expiração)

      // Atualizar perfil do usuário
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_tier: subscriptionTier,
          subscription_expires_at: expiresAt,
        })
        .eq("id", profile.id);

      if (updateError) {
        console.error("[Webhook] Erro ao atualizar perfil:", updateError);
        await supabase
          .from("payment_webhooks")
          .update({
            processed: false,
            error_message: updateError.message,
          })
          .eq("id", webhookLog?.id);

        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Inicializar módulos
      const initResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/initialize-user-modules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({ userId: profile.id, subscriptionTier }),
        }
      );

      if (!initResponse.ok) {
        console.error("[Webhook] Erro ao inicializar módulos");
      }

      // Marcar webhook como processado
      await supabase
        .from("payment_webhooks")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq("id", webhookLog?.id);

      console.log(`[Webhook] Pagamento processado com sucesso para ${userEmail}`);
    }

    return new Response(
      JSON.stringify({ received: true, processed: !!userEmail }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Webhook] Erro geral:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
