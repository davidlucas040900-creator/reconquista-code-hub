import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    const { recipientType, recipientId, title, body } = await req.json();

    if (!title || !body) {
      return new Response(
        JSON.stringify({ error: "Título e mensagem são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let targetUsers: string[] = [];

    // Determinar destinatários
    if (recipientType === "single" && recipientId) {
      targetUsers = [recipientId];
    } else if (recipientType === "course" && recipientId) {
      // Buscar todos os usuários com acesso ao curso
      const { data: courseUsers } = await supabase
        .from("user_courses")
        .select("user_id")
        .eq("course_id", recipientId);
      
      targetUsers = courseUsers?.map((u) => u.user_id) || [];
    } else if (recipientType === "all") {
      // Buscar todos os usuários com acesso ativo
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("id")
        .eq("has_full_access", true);
      
      targetUsers = allUsers?.map((u) => u.id) || [];
    }

    console.log(`Enviando notificação para ${targetUsers.length} usuários`);

    let successCount = 0;
    let errorCount = 0;

    // Enviar para cada usuário
    for (const userId of targetUsers) {
      try {
        // Buscar subscription do usuário
        const { data: subscriptionData } = await supabase
          .from("push_subscriptions")
          .select("subscription")
          .eq("user_id", userId)
          .single();

        if (subscriptionData?.subscription) {
          // Aqui você implementaria o envio real do push notification
          // Por enquanto, apenas logamos
          console.log(`Push enviado para: ${userId}`);
          successCount++;
        }

        // Registrar no banco (independente de ter subscription)
        await supabase.from("notification_logs").insert({
          user_id: userId,
          title,
          body,
          sent_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error(`Erro ao enviar para ${userId}:`, err);
        errorCount++;
      }
    }

    // Registrar notificação enviada
    await supabase.from("sent_notifications").insert({
      recipient_type: recipientType,
      recipient_id: recipientId || null,
      title,
      body,
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notificação enviada para ${successCount} usuários`,
        total: targetUsers.length,
        successCount,
        errorCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});