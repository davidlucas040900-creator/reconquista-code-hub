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

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('[Auth] Buscando perfil para:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('[Auth] Perfil nao encontrado, criando...');
        
        // Criar perfil se não existir
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail || '',
            full_name: 'Usuario',
            has_full_access: true, // Por padrao dar acesso
            role: 'user'
          })
          .select()
          .single();

        if (insertError) {
          console.error('[Auth] Erro ao criar perfil:', insertError);
          // Retornar perfil padrao mesmo assim
          return {
            id: userId,
            email: userEmail || '',
            full_name: 'Usuario',
            whatsapp: null,
            has_full_access: true,
            role: 'user',
            avatar_url: null
          } as Profile;
        }

        console.log('[Auth] Perfil criado:', newProfile?.email);
        return newProfile as Profile;
      }

      console.log('[Auth] Perfil encontrado:', data?.email);
      return data as Profile;
    } catch (error) {
      console.error('[Auth] Erro ao buscar perfil:', error);
      // Retornar perfil padrao
      return {
        id: userId,
        email: userEmail || '',
        full_name: 'Usuario',
        whatsapp: null,
        has_full_access: true,
        role: 'user',
        avatar_url: null
      } as Profile;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const profileData = await fetchProfile(user.id, user.email);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('[Auth] Iniciando...');
        
        // Buscar sessao existente
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.log('[Auth] Sessao existente:', !!existingSession);

        if (mounted && existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          
          const profileData = await fetchProfile(existingSession.user.id, existingSession.user.email);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('[Auth] Erro:', error);
      } finally {
        if (mounted) {
          console.log('[Auth] Loading = false');
          setLoading(false);
        }
      }
    };

    initAuth();

    // Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Auth] Evento:', event);
        
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            const profileData = await fetchProfile(newSession.user.id, newSession.user.email);
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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: { full_name: fullName, whatsapp },
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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
