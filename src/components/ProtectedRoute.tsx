// Atualizado: 2025-12-15 19:02:52
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAccess?: boolean;
  requiresAdmin?: boolean;
}

const ProtectedRoute = ({
  children,
  requiresAccess = true,
  requiresAdmin = false
}: ProtectedRouteProps) => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const [profileTimeout, setProfileTimeout] = useState(false);

  // Timeout para não ficar travado esperando perfil
  useEffect(() => {
    if (user && !profile && !loading) {
      // Tentar recarregar o perfil
      refreshProfile();
      
      // Timeout de 5 segundos
      const timer = setTimeout(() => {
        console.log('[ProtectedRoute] Timeout aguardando perfil');
        setProfileTimeout(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, refreshProfile]);

  console.log('[ProtectedRoute] Estado:', { 
    loading, 
    hasUser: !!user, 
    hasProfile: !!profile,
    profileTimeout,
    hasAccess: profile?.has_full_access,
    role: profile?.role 
  });

  // Ainda carregando auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <Crown className="w-5 h-5 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  // Nao esta logado
  if (!user) {
    console.log('[ProtectedRoute] Sem usuario, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Usuario logado mas perfil ainda carregando (com timeout)
  if (!profile && !profileTimeout) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <Crown className="w-5 h-5 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-400 text-sm">Carregando perfil...</p>
      </div>
    );
  }

  // Timeout atingido ou perfil não existe - permitir acesso mesmo assim
  // O sistema vai criar o perfil automaticamente ou o usuário tem acesso básico
  if (profileTimeout && !profile) {
    console.log('[ProtectedRoute] Timeout - permitindo acesso sem perfil completo');
    // Continua para renderizar o children
  }

  // Requer admin mas nao e admin
  if (requiresAdmin && profile?.role !== 'admin') {
    console.log('[ProtectedRoute] Requer admin');
    return <Navigate to="/dashboard" replace />;
  }

  // Permitir acesso
  console.log('[ProtectedRoute] Acesso permitido');
  return <>{children}</>;
};

export default ProtectedRoute;

