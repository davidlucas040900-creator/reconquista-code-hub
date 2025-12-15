// src/pages/SemAcesso.tsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Crown, Lock, ExternalLink, LogOut, MessageCircle } from 'lucide-react';

const SemAcesso = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Icone */}
        <div className="relative inline-flex">
          <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Lock className="w-10 h-10 text-amber-500" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[#0A0A0B] border-4 border-[#0A0A0B] flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">
            Acesso Restrito
          </h1>
          <p className="text-gray-400">
            Voce ainda nao tem acesso ao conteudo premium.
          </p>
          {user?.email && (
            <p className="text-gray-500 text-sm">
              Logado como: {user.email}
            </p>
          )}
        </div>

        {/* Card de Oferta */}
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Desbloqueie seu acesso completo
          </h3>
          <ul className="text-left space-y-2">
            {[
              'Acesso a todos os modulos',
              'Materiais exclusivos em PDF',
              'Suporte prioritario',
              'Atualizacoes gratuitas'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          
          <Button
            onClick={() => window.open('https://lfrfranciscoflavio.lojou.com.br', '_blank')}
            className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Adquirir Acesso
          </Button>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4">
          <a
            href="https://wa.me/258849999999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-amber-500 hover:text-amber-400 text-sm transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Ja comprou? Fale com o suporte
          </a>
          
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 text-gray-500 hover:text-white text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SemAcesso;
