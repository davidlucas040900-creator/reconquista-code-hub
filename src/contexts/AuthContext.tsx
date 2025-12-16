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

  const createDefaultProfile = useCallback((userId: string, userEmail?: string): Profile => ({
    id: userId,
    email: userEmail || '',
    full_name: 'Usuario',
    whatsapp: null,
    has_full_access: true,
    role: 'user',
    avatar_url: null
  }), []);

  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile | null> => {
    if (fetchingProfile.current && lastFetchedUserId.current === userId) return null;

    fetchingProfile.current = true;
    lastFetchedUserId.current = userId;

    try {
      console.log('[Auth] Buscando perfil:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      fetchingProfile.current = false;

      if (error || !data) {
        console.log('[Auth] Perfil nao encontrado, usando padrao');
        return createDefaultProfile(userId, userEmail);
      }

      console.log('[Auth] Perfil encontrado:', data.email);
      return data as Profile;
    } catch (error) {
      fetchingProfile.current = false;
      return createDefaultProfile(userId, userEmail);
    }
  }, [createDefaultProfile]);

  const refreshProfile = useCallback(async () => {
    if (user?.id && !fetchingProfile.current) {
      const profileData = await fetchProfile(user.id, user.email);
      if (profileData) setProfile(profileData);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('[Auth] Iniciando...');
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        console.log('[Auth] Sessao existente:', !!existingSession);

        if (mounted && existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          const profileData = await fetchProfile(existingSession.user.id, existingSession.user.email);
          if (profileData && mounted) setProfile(profileData);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // IGNORAR COMPLETAMENTE TOKEN_REFRESHED
      if (event === 'TOKEN_REFRESHED') {
        return; // NAO FAZER NADA
      }

      console.log('[Auth] Evento:', event);
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        lastFetchedUserId.current = null;
        setLoading(false);
        return;
      }

      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        setLoading(false);

        if (newSession.user.id !== lastFetchedUserId.current) {
          const profileData = await fetchProfile(newSession.user.id, newSession.user.email);
          if (profileData && mounted) setProfile(profileData);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = useCallback(async () => {
    setProfile(null);
    setUser(null);
    setSession(null);
    lastFetchedUserId.current = null;
    fetchingProfile.current = false;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
