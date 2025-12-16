"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
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
  const lastTokenRefresh = useRef<number>(0);
  const tokenRefreshCount = useRef<number>(0);

  const createDefaultProfile = useCallback((userId: string, userEmail?: string): Profile => {
    return {
      id: userId,
      email: userEmail || '',
      full_name: 'Usuario',
      whatsapp: null,
      has_full_access: true,
      role: 'user',
      avatar_url: null
    };
  }, []);

  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile | null> => {
    if (fetchingProfile.current && lastFetchedUserId.current === userId) {
      console.log('[Auth] Ja buscando perfil, ignorando...');
      return null;
    }

    fetchingProfile.current = true;
    lastFetchedUserId.current = userId;

    try {
      console.log('[Auth] Buscando perfil para:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.log('[Auth] Erro ao buscar perfil:', error.message);
        fetchingProfile.current = false;
        return createDefaultProfile(userId, userEmail);
      }

      if (!data) {
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
          .maybeSingle();

        if (insertError) {
          console.error('[Auth] Erro ao criar perfil:', insertError);
          fetchingProfile.current = false;
          return createDefaultProfile(userId, userEmail);
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
      return createDefaultProfile(userId, userEmail);
    }
  }, [createDefaultProfile]);

  const refreshProfile = useCallback(async () => {
    if (user?.id && !fetchingProfile.current) {
      const profileData = await fetchProfile(user.id, user.email);
      if (profileData) {
        setProfile(profileData);
      }
    }
  }, [user, fetchProfile]);

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
          if (profileData && mounted) {
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

        // Protecao contra loop de TOKEN_REFRESHED
        if (event === 'TOKEN_REFRESHED') {
          const now = Date.now();
          const timeSinceLastRefresh = now - lastTokenRefresh.current;
          
          // Se refresh aconteceu ha menos de 5 segundos, ignorar
          if (timeSinceLastRefresh < 5000) {
            tokenRefreshCount.current++;
            console.log('[Auth] Token refresh ignorado (muito rapido):', tokenRefreshCount.current);
            
            // Se houver mais de 3 refreshes em sequencia, parar
            if (tokenRefreshCount.current > 3) {
              console.log('[Auth] Muitos refreshes, parando loop');
              return;
            }
          } else {
            tokenRefreshCount.current = 0;
          }
          
          lastTokenRefresh.current = now;
          
          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
          }
          return;
        }

        // Reset contador em outros eventos
        tokenRefreshCount.current = 0;

        if (event === 'SIGNED_OUT') {
          console.log('[Auth] Signed out - limpando estado');
          setSession(null);
          setUser(null);
          setProfile(null);
          lastFetchedUserId.current = null;
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          if (newSession?.user) {
            setSession(newSession);
            setUser(newSession.user);
            setLoading(false);

            // Buscar perfil em background apenas se nao temos
            if (newSession.user.id !== lastFetchedUserId.current) {
              setTimeout(async () => {
                if (!mounted) return;
                const profileData = await fetchProfile(newSession.user.id, newSession.user.email);
                if (profileData && mounted) {
                  setProfile(profileData);
                }
              }, 100);
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, whatsapp: string) => {
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
  }, []);

  const signOut = useCallback(async () => {
    setProfile(null);
    setUser(null);
    setSession(null);
    lastFetchedUserId.current = null;
    fetchingProfile.current = false;
    tokenRefreshCount.current = 0;
    await supabase.auth.signOut();
  }, []);

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
