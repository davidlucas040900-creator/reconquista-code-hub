"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  whatsapp: string | null;
  has_full_access: boolean;
  role: string;
  avatar_url: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, whatsapp: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('[Auth] Buscando perfil para:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Auth] Erro ao buscar perfil:', error);
        return null;
      }

      console.log('[Auth] Perfil encontrado:', data?.email);
      return data as Profile;
    } catch (error) {
      console.error('[Auth] Erro ao buscar perfil:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('[Auth] Iniciando autenticacao...');
        
        // IMPORTANTE: Verificar se tem hash na URL (magic link)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.log('[Auth] Hash detectado, processando magic link...');
          
          // Extrair tokens do hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken && refreshToken) {
            console.log('[Auth] Tokens encontrados, criando sessao...');
            
            // Definir sessao manualmente
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            
            if (sessionError) {
              console.error('[Auth] Erro ao definir sessao:', sessionError);
            } else if (sessionData.session) {
              console.log('[Auth] Sessao criada com sucesso!');
              
              if (mounted) {
                setSession(sessionData.session);
                setUser(sessionData.session.user);
                
                const profileData = await fetchProfile(sessionData.session.user.id);
                setProfile(profileData);
              }
              
              // Limpar hash da URL
              window.history.replaceState(null, '', window.location.pathname);
            }
          }
        }
        
        // Buscar sessao existente
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.log('[Auth] Sessao existente:', !!existingSession);

        if (mounted && existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          
          const profileData = await fetchProfile(existingSession.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('[Auth] Erro na inicializacao:', error);
      } finally {
        if (mounted) {
          console.log('[Auth] Loading finalizado');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listener de mudancas de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Auth] Evento:', event);
        
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            const profileData = await fetchProfile(newSession.user.id);
            setProfile(profileData);
          } else {
            setProfile(null);
          }

          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, whatsapp: string) => {
    try {
      const redirectUrl = `${window.location.origin}/login`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName, whatsapp: whatsapp },
        },
      });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setProfile(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
