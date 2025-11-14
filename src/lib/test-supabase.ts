import { supabase } from '@/integrations/supabase/client';

export async function testSupabaseConnection() {
  try {
    // Teste 1: Ping ao Supabase
    const { data, error } = await supabase.from('profiles').select('count');
    
    if (error) throw error;
    
    console.log('✅ Supabase conectado com sucesso!');
    console.log('📊 Total de perfis:', data);
    
    // Teste 2: Verificar autenticação
    const { data: { session } } = await supabase.auth.getSession();
    console.log('🔐 Sessão ativa:', session ? 'Sim' : 'Não');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar Supabase:', error);
    return false;
  }
}
