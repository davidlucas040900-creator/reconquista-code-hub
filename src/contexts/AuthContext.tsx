"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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

  const fetchingProfile = useRef(false);
  const lastFetchedUserId = useRef<string | null>(null);
  const initialized = useRef(false);

  const fetchProfile = async (userId: string, userEmail?: string, retryCount = 0): Promise<Profile | null> => {
    if (fetchingProfile.current && lastFetchedUserId.current === userId) {
      console.log('[Auth] Ja buscando perfil, ignorando...');
      return null;
    }

    fetchingProfile.current = true;
    lastFetchedUserId.current = userId;

    try {
      console.log('[Auth] Buscando perfil para:', userId, retryCount > 0 ? `(tentativa ${retryCount + 1})` : '');

      // Timeout de 5 segundos para a query
      const timeoutPromise = new Promise<null>((resolve) => 
        setTimeout(() => resolve(null), 5000)
      );

      const queryPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const result = await Promise.race([queryPromise, timeoutPromise]);

      // Se deu timeout
      if (result === null) {
        console.log('[Auth] Timeout ao buscar perfil');
        fetchingProfile.current = false;
        
        // Retornar perfil padrao para nao travar
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

      const { data, error } = result;

      if (error) {
        console.log('[Auth] Erro ao buscar perfil:', error.message);
        
        // Se for erro de permissao e ainda temos retries, tentar novamente
        if (retryCount < 2) {
          console.log('[Auth] Tentando novamente em 500ms...');
          fetchingProfile.current = false;
          await new Promise(resolve => setTimeout(resolve, 500));
          return fetchProfile(userId, userEmail, retryCount + 1);
        }

        // Criar perfil se nao existir
        console.log('[Auth] Perfil nao encontrado, criando...');

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail || '',
            full_name: 'Usuario',
            has_full_access: true,
            role: 'user'
          })
          .select()
          .single();

        if (insertError) {
          console.error('[Auth] Erro ao criar perfil:', insertError);
          fetchingProfile.current = false;
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
        fetchingProfile.current = false;
        return newProfile as Profile;
      }

      console.log('[Auth] Perfil encontrado:', data?.email);
      fetchingProfile.current = false;
      return data as Profile;
    } catch (error) {
      console.error('[Auth] Erro ao buscar perfil:', error);
      fetchingProfile.current = false;
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
    if (user?.id && !fetchingProfile.current) {
      const profileData = await fetchProfile(user.id, user.email);
      if (profileData) {
        setProfile(profileData);
      }
    }
  };

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('[Auth] Iniciando...');

        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[Auth] Erro ao buscar sessao:', sessionError);
        }

        console.log('[Auth] Sessao existente:', !!existingSession);

        if (mounted && existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);

          const profileData = await fetchProfile(existingSession.user.id, existingSession.user.email);
          if (profileData) {
            setProfile(profileData);
          }
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Auth] Evento:', event);

        if (!mounted) return;

        if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] Token refreshed - actualizando sessao');
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
          }
          return;
        }

        if (event === 'SIGNED_OUT') {
          console.log('[Auth] Signed out - limpando estado');
          setSession(null);
          setUser(null);
          setProfile(null);
          lastFetchedUserId.current = null;
          setLoading(false);
          return;
        }

        if (newSession?.user) {
          setSession(newSession);
          setUser(newSession.user);

          // Nao bloquear - buscar perfil em background
          if (newSession.user.id !== lastFetchedUserId.current || !profile) {
            // Pequeno delay para garantir que a sessao foi propagada
            setTimeout(async () => {
              const profileData = await fetchProfile(newSession.user.id, newSession.user.email);
              if (profileData && mounted) {
                setProfile(profileData);
              }
            }, 100);
          }
          
          // Definir loading como false imediatamente
          setLoading(false);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          lastFetchedUserId.current = null;
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
    setUser(null);
    setSession(null);
    lastFetchedUserId.current = null;
    fetchingProfile.current = false;
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
