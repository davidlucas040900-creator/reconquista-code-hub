// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Crown } from 'lucide-react';

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

  // Ainda carregando
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
    return <Navigate to="/login" replace />;
  }

  // Requer admin mas nao e admin
  if (requiresAdmin && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Esta logado mas nao tem acesso pago (e a rota requer acesso)
  if (requiresAccess && !profile?.has_full_access && profile?.role !== 'admin') {
    return <Navigate to="/sem-acesso" replace />;
  }

  // Tudo ok
  return <>{children}</>;
};

export default ProtectedRoute;
