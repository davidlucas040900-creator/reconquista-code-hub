// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Crown } from 'lucide-react';

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
  const { user, profile, loading } = useAuth();

  console.log('[ProtectedRoute] Estado:', { 
    loading, 
    hasUser: !!user, 
    hasProfile: !!profile,
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
    console.log('[ProtectedRoute] Usuario nao logado, redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  // Usuario logado mas perfil ainda carregando
  if (!profile) {
    console.log('[ProtectedRoute] Perfil ainda carregando...');
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <Crown className="w-5 h-5 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="absolute mt-24 text-gray-400 text-sm">Carregando perfil...</p>
      </div>
    );
  }

  // Requer admin mas nao e admin
  if (requiresAdmin && profile.role !== 'admin') {
    console.log('[ProtectedRoute] Requer admin, redirecionando para /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Usuario com acesso - permitir
  // NOTA: Removemos o redirecionamento para /sem-acesso
  // O controle de acesso por curso e feito nas paginas especificas
  console.log('[ProtectedRoute] Acesso permitido!');
  return <>{children}</>;
};

export default ProtectedRoute;
