import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

    const { userId, subscriptionTier } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Init Modules] Inicializando módulos para usuário ${userId}, tier: ${subscriptionTier}`);

    // Verificar se já existem módulos para este usuário
    const { data: existing } = await supabase
      .from("user_modules")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[Init Modules] Módulos já existem para usuário ${userId}`);
      return new Response(
        JSON.stringify({ success: true, message: "Módulos já existem" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Definir módulos com datas de liberação progressiva (1 módulo a cada 2 dias)
    const modules = [
      { number: 1, name: "Reset Emocional", daysDelay: 0 },
      { number: 2, name: "Mapa da Mente Masculina", daysDelay: 2 },
      { number: 3, name: "Gatilhos da Memória Emocional", daysDelay: 4 },
      { number: 4, name: "A Frase de 5 Palavras", daysDelay: 6 },
      { number: 5, name: "Primeiro Contato Estratégico", daysDelay: 8 },
      { number: 6, name: "Domínio da Conversa", daysDelay: 10 },
      { number: 7, name: "Conquista Duradoura", daysDelay: 12 },
    ];

    // Criar registros de módulos
    const modulesToInsert = modules.map((mod) => ({
      user_id: userId,
      module_number: mod.number,
      module_name: mod.name,
      release_date: new Date(Date.now() + mod.daysDelay * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("user_modules")
      .insert(modulesToInsert);

    if (insertError) {
      console.error("[Init Modules] Erro ao inserir módulos:", insertError);
      throw insertError;
    }

    console.log(`[Init Modules] ${modules.length} módulos criados com sucesso para usuário ${userId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${modules.length} módulos inicializados com sucesso`,
        modulesCount: modules.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Init Modules] Erro geral:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
