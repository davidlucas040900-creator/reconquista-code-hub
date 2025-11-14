// Validação de variáveis de ambiente
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

const optionalEnvVars = [
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'VITE_GA_TRACKING_ID',
] as const;

// Validar ao iniciar app
export function validateEnv() {
  const missing = requiredEnvVars.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    throw new Error(
      `❌ Variáveis de ambiente faltando: ${missing.join(', ')}`
    );
  }

  console.log('✅ Variáveis de ambiente validadas');
}

// Exportar variáveis tipadas
export const env = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Código da Reconquista',
    url: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
    env: import.meta.env.VITE_APP_ENV || 'development',
  },
} as const;
